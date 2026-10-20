$ErrorActionPreference = 'Stop'
$root = 'C:\Users\DELL\OneDrive\Documents\New OpenCode Project'
$src  = 'C:\Users\DELL\AppData\Local\Temp\opencode\cs\posts.json'
$media = Join-Path $root 'public\media'
$brand = Join-Path $root 'public\brand'
New-Item -ItemType Directory -Force -Path $media, $brand | Out-Null

$posts = Get-Content $src -Raw | ConvertFrom-Json
$manifest = @()

foreach ($p in $posts) {
  foreach ($m in $p.media) {
    $ext = if ($m.type -eq 'video' -or $m.type -eq 'animated_gif') { 'mp4' }
           elseif ($m.url -match '\.png') { 'png' } else { 'jpg' }
    $prefix = if ($m.type -eq 'photo') { 'photo' } else { 'video' }
    $file = "$prefix-$($p.id).$ext"
    $dest = Join-Path $media $file
    $thumb = "thumb-$($p.id).jpg"
    $thumbDest = Join-Path $media $thumb

    if (-not (Test-Path $dest)) {
      $url = $m.url
      if ($prefix -eq 'photo') { $url = "$($m.url)?name=large" }
      try {
        Invoke-WebRequest -Uri $url -OutFile $dest -TimeoutSec 60 -UseBasicParsing -UserAgent 'Mozilla/5.0'
      } catch { Write-Host "FAIL $url"; continue }
    }

    $thumbOk = $false
    if (Test-Path $thumbDest) { $thumbOk = $true }
    elseif ($m.type -eq 'photo') {
      try {
        Invoke-WebRequest -Uri "$($m.url)?name=medium" -OutFile $thumbDest -TimeoutSec 60 -UseBasicParsing -UserAgent 'Mozilla/5.0'
        $thumbOk = $true
      } catch { $thumbOk = $false }
    }
    if (-not $thumbOk -and $m.poster) {
      try {
        Invoke-WebRequest -Uri "$($m.poster)?name=medium" -OutFile $thumbDest -TimeoutSec 60 -UseBasicParsing -UserAgent 'Mozilla/5.0'
        $thumbOk = $true
      } catch {}
    }

    $manifest += [pscustomobject]@{
      id = $p.id
      kind = $prefix
      file = "/media/$file"
      thumb = $(if ($thumbOk) { "/media/$thumb" } else { "/media/$file" })
    }
  }
}

$manifest | ConvertTo-Json -Depth 4 | Out-File (Join-Path $root 'media-manifest.json') -Encoding utf8
"downloaded entries: $($manifest.Count)"
"files: $((Get-ChildItem $media).Count)"
"total MB: $([math]::Round(((Get-ChildItem $media | Measure-Object Length -Sum).Sum/1MB),2))"
