# E2E wrapper: the API server MUST boot against alotrojah_verify, never dev.
# Playwright's webServer.env proved unreliable when a server is reused, so this
# script swaps the backend .env deterministically (backup -> verify -> run ->
# restore even on failure). Usage: npm run e2e -- <playwright args>
#
# The CLI is invoked as `node node_modules/@playwright/test/cli.js` DIRECTLY,
# not via `npx playwright`: under `npm run`, PATH resolves `npx` to
# nvm-windows' npx.ps1 shim (npm 11), whose "-Command" branch re-parses the
# caller's source line and drops splatted arguments - Playwright then received
# a bare `test` and ran ALL specs without the requested files/flags.
$ErrorActionPreference = 'Stop'
$backend = 'C:\Users\devtips\Documents\AlOtrojah\alotrojah_Backend'
$envFile = Join-Path $backend '.env'
$bakFile = Join-Path $backend '.env.e2eautoswap'
$root = Split-Path $PSScriptRoot -Parent
$playwrightCli = Join-Path $root 'node_modules\@playwright\test\cli.js'
if (-not (Test-Path $playwrightCli)) { throw "Playwright CLI not found: $playwrightCli" }

try {
  Copy-Item $envFile $bakFile -Force
  (Get-Content $envFile) -replace '^DB_DATABASE=.*', 'DB_DATABASE=alotrojah_verify' |
    Set-Content $envFile
  $db = Select-String -Path $envFile -Pattern '^DB_DATABASE=' | Select-Object -First 1
  Write-Host "e2e: backend DB -> $db"
  if ("$db" -notlike '*alotrojah_verify*') { throw 'DB swap failed, aborting (dev must never be touched by e2e).' }
  & node $playwrightCli test @args
  exit $LASTEXITCODE
} finally {
  if (Test-Path $bakFile) {
    Move-Item $bakFile $envFile -Force
    Write-Host 'e2e: backend .env restored.'
  }
}
