$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = (Get-Location).Path

Write-Host "Bridgefort Homes Mail Center upgrade" -ForegroundColor Cyan
Write-Host "Project: $project"

$targets = @(
  "src/components/admin/email/MailboxSwitcher.tsx",
  "src/components/editor/EditorToolbar.tsx"
)
foreach ($target in $targets) {
  $src = Join-Path $root $target
  $dst = Join-Path $project $target
  if (!(Test-Path $src)) { throw "Package file missing: $target" }
  New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
  Copy-Item $src $dst -Force
}

$admin = Join-Path $project "src/components/admin/AdminEmailCenter.tsx"
if (!(Test-Path $admin)) { throw "AdminEmailCenter.tsx not found." }
$content = Get-Content $admin -Raw

if ($content -notmatch "MailboxSwitcher") {
  $content = $content -replace "(import EmailLoginScreen, \{ AvailableMailbox \} from './email/EmailLoginScreen';)", "`$1`nimport MailboxSwitcher from './email/MailboxSwitcher';"
}

# Replace the old 'Switch mailbox' trigger if present. The exact old JSX can differ;
# this only removes the direct full-screen-login behavior and leaves existing logic intact.
$content = $content -replace "onClick=\{\(\) => setShowEmailLogin\(true\)\}", "onClick={() => setShowEmailLogin(false)}"

Set-Content -Path $admin -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Files copied. Review AdminEmailCenter.tsx and replace its old mailbox button with:" -ForegroundColor Yellow
Write-Host @'
<MailboxSwitcher
  value={activeMailbox}
  mailboxes={availableMailboxes}
  onChange={selectMailbox}
  onConnect={connectGmail}
  onDisconnect={disconnectGmail}
  connecting={connectingEmail}
  disconnecting={disconnectingEmail}
/>
'@
Write-Host ""
Write-Host "IMPORTANT: Do not commit yet. Run npm run build first."
