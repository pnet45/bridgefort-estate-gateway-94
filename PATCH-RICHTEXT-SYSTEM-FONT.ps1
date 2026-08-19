$ErrorActionPreference = "Stop"
$path = Join-Path (Get-Location) "src/components/editor/RichTextEditor.tsx"
if (!(Test-Path $path)) { throw "RichTextEditor.tsx not found." }
$c = Get-Content $path -Raw

# Ensure the empty compose document starts with a stored system-font mark.
$c = $c -replace "editor\.chain\(\)\.focus\(\)\.setFontFamily\(SYSTEM_FONT\)\.run\(\);",
"editor.chain().focus().setMark('textStyle', { fontFamily: SYSTEM_FONT }).run();"

Set-Content -Path $path -Value $c -Encoding UTF8
Write-Host "RichTextEditor system-font behavior patched."
