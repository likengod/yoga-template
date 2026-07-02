import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80';
const SITE_NAME = 'Shakti Yoga Raai';

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property';
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta({ title, description, image, url, type = 'website' }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const finalImage = image || DEFAULT_IMAGE;
    const finalUrl = url || window.location.href;
    const finalDescription = description || `Discover inner peace and wellness at ${SITE_NAME}. Professional yoga classes, meditation, and holistic wellness programs for all levels.`;

    // Page title
    document.title = fullTitle;

    // Standard meta
    setMeta('description', finalDescription, true);

    // Open Graph
    setMeta('og:title', fullTitle);
    setMeta('og:description', finalDescription);
    setMeta('og:image', finalImage);
    setMeta('og:url', finalUrl);
    setMeta('og:type', type);
    setMeta('og:site_name', SITE_NAME);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', fullTitle, true);
    setMeta('twitter:description', finalDescription, true);
    setMeta('twitter:image', finalImage, true);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} - Find Your Inner Peace`;
      setMeta('og:title', `${SITE_NAME} - Find Your Inner Peace`);
      setMeta('og:description', `Discover inner peace and wellness at ${SITE_NAME}.`);
      setMeta('og:image', DEFAULT_IMAGE);
      setMeta('og:url', window.location.origin);
      setMeta('og:type', 'website');
    };
  }, [title, description, image, url, type]);
}
