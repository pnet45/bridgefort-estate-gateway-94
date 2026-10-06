const WEBSITE = "https://www.bridgeforthomes.com";
const CONTACT_EMAIL = "info@bridgeforthomes.com";
const SALES_EMAIL = "sales@bridgeforthomes.com";
const PHONE_1 = "+234 803 062 4059";
const PHONE_2 = "+234 807 071 0688";

export const escapeHtml = (value: string) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const extractBody = (html: string) => {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1]?.trim() || html;
};

export function bridgefortEmail(
  contentHtml: string,
  options: { preheader?: string; ctaLabel?: string; ctaUrl?: string } = {},
) {
  const body = extractBody(contentHtml);
  const preheader = escapeHtml(options.preheader || "Bridgefort Homes Development Ltd.");
  const ctaLabel = escapeHtml(options.ctaLabel || "Visit Bridgefort Homes");
  const ctaUrl = escapeHtml(options.ctaUrl || WEBSITE);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Bridgefort Homes Development Ltd</title>
<style>
@media only screen and (max-width:680px){
  .bf-shell{width:100%!important;border-radius:0!important}
  .bf-content{padding:26px 20px!important}
  .bf-header{padding:26px 20px!important}
  .bf-footer{padding:24px 18px!important}
  .bf-cta{display:block!important;width:auto!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:#f4f0fa;font-family:Arial,Helvetica,sans-serif;color:#25212b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f0fa;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" class="bf-shell" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(72,37,105,.12);">
<tr><td class="bf-header" style="background:#5b2a86;padding:30px 28px;text-align:center;">
<div style="font-size:27px;line-height:1.15;font-weight:800;color:#fff;">Bridgefort Homes</div>
<div style="margin-top:7px;font-size:13px;color:#eadcf6;letter-spacing:.3px;">Development Ltd.</div>
<div style="margin-top:18px;display:inline-block;padding:7px 14px;border:1px solid #caa8e8;border-radius:30px;color:#fff;font-size:12px;font-weight:700;">BRINGING YOUR DREAM HOME</div>
</td></tr>
<tr><td class="bf-content" style="padding:34px 30px 18px;">
${body}
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 8px;">
<tr><td class="bf-cta" style="border-radius:9px;background:#5b2a86;text-align:center;">
<a href="${ctaUrl}" style="display:inline-block;padding:14px 25px;color:#fff;text-decoration:none;font-size:15px;font-weight:700;">${ctaLabel}</a>
</td></tr>
</table>
</td></tr>
<tr><td class="bf-footer" style="background:#3b2057;padding:26px 24px;text-align:center;color:#fff;">
<div style="font-size:16px;font-weight:800;">Bridgefort Homes Development Ltd.</div>
<div style="margin-top:5px;font-size:13px;color:#e9ddf3;">Bringing your dream home!</div>
<div style="margin-top:15px;font-size:12px;line-height:1.8;color:#e9ddf3;">
<a href="${WEBSITE}" style="color:#fff;text-decoration:underline;">www.bridgeforthomes.com</a><br>
<a href="mailto:${CONTACT_EMAIL}" style="color:#fff;text-decoration:none;">${CONTACT_EMAIL}</a> &nbsp;|&nbsp;
<a href="mailto:${SALES_EMAIL}" style="color:#fff;text-decoration:none;">${SALES_EMAIL}</a><br>
${PHONE_1} &nbsp;|&nbsp; ${PHONE_2}
</div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px auto 0;"><tr>
<td style="padding:0 4px;"><a href="https://web.facebook.com/people/Bridgefort-Homes/61591513100267/" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:11px;font-weight:800;">f</a></td>
<td style="padding:0 4px;"><a href="https://instagram.com/bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:10px;font-weight:800;">ig</a></td>
<td style="padding:0 4px;"><a href="https://x.com/bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:11px;font-weight:800;">X</a></td>
<td style="padding:0 4px;"><a href="https://www.linkedin.com/in/bridgeforthomes/" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800;">in</a></td>
<td style="padding:0 4px;"><a href="https://tiktok.com/@bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800;">tt</a></td>
<td style="padding:0 4px;"><a href="https://youtube.com/@bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800;">yt</a></td>
</tr></table>
<div style="margin-top:14px;font-size:11px;color:#d8c9e4;">Follow @bridgeforthomes</div>
<div style="margin-top:12px;font-size:10px;color:#cdbddd;">© ${new Date().getFullYear()} Bridgefort Homes Development Ltd. All rights reserved.</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export const bridgefortTextFooter = `
---
Bridgefort Homes Development Ltd.
Bringing your dream home!
www.bridgeforthomes.com
info@bridgeforthomes.com | sales@bridgeforthomes.com
+234 803 062 4059 | +234 807 071 0688
Follow @bridgeforthomes:
Facebook: https://web.facebook.com/people/Bridgefort-Homes/61591513100267/
Instagram: https://instagram.com/bridgeforthomes
X: https://x.com/bridgeforthomes
LinkedIn: https://www.linkedin.com/in/bridgeforthomes/
TikTok: https://tiktok.com/@bridgeforthomes
YouTube: https://youtube.com/@bridgeforthomes
`;
