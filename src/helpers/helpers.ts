export function siteIcon(icon: string, url: string) {
    // Already absolute URL
    if (icon.startsWith('https://') || icon.startsWith('http://')) {
        return icon;
    }

    // Use URL constructor to resolve relative paths automatically
    const baseUrl = new URL(url);
    return new URL(icon, baseUrl.origin).href;
}