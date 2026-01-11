// Utility to sanitize HTML using DOMPurify
import DOMPurify from 'dompurify';

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {USE_PROFILES: {svg: true, svgFilters: true, html: false}});
}
