# Fresh-provision alotrojah_bootstrap - the admin-only near-empty DB that
# e2e/bootstrap-flow.e2e.ts requires. That spec asserts an EMPTY starting state
# (centers/seasons/groups = 0) and then BUILDS a whole first-run world, so every
# run needs a fresh DB; called by run-e2e.ps1 whenever the run is routed to
# alotrojah_bootstrap (also standalone-usable for a one-off provision).
#
# Recipe (backend docs/Agent.md DB section): drop + create + grant -> schema dump ->
# migrations 000011 -> latest (reference data: levels, scoring modules,
# quran_verses 6236) -> strip the dump's legacy demo rows -> admin
# password123 -> assert the near-empty contract.
#
# Notes:
# - ONLY touches alotrojah_bootstrap. Never dev/verify/audit/testing.
# - artisan runs with a scoped DB_DATABASE, so the backend .env is untouched
#   (the verify rebuild uses the same pattern) - safe to run while .env is dev.
# - The dump is NOT schema-only: it ships legacy demo rows (1 demo center,
#   1 academic season, 6 terms, the admin with NULL hash) - the demo rows are
#   deleted, the admin is kept and gets password123.
# - MySQL failures obey R7: stop and report, never retry loop.
$ErrorActionPreference = 'Stop'

$backend = 'C:\Users\devtips\Documents\AlOtrojah\alotrojah_Backend'
$dump = Join-Path $backend 'docs\database\quran_memorization_db.sql'
$target = 'alotrojah_bootstrap'
$adminEmail = 'admin@example.org'
$adminPass = 'password123'

if ($target -ne 'alotrojah_bootstrap') { throw 'Guard: this script may only provision alotrojah_bootstrap.' }
if (-not (Test-Path $dump)) { throw "Schema dump not found: $dump" }

# mysql client: PATH first, then Laragon's bin.
$mysql = $null
$cmd = Get-Command mysql.exe -ErrorAction SilentlyContinue
if ($cmd) { $mysql = $cmd.Source }
if (-not $mysql) {
  $found = Get-ChildItem 'C:\laragon\bin\mysql\*\bin\mysql.exe' -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending | Select-Object -First 1
  if ($found) { $mysql = $found.FullName }
}
if (-not $mysql) { throw 'mysql.exe not found on PATH or under C:\laragon\bin\mysql.' }

Write-Host "[bootstrap-db] drop + create + grant $target"
& $mysql -u root -e "DROP DATABASE IF EXISTS $target; CREATE DATABASE $target CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON $target.* TO 'alotrojah'@'localhost'; FLUSH PRIVILEGES;"
if ($LASTEXITCODE -ne 0) { throw 'create/grant failed.' }

Write-Host '[bootstrap-db] import schema dump (utf8mb4 via cmd redirection)'
cmd /c "`"$mysql`" -u root --default-character-set=utf8mb4 $target < `"$dump`""
if ($LASTEXITCODE -ne 0) { throw 'schema import failed.' }

Write-Host '[bootstrap-db] migrations 000011 -> latest (scoped DB_DATABASE)'
Push-Location $backend
try {
  $env:DB_DATABASE = $target
  $migs = Get-ChildItem 'database\migrations\*.php' |
    Where-Object { $_.Name -match '_(\d{6})_' -and [int]$Matches[1] -ge 11 } |
    Sort-Object Name
  if ($migs.Count -eq 0) { throw 'no migrations 000011+ found.' }
  foreach ($m in $migs) {
    php artisan migrate --path="database/migrations/$($m.Name)" --force
    if ($LASTEXITCODE -ne 0) { throw "migration failed: $($m.Name)" }
  }
} finally {
  Remove-Item Env:\DB_DATABASE -ErrorAction SilentlyContinue
  Pop-Location
}

Write-Host '[bootstrap-db] strip the dump legacy demo rows (1 center, 1 season, 6 terms)'
& $mysql -u root -e "DELETE FROM $target.terms; DELETE FROM $target.academic_seasons; DELETE FROM $target.centers;"
if ($LASTEXITCODE -ne 0) { throw 'demo-row cleanup failed.' }

Write-Host "[bootstrap-db] admin $adminEmail -> $adminPass"
$php = '$h = password_hash(''__PASS__'', PASSWORD_BCRYPT); if (!password_verify(''__PASS__'', $h)) { exit(1); } echo $h;'.Replace('__PASS__', $adminPass)
$hash = (& php -r $php).Trim()
if ($LASTEXITCODE -ne 0 -or -not $hash) { throw 'bcrypt generation failed.' }
& $mysql -u root -e "UPDATE $target.users SET password_hash='$hash' WHERE email='$adminEmail';"
if ($LASTEXITCODE -ne 0) { throw 'password reset failed.' }

Write-Host '[bootstrap-db] assert the near-empty contract'
$checks = [ordered]@{
  users = 1
  centers = 0
  academic_seasons = 0
  terms = 0
  groups = 0
  students = 0
  registration_requests = 0
  levels = 3
  quran_verses = 6236
  scoring_modules = 5
}
foreach ($k in $checks.Keys) {
  $n = (& $mysql -u root -N -B -e "SELECT COUNT(*) FROM $target.$k;").Trim()
  if ($LASTEXITCODE -ne 0) { throw "count query failed: $k" }
  if ([int]$n -ne $checks[$k]) { throw "assertion failed: $k = $n (want $($checks[$k]))" }
}
$hex = (& $mysql -u root -N -B -e "SELECT HEX(name_ar) FROM $target.levels WHERE code='L1' LIMIT 1;").Trim()
if ($hex -notlike 'D8A7*') { throw "Arabic HEX check failed: $hex" }
$withHash = (& $mysql -u root -N -B -e "SELECT COUNT(*) FROM $target.users WHERE email='$adminEmail' AND password_hash IS NOT NULL;").Trim()
if ([int]$withHash -ne 1) { throw 'admin password hash missing.' }

Write-Host "[bootstrap-db] OK: $target is admin-only and near-empty."
