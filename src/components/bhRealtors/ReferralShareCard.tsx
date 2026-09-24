import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Copy, Download, Mail, MessageCircle, QrCode, Send, Share2, CheckCircle2, X } from 'lucide-react';

type Props = { referralCode: string; referralLink: string };

const qrUrl = (link: string) => `https://quickchart.io/qr?text=${encodeURIComponent(link)}&size=420&margin=2`;

const ReferralShareCard: React.FC<Props> = ({ referralCode, referralLink }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const shareText = `Join me with Bridgefort Homes Realtors (BHRealtors). Use my referral code ${referralCode} to get started: ${referralLink}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: 'Referral link copied' });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: 'Could not copy referral link', description: 'Please copy it manually.', variant: 'destructive' });
    }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join BHRealtors', text: shareText, url: referralLink }); }
      catch (e: any) { if (e?.name !== 'AbortError') await copy(); }
    } else await copy();
  };

  const social = (network: 'whatsapp' | 'telegram' | 'facebook' | 'x' | 'email') => {
    const t = encodeURIComponent(shareText);
    const u = encodeURIComponent(referralLink);
    const target = {
      whatsapp: `https://wa.me/?text=${t}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      x: `https://twitter.com/intent/tweet?text=${t}`,
      email: `mailto:?subject=${encodeURIComponent('Join BHRealtors')}&body=${t}`,
    }[network];
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const makeImage = async () => {
    if (!cardRef.current) throw new Error('Referral card is not ready');
    if (!qrReady) throw new Error('QR code is still loading');
    return html2canvas(cardRef.current, {
      backgroundColor: '#07111f',
      scale: Math.min(3, window.devicePixelRatio || 2),
      useCORS: true,
      logging: false,
    });
  };

  const downloadImage = async () => {
    setBusy(true);
    try {
      const canvas = await makeImage();
      const a = document.createElement('a');
      a.download = `bridgefort-bhrealtors-referral-${referralCode}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast({ title: 'Referral image created' });
    } catch (e: any) {
      toast({ title: 'Could not create referral image', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const shareImage = async () => {
    setBusy(true);
    try {
      const canvas = await makeImage();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Unable to create image');
      const file = new File([blob], `bridgefort-bhrealtors-referral-${referralCode}.png`, { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'Join BHRealtors', text: shareText, files: [file] });
      } else {
        const a = document.createElement('a');
        a.download = file.name;
        a.href = URL.createObjectURL(blob);
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast({ title: 'Referral image downloaded', description: 'Your device does not support direct image sharing.' });
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast({ title: 'Could not share referral image', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-estate-blue/15 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950">
      <div className="bg-gradient-to-r from-estate-blue via-estate-blue to-estate-purple p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2"><Share2 className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Your BHRealtors referral</p></div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Grow your network with your code</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Share your personal link, QR code or branded referral image. Anyone who joins through it is connected to your referral.</p>
          </div>
          <Badge className="w-fit border border-white/20 bg-white/15 px-3 py-1 font-mono text-white">{referralCode}</Badge>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Referral link</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"><span className="break-all">{referralLink}</span></div>
              <Button onClick={copy} variant="outline" className="shrink-0 dark:bg-white/5 dark:text-white">{copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</Button>
              <Button onClick={() => void share()} className="shrink-0 bg-estate-blue hover:bg-estate-darkBlue"><Share2 className="mr-2 h-4 w-4" />Share</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => social('whatsapp')}><MessageCircle className="mr-1.5 h-4 w-4" />WhatsApp</Button>
            <Button variant="outline" size="sm" onClick={() => social('telegram')}><Send className="mr-1.5 h-4 w-4" />Telegram</Button>
            <Button variant="outline" size="sm" onClick={() => social('facebook')}><Share2 className="mr-1.5 h-4 w-4" />Facebook</Button>
            <Button variant="outline" size="sm" onClick={() => social('x')}><X className="mr-1.5 h-4 w-4" />X</Button>
            <Button variant="outline" size="sm" onClick={() => social('email')}><Mail className="mr-1.5 h-4 w-4" />Email</Button>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><QrCode className="h-4 w-4 text-estate-purple" />Scan to join</div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">The QR code opens the BHRealtors login/signup route with your referral code attached.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-[190px] w-[190px] shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                {!qrReady && <div className="absolute text-xs text-slate-500">Loading…</div>}
                <img crossOrigin="anonymous" src={qrUrl(referralLink)} alt={`QR code for referral ${referralCode}`} className="h-[174px] w-[174px]" onLoad={() => setQrReady(true)} onError={() => { setQrReady(false); toast({ title: 'QR code could not load', variant: 'destructive' }); }} />
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => void downloadImage()} disabled={busy || !qrReady}><Download className="mr-2 h-4 w-4" />Download referral image</Button>
                <Button variant="outline" size="sm" onClick={() => void shareImage()} disabled={busy || !qrReady}><Share2 className="mr-2 h-4 w-4" />Share as image</Button>
                <p className="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">Perfect for WhatsApp Status, Instagram Stories, flyers and direct sharing.</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={cardRef} className="mx-auto w-full max-w-[230px] overflow-hidden rounded-2xl bg-[#07111f] p-4 shadow-2xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Bridgefort Homes</div>
          <div className="mt-3 text-xl font-black text-white">You're invited</div>
          <p className="mt-1 text-xs leading-5 text-slate-400">Join BHRealtors and grow with us.</p>
          <div className="mt-4 rounded-xl bg-white p-2"><img crossOrigin="anonymous" src={qrUrl(referralLink)} alt="" className="w-full" /></div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center"><p className="text-[9px] uppercase tracking-wider text-slate-500">Referral code</p><p className="mt-1 font-mono text-lg font-black tracking-widest text-white">{referralCode}</p></div>
          <p className="mt-4 text-center text-[9px] text-slate-500">www.bridgeforthomes.com</p>
        </div>
      </div>
    </section>
  );
};

export default ReferralShareCard;
