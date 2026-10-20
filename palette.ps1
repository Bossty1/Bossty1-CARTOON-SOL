Add-Type -AssemblyName System.Drawing

function Get-Palette {
  param([string]$Path, [int]$Top = 8)
  $img = [System.Drawing.Image]::FromFile($Path)
  $bmp = New-Object System.Drawing.Bitmap($img)
  $small = New-Object System.Drawing.Bitmap(48, 48)
  $g = [System.Drawing.Graphics]::FromImage($small)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.DrawImage($bmp, 0, 0, 48, 48)
  $g.Dispose()
  $counts = @{}
  for ($x = 0; $x -lt 48; $x++) {
    for ($y = 0; $y -lt 48; $y++) {
      $c = $small.GetPixel($x, $y)
      if ($c.A -lt 64) { continue }
      $r = [int][math]::Floor($c.R / 24) * 24
      $gg = [int][math]::Floor($c.G / 24) * 24
      $b = [int][math]::Floor($c.B / 24) * 24
      $key = "{0},{1},{2}" -f $r, $gg, $b
      if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key] = 1 }
    }
  }
  $small.Dispose(); $bmp.Dispose(); $img.Dispose()
  Write-Output ("== " + (Split-Path $Path -Leaf))
  $sorted = $counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First $Top
  foreach ($e in $sorted) {
    $parts = $e.Key -split ','
    $hex = '#{0:x2}{1:x2}{2:x2}' -f [int]$parts[0], [int]$parts[1], [int]$parts[2]
    Write-Output ("   {0}  x{1}" -f $hex, $e.Value)
  }
}

$root = Split-Path $MyInvocation.MyCommand.Path
Get-Palette (Join-Path $root 'research\assets\first__bg.png')
Get-Palette (Join-Path $root 'research\assets\second__bg.png')
Get-Palette (Join-Path $root 'research\assets\first__hares.png')
Get-Palette (Join-Path $root 'research\og-image.png')
Get-Palette (Join-Path $root 'research\assets\second__bottom__bg.png')
Get-Palette (Join-Path $root 'research\assets\favicon.png')
