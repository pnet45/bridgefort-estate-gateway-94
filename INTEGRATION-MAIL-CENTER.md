# Mail Center integration checklist

The package deliberately avoids replacing the entire `AdminEmailCenter.tsx`, because that file contains the existing mailbox authorization, folder logic, templates, bulk email, contacts and other business logic.

## 1. Imports

Add:

```tsx
import MailboxSwitcher from './email/MailboxSwitcher';
import GmailLikeToolbar from './email/GmailLikeToolbar';
```

## 2. Centered mailbox switcher

Place `MailboxSwitcher` inside the top mail header which has `relative` positioning:

```tsx
<div className="relative flex min-h-16 items-center ...">
  {/* left: hamburger / brand */}
  {/* center: mailbox */}
  <MailboxSwitcher
    value={activeMailbox}
    mailboxes={availableMailboxes.map(m => ({
      ...m,
      gmail_connected: m.mailbox_provider === 'gmail',
    }))}
    onChange={selectMailbox}
    onConnect={connectGmail}
    onDisconnect={disconnectGmail}
    connecting={connectingEmail}
    disconnecting={disconnectingEmail}
  />
  {/* right: settings / profile */}
</div>
```

Do not place it in the left sidebar.

## 3. Gmail-like toolbar

Replace the current search/action strip with:

```tsx
<GmailLikeToolbar
  search={searchTerm}
  onSearch={setSearchTerm}
  checkedCount={checkedIds.size}
  totalCount={folderEmails.length}
  unreadOnly={unreadOnly}
  onUnreadOnly={setUnreadOnly}
  onRefresh={refreshAll}
  onArchive={() => handleBulkMove('archive')}
  onTrash={() => handleBulkMove('trash')}
  refreshing={loading}
/>
```

Wire `onMarkRead` and `onMarkUnread` if your existing bulk selection code supports those actions.

## 4. Gmail-style behavior to keep

- Left sidebar = folders.
- Center/top = mailbox selector and search.
- Main list = messages.
- Reading pane = selected message.
- Compose = modal/fullscreen.
- Gmail account selector only appears when Gmail is the chosen sending route.
- Resend/Gmail remain separate sending providers.
- Company mailbox is never inferred from the Google account alone.

## 5. CC/BCC

The composer accepts:

- comma
- semicolon
- newline

and normalizes them before sending.

Both Gmail and Resend Edge Functions validate and send Cc/Bcc.

## 6. Recipient blank-message fix

The Gmail function now creates a standards-friendly multipart message:

- text/plain
- text/html
- UTF-8
- CRLF
- base64 line wrapping

This is safer across Gmail, Outlook and other mail clients.

## 7. Important database safety

`admin_emails` currently does NOT have `cc_email` or `bcc_email` columns. The package therefore does not write those nonexistent columns. Cc/Bcc are sent correctly but are not stored in separate fields.

Do not add schema columns unless you explicitly want historical Cc/Bcc metadata.

## 8. Test before commit

```powershell
npm run build
```

Then test:

1. Switch mailbox dropdown.
2. Select Gmail mailbox.
3. Open Inbox.
4. Open a received message.
5. Compose.
6. Select System font.
7. Type new text after clicking System font.
8. Add To + Cc + Bcc.
9. Send with Gmail.
10. Open recipient mailbox and verify visible text.
11. Send with Resend.
12. Verify Cc and Bcc recipients.
13. Test Reply/Forward.
14. Test Archive/Trash/Spam.
15. Test multiple Gmail accounts.
