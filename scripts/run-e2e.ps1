# E2E wrapper: the API server MUST boot against alotrojah_verify, never dev.
# Playwright's webServer.env proved unreliable when a server is reused, so this
# script swaps the backend .env deterministically (backup -> verify -> run ->
# restore even on failure). Usage: npm run e2e -- <playwright args>
$ErrorActionPreference = 'Stop'
$backend = 'C:\Users\devtips\Documents\AlOtrojah\alotrojah_Backend'
$envFile = Join-Path $backend '.env'
$bakFile = Join-Path $backend '.env.e2eautoswap'

try {
  Copy-Item $envFile $bakFile -Force
  (Get-Content $envFile) -replace '^DB_DATABASE=.*', 'DB_DATABASE=alotrojah_verify' |
    Set-Content $envFile
  $db = Select-String -Path $envFile -Pattern '^DB_DATABASE=' | Select-Object -First 1
  Write-Host "e2e: backend DB -> $db"
  if ("$db" -notlike '*alotrojah_verify*') { throw 'DB swap failed, aborting (dev must never be touched by e2e).' }
  & npx playwright test @args
  exit $LASTEXITCODE
} finally {
  if (Test-Path $bakFile) {
    Move-Item $bakFile $envFile -Force
    Write-Host 'e2e: backend .env restored.'
  }
}
