Add-Type -AssemblyName System.Drawing

$root = Split-Path $MyInvocation.MyCommand.Path
$src  = Join-Path $root 'research\assets'
$out  = Join-Path $root 'public\assets'

foreach ($d in @('world','gallery','characters','icons','brand')) {
  $p = Join-Path $out $d
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

$encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()

function New-Params([int]$q) {
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$q)
  return $p
}

function Convert-Img {
  param([string]$inFile, [string]$outFile, [int]$width, [string]$format, [int]$quality = 85)
  if (-not (Test-Path $inFile)) { Write-Output "MISSING $inFile"; return }
  $img = [System.Drawing.Image]::FromFile($inFile)
  $w = $img.Width; $h = $img.Height
  if ($width -gt 0 -and $width -lt $w) { $h = [int][math]::Round($img.Height * ($width / $img.Width)); $w = $width }
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()
  if ($format -eq 'png') {
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $enc = $encoders | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $bmp.Save($outFile, $enc, (New-Params $quality))
  }
  $bmp.Dispose(); $img.Dispose()
  $kb = [int]((Get-Item $outFile).Length / 1KB)
  Write-Output ("  {0,-34} {1}x{2}  {3}KB" -f (Split-Path $outFile -Leaf), $w, $h, $kb)
}

Write-Output 'WORLD'
Convert-Img "$src\first__bg.png"        "$out\world\sky-desktop.jpg"  1920 'jpg' 82
Convert-Img "$src\first__bg_mobile.png" "$out\world\sky-mobile.jpg"   640  'jpg' 82
Convert-Img "$src\first__hares.png"      "$out\world\hares.png"        1300 'png'
Convert-Img "$src\second__bg.png"        "$out\world\meadow.jpg"       1400 'jpg' 80
Convert-Img "$src\second__bottom__bg.png" "$out\world\frame-cloud.png" 1400 'png'
Convert-Img "$src\first__bg_mobile.png"  "$out\world\sky-mobile-2.jpg" 320  'jpg' 80

Write-Output 'CHARACTERS'
Convert-Img "$src\second__item-1.png" "$out\characters\card-llm.png" 422 'png'
Convert-Img "$src\second__item-2.png" "$out\characters\card-free.png" 439 'png'
Convert-Img "$src\second__item-3.png" "$out\characters\card-animate.png" 444 'png'
Convert-Img "$src\second__item_image-1.png" "$out\characters\icon-llm.png" 299 'png'
Convert-Img "$src\second__item_image-2.png" "$out\characters\icon-free.png" 211 'png'
Convert-Img "$src\second__item_image-3.png" "$out\characters\icon-animate.png" 280 'png'

Write-Output 'GALLERY'
Convert-Img "$src\..\og-image.png" "$out\gallery\og-default.jpg" 1200 'jpg' 86
Convert-Img "$src\favicon.png"     "$out\brand\favicon-128.png"  128  'png'
Convert-Img "$src\favicon.png"     "$out\brand\logo-mark.png"    512  'png'
foreach ($n in 1..6) {
  Copy-Item "$src\videos\clip-$n.mp4" "$out\gallery\clip-$n.mp4" -Force
}
foreach ($i in @('dex','twitter','telegram','Tools')) {
  if (Test-Path "$src\$i.svg") { Copy-Item "$src\$i.svg" "$out\icons\$i.svg" -Force }
}
Write-Output 'ICONS + META'
Get-ChildItem $out -Recurse -File | Measure-Object -Property Length -Sum | ForEach-Object {
  Write-Output ("TOTAL {0} files, {1} MB" -f $_.Count, [math]::Round($_.Sum/1MB,2))
}
