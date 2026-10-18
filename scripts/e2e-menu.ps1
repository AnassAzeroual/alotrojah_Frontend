# Interactive e2e menu.
#
# Each run asks for a mode: headless (default), headed (a maximized visible
# browser), or the Playwright UI (--ui + --headed). The two visible modes then
# ask how slow to run: fast, slow (500 ms per action, default) or very slow
# (1500 ms), so the clicks can be watched step by step (a custom millisecond
# value can be typed too). UI mode does NOT auto-run: pick a test and press
# play in the UI; the chosen speed applies to the runs you start there. UI mode
# keeps the backend on the test DB until you close it.
#
# Slow motion is NOT a CLI flag (Playwright has no --slow-mo): the menu exports
# E2E_SLOW_MO=<ms> for the chosen run, and playwright.config.ts reads it into
# use.launchOptions.slowMo. Headless runs clear the variable. The watch modes
# (2 and 3) also export E2E_MAXIMIZED=1, which drops the fixed viewport and
# starts Chromium maximized (config: viewport null + --start-maximized).
#
# DB contract:
#   - the backend .env is forced back to DB_DATABASE=alotrojah_dev after every
#     run and again on quit (the wrappers restore their own backup first)
#   - verify runs go through run-e2e.ps1 (DB -> alotrojah_verify)
#   - bootstrap-flow.e2e.ts goes through the same run-e2e.ps1, which
#     auto-detects it and switches to alotrojah_bootstrap (re-provisioned
#     first); that spec asserts an EMPTY starting DB and can never pass
#     against the seeded verify DB
#
# A backend already listening on :8000 blocks the run: playwright.config.ts
# reuses an existing server (reuseExistingServer: true), so the .env swap would
# never reach it — the classic way e2e rows leak into alotrojah_dev.
# The block offers to stop the server ONLY when it is php.exe, ONLY after an
# explicit "y" (default is No). The dev backend stays down until you restart it.
#
# Usage:
#   npm run e2e:menu
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-menu.ps1
$ErrorActionPreference = 'Stop'

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$backend = Join-Path (Split-Path $root -Parent) 'alotrojah_Backend'
$envFile = Join-Path $backend '.env'
$runner = Join-Path $PSScriptRoot 'run-e2e.ps1'
$bootstrapSpec = 'bootstrap-flow.e2e.ts'

foreach ($required in @($envFile, $runner)) {
  if (-not (Test-Path $required)) { throw "Missing required path: $required" }
}

$script:lastStatus = $null
$script:lastStatusColour = 'Gray'
$script:runSlowMo = 0
$script:runMaximized = $false

function Get-DbName {
  $line = Select-String -Path $envFile -Pattern '^DB_DATABASE=' | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line.Line -replace '^DB_DATABASE=', '').Trim()
}

function Set-DbName([string]$name) {
  (Get-Content $envFile) -replace '^DB_DATABASE=.*', "DB_DATABASE=$name" | Set-Content $envFile
}

function Restore-DevDb {
  $current = Get-DbName
  if ($current -eq 'alotrojah_dev') {
    Write-Host '  [db] at rest: alotrojah_dev' -ForegroundColor DarkGray
    return
  }
  Write-Host "  [db] restoring .env: $current -> alotrojah_dev" -ForegroundColor Yellow
  Set-DbName 'alotrojah_dev'
  $after = Get-DbName
  if ($after -ne 'alotrojah_dev') {
    throw "Could not restore .env to alotrojah_dev (found '$after')."
  }
  Write-Host '  [db] restored: alotrojah_dev' -ForegroundColor Green
}

function Assert-BackendPortFree {
  $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $conn) { return $true }
  $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
  $label = if ($proc) { "$($proc.ProcessName) (PID $($conn.OwningProcess))" } else { "PID $($conn.OwningProcess)" }
  Write-Host ''
  Write-Host "  BLOCKED: 127.0.0.1:8000 is already in use by $label." -ForegroundColor Red
  Write-Host '  Playwright would reuse that server, so the DB swap would never apply.' -ForegroundColor Yellow

  if (-not ($proc -and $proc.ProcessName -eq 'php')) {
    $script:lastStatus = "blocked: :8000 busy ($label) - not a php process, stop it manually"
    $script:lastStatusColour = 'Red'
    Write-Host '  Not a php process - refusing to stop it automatically. Stop it manually.' -ForegroundColor Red
    return $false
  }

  try { $answer = Read-Host "  Stop php (PID $($conn.OwningProcess)) and continue? [y/N]" }
  catch { $answer = '' }
  if ($answer -notmatch '^(y|yes)$') {
    $script:lastStatus = "blocked: :8000 busy (php PID $($conn.OwningProcess)) - declined to stop it"
    $script:lastStatusColour = 'Yellow'
    return $false
  }

  Write-Host "  Stopping php (PID $($conn.OwningProcess))..." -ForegroundColor Yellow
  & taskkill.exe /PID $conn.OwningProcess /T /F | Out-Null
  $still = $conn
  $deadline = (Get-Date).AddSeconds(5)
  do {
    Start-Sleep -Milliseconds 250
    $still = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
  } while ($still -and (Get-Date) -lt $deadline)

  if ($still) {
    $script:lastStatus = "could not free :8000 after stopping php (PID $($conn.OwningProcess))"
    $script:lastStatusColour = 'Red'
    Write-Host '  Could not free :8000 - another listener is still there.' -ForegroundColor Red
    return $false
  }

  $script:lastStatus = "stopped php (PID $($conn.OwningProcess)) - restart your dev backend after e2e"
  $script:lastStatusColour = 'Yellow'
  Write-Host '  :8000 is free. Restart your dev backend when e2e is done.' -ForegroundColor Yellow
  return $true
}

function Warn-FrontendPort {
  $conn = Get-NetTCPConnection -LocalPort 4201 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($conn) {
    Write-Host '  Note: :4201 is already in use; Playwright will reuse that frontend server.' -ForegroundColor Yellow
  }
}

function Invoke-Runner([string]$runner, [string[]]$playwrightArgs) {
  if (-not (Assert-BackendPortFree)) { return $null }
  Warn-FrontendPort
  # No --slow-mo CLI flag exists; the config reads E2E_SLOW_MO instead. Set it
  # to the chosen speed and clear it otherwise so a later fast run stays fast.
  # E2E_MAXIMIZED rides along for the watch modes (headed + UI).
  if ($script:runSlowMo -gt 0) { $env:E2E_SLOW_MO = "$($script:runSlowMo)" }
  else { Remove-Item Env:E2E_SLOW_MO -ErrorAction SilentlyContinue }
  if ($script:runMaximized) { $env:E2E_MAXIMIZED = '1' }
  else { Remove-Item Env:E2E_MAXIMIZED -ErrorAction SilentlyContinue }
  Write-Host ''
  Write-Host ("  Running: playwright test {0}" -f ($playwrightArgs -join ' ')) -ForegroundColor Cyan
  $code = 1
  try {
    # Out-Host keeps the child's stdout on screen; without it the assignment
    # below would capture every line into $code's function output.
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runner @playwrightArgs | Out-Host
    $code = $LASTEXITCODE
  }
  finally {
    Restore-DevDb
  }
  $script:lastStatus = "playwright exit code $code"
  $script:lastStatusColour = if ($code -eq 0) { 'Green' } else { 'Red' }
  return $code
}

function Read-SlowMo {
  Write-Host ''
  Write-Host '  Slow motion (how slow the browser acts between steps):' -ForegroundColor Cyan
  Write-Host '   [1] fast - no delay'
  Write-Host '   [2] slow - 500 ms per action (default)'
  Write-Host '   [3] very slow - 1500 ms per action'
  Write-Host '   (or type a custom milliseconds value, e.g. 1000)'
  try { $speed = Read-Host '  Speed' } catch { return 500 }
  if ($null -eq $speed) { return 500 }
  $speed = $speed.Trim()
  switch ($speed) {
    '1' { return 0 }
    '2' { return 500 }
    '3' { return 1500 }
    default {
      if ($speed -match '^\d+$') { return [int]$speed }
      return 500
    }
  }
}

function Read-RunMode {
  $script:runSlowMo = 0
  $script:runMaximized = $false
  Write-Host ''
  Write-Host '  Run mode:' -ForegroundColor Cyan
  Write-Host '   [1] headless (default, fast)'
  Write-Host '   [2] headed (maximized browser; then pick slow-motion speed)'
  Write-Host '   [3] UI (Playwright UI + visible browser; then pick slow-motion speed)'
  try { $mode = Read-Host '  Mode' } catch { return @() }
  if ($null -eq $mode) { return @() }
  $mode = $mode.Trim()
  if ($mode -eq '2' -or $mode -match '^(h|headed)$') {
    $script:runSlowMo = Read-SlowMo
    $script:runMaximized = $true
    return @('--headed')
  }
  if ($mode -eq '3' -or $mode -match '^(u|ui)$') {
    Write-Host '  UI mode does not auto-run: press the Run all button (above the test list) or a' -ForegroundColor Yellow
    Write-Host '  spec''s play button to start; the chosen slow motion applies to those runs.' -ForegroundColor Yellow
    $script:runSlowMo = Read-SlowMo
    $script:runMaximized = $true
    return @('--ui', '--headed')
  }
  return @()
}

$e2eDir = Join-Path $root 'e2e'
$specs = @(Get-ChildItem -Path $e2eDir -Filter '*.e2e.ts' -File | Sort-Object Name)
if ($specs.Count -eq 0) { throw "No e2e specs found in $e2eDir" }

$bootstrap = $specs | Where-Object { $_.Name -eq $bootstrapSpec } | Select-Object -First 1
$verifySpecs = @($specs | Where-Object { $_.Name -ne $bootstrapSpec })

Write-Host ''
Write-Host '=== AlOtrojah e2e runner ===' -ForegroundColor Cyan
Write-Host ("  {0} spec(s) found | DB now: {1}" -f $specs.Count, (Get-DbName))
Write-Host ("  verify runs use alotrojah_verify; {0} uses alotrojah_bootstrap" -f $bootstrapSpec)
if (-not $bootstrap) {
  Write-Host "  Warning: $bootstrapSpec not found; ALL will run the verify batch only." -ForegroundColor Yellow
}

try {
  Restore-DevDb
  while ($true) {
    Write-Host ''
    if ($script:lastStatus) {
      Write-Host ("  Last result: {0}" -f $script:lastStatus) -ForegroundColor $script:lastStatusColour
    }
    Write-Host '  Select a spec:' -ForegroundColor Cyan
    for ($i = 0; $i -lt $specs.Count; $i++) {
      $suffix = if ($specs[$i].Name -eq $bootstrapSpec) { '  (uses alotrojah_bootstrap)' } else { '' }
      Write-Host ("   [{0,2}] {1}{2}" -f ($i + 1), $specs[$i].Name, $suffix)
    }
    Write-Host '   [ 0] ALL specs (verify batch, then bootstrap-flow)' -ForegroundColor Green
    Write-Host '   [ q] Quit'

    try { $choice = Read-Host '  Choice' } catch { break }
    if ($null -eq $choice) { break }
    $choice = $choice.Trim()

    if ($choice -match '^(q|quit|exit)$') { break }

    if ($choice -eq '0') {
      $modeArgs = Read-RunMode
      if ($modeArgs -contains '--ui') {
        Write-Host '  UI mode: close the verify-batch UI when done; bootstrap-flow opens next.' -ForegroundColor Yellow
      }
      $batchArgs = @($verifySpecs | ForEach-Object { "e2e/$($_.Name)" }) + $modeArgs
      $verifyCode = Invoke-Runner $runner $batchArgs
      if ($null -eq $verifyCode) { continue }
      $colour = if ($verifyCode -eq 0) { 'Green' } else { 'Red' }
      Write-Host ("  verify batch exit code: {0}" -f $verifyCode) -ForegroundColor $colour
      if ($bootstrap) {
        $bootCode = Invoke-Runner $runner (@("e2e/$bootstrapSpec") + $modeArgs)
        if ($null -ne $bootCode) {
          $colour = if ($bootCode -eq 0) { 'Green' } else { 'Red' }
          Write-Host ("  bootstrap-flow exit code: {0}" -f $bootCode) -ForegroundColor $colour
        }
      }
      continue
    }

    if ($choice -match '^\d+$') {
      $index = [int]$choice
      if ($index -lt 1 -or $index -gt $specs.Count) {
        Write-Host '  Invalid number.' -ForegroundColor Red
        continue
      }
      $spec = $specs[$index - 1]
      $modeArgs = Read-RunMode
      $code = Invoke-Runner $runner (@("e2e/$($spec.Name)") + $modeArgs)
      if ($null -ne $code) {
        $colour = if ($code -eq 0) { 'Green' } else { 'Red' }
        Write-Host ("  exit code: {0}" -f $code) -ForegroundColor $colour
      }
      continue
    }

    Write-Host '  Invalid choice - enter a number, 0 for all, or q to quit.' -ForegroundColor Red
  }
}
finally {
  try { Restore-DevDb } catch {
    Write-Host "  [db] FAILED to restore: $($_.Exception.Message)" -ForegroundColor Red
    throw
  }
  Write-Host ''
  Write-Host 'Done. Backend .env is at alotrojah_dev.' -ForegroundColor Cyan
}
