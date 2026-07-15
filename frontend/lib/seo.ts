export const siteConfig = {
  name: 'هل مانهوا',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'سایت مدرن خواندن مانهوا، چت، استوری، تیم ترجمه و پنل مدیریت',
};

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
