/**
 * Dynamically updates the browser favicon and apple-touch-icon
 */
export function updateFavicon(iconUrl: string) {
  if (typeof document === 'undefined') return;

  try {
    // 1. Update rel="icon"
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    const isPng = iconUrl.endsWith('.png') || iconUrl.includes('.png?');
    link.type = isPng ? 'image/png' : 'image/jpeg';
    link.href = iconUrl;

    // 2. Update apple-touch-icon
    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = iconUrl;
  } catch (err) {
    console.warn('Failed to update favicon dynamically:', err);
  }
}
