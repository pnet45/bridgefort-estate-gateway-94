# Bridgefort Homes — Mail Center Upgrade Package

This package is intentionally **NOT pushed to GitHub**. It is prepared for local review in VS Code.

## Goals

- Gmail-style mail client UX.
- Centered mailbox switcher that opens a dropdown, not the full Email Center.
- Keep Edge Functions, API, Secrets and backend architecture intact.
- Reliable Gmail MIME with both text/plain and text/html.
- Working Cc/Bcc for Gmail and Resend.
- System font applies to the cursor/future typing, not only selected text.
- Preserve mailbox authorization and Gmail-account authorization.
- Preserve the existing Resend/Gmail send toggle.
- Keep autosave, templates, fullscreen composer and existing business logic.

## Folder references

Copy the package contents into the project root. Files under `src/...` map directly to the same folders in the project. The `supabase/functions/...` files map directly to Supabase Edge Function source folders.

## Apply order

1. Back up the project.
2. Run `APPLY-MAIL-CENTER-UPGRADE.ps1` from the project root after copying this package's contents.
3. Run `PATCH-COMPOSE-DIALOG.ps1`.
4. Run `PATCH-RICHTEXT-SYSTEM-FONT.ps1`.
5. Replace/deploy the two Edge Functions only after reviewing them:
   - `supabase/functions/gmail-sync/index.ts`
   - `supabase/functions/send-email/index.ts`
6. Integrate `<MailboxSwitcher ... />` into `AdminEmailCenter.tsx` where the current mailbox/switch control is rendered. The apply script inserts the import but deliberately does not guess the exact JSX location.
7. Run:
   npm run build
8. Test locally before committing.

## Important database note

The Gmail send code writes `cc_email` and `bcc_email`. If those columns do not already exist in `admin_emails`, add them through a reviewed migration before deploying the function:

- `cc_email text null`
- `bcc_email text null`

Do NOT make ad-hoc production schema changes without checking the existing schema first.

## Gmail test

Test:

Admin-Dir → sales@bridgeforthomes.com → Gmail → connected Google account → Inbox → open message → Compose → Cc/Bcc → Send.

Verify the recipient receives visible text and HTML.

## No GitHub push

This package contains no Git history and performs no git push. You control the final commit.
