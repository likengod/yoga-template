import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schemas?: object[]; // Accept array of custom JSON-LD schema objects
  keywords?: string;
  canonical?: string;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
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

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function usePageMeta({ title, description, image, url, type = 'website', schemas, keywords, canonical, geoRegion, geoPlacename, geoPosition }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const finalImage = image || DEFAULT_IMAGE;
    const finalUrl = url || window.location.href;
    const finalDescription = description || `Discover inner peace and wellness at ${SITE_NAME}. Professional yoga classes, meditation, and holistic wellness programs for all levels.`;

    // Page title
    document.title = fullTitle;

    // Standard meta
    setMeta('description', finalDescription, true);
    if (keywords) setMeta('keywords', keywords, true);
    if (canonical) setCanonical(canonical);

    // GEO Tags
    if (geoRegion) setMeta('geo.region', geoRegion, true);
    if (geoPlacename) setMeta('geo.placename', geoPlacename, true);
    if (geoPosition) {
      setMeta('geo.position', geoPosition, true);
      setMeta('ICBM', geoPosition.replace(';', ', '), true);
    }

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

    // Inject JSON-LD Schema
    const scriptTags: HTMLScriptElement[] = [];
    if (schemas && schemas.length > 0) {
      schemas.forEach((schemaObj, index) => {
        const script = document.createElement('script');
        script.id = `jsonld-schema-${index}`;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaObj);
        document.head.appendChild(script);
        scriptTags.push(script);
      });
    }

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} - Find Your Inner Peace`;
      setMeta('og:title', `${SITE_NAME} - Find Your Inner Peace`);
      setMeta('og:description', `Discover inner peace and wellness at ${SITE_NAME}.`);
      setMeta('og:image', DEFAULT_IMAGE);
      setMeta('og:url', window.location.origin);
      setMeta('og:type', 'website');
      
      // Remove injected scripts
      scriptTags.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [title, description, image, url, type, schemas, keywords, canonical, geoRegion, geoPlacename, geoPosition]);
}
