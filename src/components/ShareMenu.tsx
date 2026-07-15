import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareMenuProps {
  title: string;
  description?: string;
  url?: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

// ── Filled brand icons ──────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.521 5.862L.057 23.887a.5.5 0 0 0 .611.611l6.056-1.459A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.89a9.875 9.875 0 0 1-5.022-1.374l-.36-.214-3.733.899.916-3.639-.235-.374A9.86 9.86 0 0 1 2.11 12C2.11 6.58 6.58 2.11 12 2.11c5.42 0 9.89 4.47 9.89 9.89 0 5.42-4.47 9.89-9.89 9.89z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#000000">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ShareMenu: React.FC<ShareMenuProps> = ({
  title,
  description,
  url,
  label = 'Share',
  iconOnly = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = description ? `${title} — ${description}` : title;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title, text: description || title, url: shareUrl });
    }
  };

  const openShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={iconOnly ? 'icon' : 'sm'}
          className={`border-yoga-sage/40 text-yoga-sage hover:bg-yoga-sage/10 hover:text-yoga-forest transition-colors ${className}`}
          title="Share"
        >
          <Share2 className={iconOnly ? 'h-4 w-4' : 'h-4 w-4 mr-1.5'} />
          {!iconOnly && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 shadow-xl rounded-xl">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Share via
        </div>

        <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={() => openShare('whatsapp')}>
          <WhatsAppIcon />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={() => openShare('facebook')}>
          <FacebookIcon />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={() => openShare('twitter')}>
          <TwitterXIcon />
          Twitter / X
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={() => openShare('linkedin')}>
          <LinkedInIcon />
          LinkedIn
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {typeof navigator !== 'undefined' && navigator.share && (
          <>
            <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={shareNative}>
              <Share2 className="h-4 w-4" />
              More options…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem className="gap-2.5 cursor-pointer" onClick={copyLink}>
          {copied
            ? <Check className="h-4 w-4 text-green-600" />
            : <Copy className="h-4 w-4" />
          }
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
