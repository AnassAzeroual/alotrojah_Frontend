# E2E wrapper: swaps the backend .env to the right test database before
# Playwright and restores it in finally (even on failure). One script, two DB
# targets picked automatically from the arguments:
#
#   verify (default)       DB_DATABASE=alotrojah_verify
#   bootstrap (automatic)  DB_DATABASE=alotrojah_bootstrap, rebuilt right
#                          before the run by scripts/provision-bootstrap-db.ps1
#
# Bootstrap mode is chosen when the spec arguments include
# e2e/bootstrap-flow.e2e.ts - that spec asserts an EMPTY starting DB and then
# builds a whole first-run world, so the seeded verify DB can never satisfy it
# (and vice versa: the bootstrap spec must run alone). Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/run-e2e.ps1 e2e/bootstrap-flow.e2e.ts
# A bare invocation (no arguments at all) defaults to the verify batch - every
# spec except bootstrap-flow - because a bare `playwright test` would collect
# the bootstrap spec too and fail it against the wrong DB. Pass explicit specs
# for anything narrower.
#
# Playwright's webServer.env proved unreliable when a server is reused, so this
# script swaps the backend .env deterministically (backup -> run -> restore,
# with a pre-run DB name check). NOTE: playwright.config.ts reuses an
# already-running :8000 server (reuseExistingServer: true) - a stale artisan
# holding another DB would serve the WRONG data, so make sure no :8000 process
# is running before a run (the e2e menu's guard does this for you).
#
# The CLI is invoked as `node node_modules/@playwright/test/cli.js` DIRECTLY,
# not via `npx playwright`: under `npm run`, PATH resolves `npx` to
# nvm-windows' npx.ps1 shim (npm 11), whose "-Command" branch re-parses the
# caller's source line and drops splatted arguments - Playwright then received
# a bare `test` and ran ALL specs without the requested files/flags.
$ErrorActionPreference = 'Stop'
$backend = 'C:\Users\devtips\Documents\AlOtrojah\alotrojah_Backend'
$envFile = Join-Path $backend '.env'
$root = Split-Path $PSScriptRoot -Parent
$playwrightCli = Join-Path $root 'node_modules\@playwright\test\cli.js'
if (-not (Test-Path $playwrightCli)) { throw "Playwright CLI not found: $playwrightCli" }

$bootstrapSpec = 'bootstrap-flow.e2e.ts'
$playwrightArgs = @($args)
$isBootstrap = @($playwrightArgs | Where-Object { $_ -match '(^|[\\/])bootstrap-flow\.e2e\.ts$' }).Count -gt 0
$specsInArgs = @($playwrightArgs | Where-Object { $_ -match '\.e2e\.ts$' })
if ($isBootstrap -and $specsInArgs.Count -gt 1) {
  throw "bootstrap-flow.e2e.ts must run alone (it needs alotrojah_bootstrap); run the verify specs and the bootstrap spec as separate invocations (the menu's ALL flow does exactly that)."
}
if ($isBootstrap) {
  $dbTarget = 'alotrojah_bootstrap'
  $bakFile = Join-Path $backend '.env.bootautoswap'
}
else {
  $dbTarget = 'alotrojah_verify'
  $bakFile = Join-Path $backend '.env.e2eautoswap'
  if ($playwrightArgs.Count -eq 0) {
    $playwrightArgs = @(
      Get-ChildItem (Join-Path $root 'e2e') -Filter '*.e2e.ts' -File |
        Where-Object { $_.Name -ne $bootstrapSpec } |
        Sort-Object Name |
        ForEach-Object { "e2e/$($_.Name)" }
    )
  }
}

try {
  Copy-Item $envFile $bakFile -Force
  (Get-Content $envFile) -replace '^DB_DATABASE=.*', "DB_DATABASE=$dbTarget" |
    Set-Content $envFile
  $db = Select-String -Path $envFile -Pattern '^DB_DATABASE=' | Select-Object -First 1
  Write-Host "e2e: backend DB -> $db"
  if ("$db" -notlike "*$dbTarget*") { throw "DB swap failed, aborting (expected $dbTarget - dev must never be touched by e2e)." }
  if ($isBootstrap) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'provision-bootstrap-db.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'bootstrap DB provisioning failed, aborting.' }
  }
  & node $playwrightCli test @playwrightArgs
  exit $LASTEXITCODE
}
finally {
  if (Test-Path $bakFile) {
    Move-Item $bakFile $envFile -Force
    Write-Host 'e2e: backend .env restored.'
  }
}
