# Usage: .\screenshot.ps1 http://localhost:3000/page.html [label] [width] [height]
# Saves to ".\temporary screenshots\screenshot-N[-label].png" using headless Edge.
param([string]$Url = "http://localhost:3000", [string]$Label = "", [int]$Width = 1350, [int]$Height = 3800)
$dir = Join-Path $PSScriptRoot "temporary screenshots"
New-Item -ItemType Directory -Force $dir | Out-Null
$n = 1
while (Get-ChildItem $dir -Filter "screenshot-$n*.png" -ErrorAction SilentlyContinue) { $n++ }
$name = "screenshot-$n" + $(if ($Label) { "-$Label" } else { "" }) + ".png"
$out = Join-Path $dir $name
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$profile = Join-Path $env:TEMP "puresight-edge-profile"
& $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$profile" --virtual-time-budget=4000 --window-size="$Width,$Height" --screenshot="$out" $Url 2>$null | Out-Null
Start-Sleep -Milliseconds 300
Write-Host $out
