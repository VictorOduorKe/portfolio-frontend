import { useEffect } from 'react';

/**
 * Lightweight dynamic SEO manager for React SPA routes
 * Updates document title, meta description, canonical link, and robots directive without heavy dependencies.
 */
export function useSeo({
  title,
  description,
  canonical,
  noindex = false,
  ogTitle,
  ogDescription,
  ogImage
} = {}) {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tags
    const setMetaTag = (attribute, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', ogDescription || description);
      setMetaTag('name', 'twitter:description', ogDescription || description);
    }

    // 3. Open Graph Title
    if (ogTitle || title) {
      setMetaTag('property', 'og:title', ogTitle || title);
      setMetaTag('name', 'twitter:title', ogTitle || title);
    }

    // 4. Open Graph Image
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('name', 'twitter:image', ogImage);
    }

    // 5. Robots Policy
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaTag('name', 'robots', robotsContent);

    // 6. Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
      setMetaTag('property', 'og:url', canonical);
    }
  }, [title, description, canonical, noindex, ogTitle, ogDescription, ogImage]);
}

export default useSeo;
