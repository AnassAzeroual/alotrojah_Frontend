# Bootstrap e2e wrapper: the API server MUST boot against alotrojah_bootstrap,
# the admin-only "empty" database — never dev, never the canonical seeded
# alotrojah_verify the main suite uses.
#
# Same swap/restore contract as scripts/run-e2e.ps1 (backup -> swap -> run ->
# restore even on failure). Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/run-bootstrap-e2e.ps1 e2e/bootstrap-flow.e2e.ts
#
# IMPORTANT: playwright.config.ts reuses an already-running :8000 server
# (reuseExistingServer: true). A stale artisan holding alotrojah_verify would
# serve the WRONG data — make sure no :8000 process is running before this.
$ErrorActionPreference = 'Stop'
$backend = 'C:\Users\devtips\Documents\AlOtrojah\alotrojah_Backend'
$envFile = Join-Path $backend '.env'
$bakFile = Join-Path $backend '.env.bootautoswap'

try {
  Copy-Item $envFile $bakFile -Force
  (Get-Content $envFile) -replace '^DB_DATABASE=.*', 'DB_DATABASE=alotrojah_bootstrap' |
    Set-Content $envFile
  $db = Select-String -Path $envFile -Pattern '^DB_DATABASE=' | Select-Object -First 1
  Write-Host "e2e: backend DB -> $db"
  if ("$db" -notlike '*alotrojah_bootstrap*') { throw 'DB swap failed, aborting.' }
  & npx playwright test @args
  exit $LASTEXITCODE
}
finally {
  if (Test-Path $bakFile) {
    Move-Item $bakFile $envFile -Force
    Write-Host 'e2e: backend .env restored.'
  }
}
