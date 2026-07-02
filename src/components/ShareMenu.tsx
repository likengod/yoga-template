import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Facebook, Twitter, Linkedin } from 'lucide-react';
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
  /** Optional: override button label */
  label?: string;
  /** Show icon only (no label) */
  iconOnly?: boolean;
  className?: string;
}

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
      // fallback for older browsers
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
    const encodedText = encodeURIComponent(shareText);
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
          className={`border-yoga-sage/40 text-yoga-sage hover:bg-yoga-sage hover:text-white transition-colors ${className}`}
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
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => openShare('whatsapp')}
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => openShare('facebook')}
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => openShare('twitter')}
        >
          <Twitter className="h-4 w-4 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => openShare('linkedin')}
        >
          <Linkedin className="h-4 w-4 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {typeof navigator !== 'undefined' && navigator.share && (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={shareNative}>
              <Share2 className="h-4 w-4" />
              More options…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
