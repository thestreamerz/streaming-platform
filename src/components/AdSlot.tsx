import React, { useEffect, useRef } from 'react';

interface AdSlotProps {
  src: string;
  height?: number;
  width?: number | '100%';
  title?: string;
}

// Renders a sandboxed iframe and injects the third-party ad script inside it.
// This prevents layout/CSS collisions and keeps navigation clickable.
export const AdSlot: React.FC<AdSlotProps> = ({
  src,
  height = 60,
  width = '100%',
  title = 'Advertisement'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Create sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.style.border = '0';
    iframe.style.width = typeof width === 'number' ? `${width}px` : width;
    iframe.style.height = `${height}px`;
    iframe.title = title;

    // Avoid touching iframe.contentDocument/contentWindow to prevent cross-origin errors
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>
    </head><body>
      <div id="ad-root"></div>
      <script src="${src}" async></script>
    </body></html>`;
    // Use srcdoc so we never access the iframe document directly
    (iframe as any).srcdoc = html;
    container.appendChild(iframe);

    return () => {
      try {
        container.innerHTML = '';
      } catch {
        // noop
      }
    };
  }, [src, height, width, title]);

  return (
    <div
      ref={containerRef}
      className="ad-allowed w-full flex items-center justify-center"
      style={{ minHeight: `${height}px` }}
      aria-label={title}
      role="complementary"
    />
  );
};

export default AdSlot;


