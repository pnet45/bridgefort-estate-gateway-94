$ErrorActionPreference = "Stop"
$path = Join-Path (Get-Location) "src/components/admin/email/ComposeDialog.tsx"
if (!(Test-Path $path)) { throw "ComposeDialog.tsx not found." }
$c = Get-Content $path -Raw

# Parse To/Cc/Bcc like Gmail: commas, semicolons and newlines.
$c = $c -replace "const recipientInputClass = 'border-0 shadow-none focus-visible:ring-0 h-9 min-w-0 flex-1';",
"const normalizeRecipients = (value: string) => value.split(/[,;\n]+/).map(v => v.trim()).filter(Boolean).join(', ');`n  const recipientInputClass = 'border-0 shadow-none focus-visible:ring-0 h-9 min-w-0 flex-1';"

$c = $c -replace "to: to\.trim\(\), subject: subject\.trim\(\), html: body, cc: cc\.trim\(\) \|\| undefined, bcc: bcc\.trim\(\) \|\| undefined",
"to: normalizeRecipients(to), subject: subject.trim(), html: body, cc: normalizeRecipients(cc) || undefined, bcc: normalizeRecipients(bcc) || undefined"

$c = $c -replace "fromMailbox: activeMailbox, cc: cc\.trim\(\) \|\| undefined, bcc: bcc\.trim\(\) \|\| undefined",
"fromMailbox: activeMailbox, cc: normalizeRecipients(cc) || undefined, bcc: normalizeRecipients(bcc) || undefined"

# Keep Gmail as the default only when a connection exists; otherwise Resend.
$c = $c -replace "setSendRoute\('resend'\); setSelectedGmailAccount\(''\);", "setSendRoute('resend'); setSelectedGmailAccount('');"

# More Gmail-like recipient fields and composer height.
$c = $c -replace "placeholder=\"recipient@example.com, another@example.com\"", "placeholder=\"Recipients — separate addresses with comma or Enter\""
$c = $c -replace "placeholder=\"cc@example.com \(comma separated\)\"", "placeholder=\"Cc recipients\""
$c = $c -replace "placeholder=\"bcc@example.com \(comma separated\)\"", "placeholder=\"Bcc recipients\""

Set-Content -Path $path -Value $c -Encoding UTF8
Write-Host "ComposeDialog recipient handling patched. Review, then run npm run build."
