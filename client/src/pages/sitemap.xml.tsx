// This would be handled by a build process in production
// For now, creating a static sitemap accessible via server route

export const generateSitemap = () => {
  const baseUrl = 'https://your-domain.com';
  const lastmod = new Date().toISOString().split('T')[0];
  
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'weekly' },
    { loc: '/faq', priority: '0.8', changefreq: 'weekly' },
    { loc: '/claims', priority: '0.8', changefreq: 'monthly' },
    { loc: '/hero-vsc', priority: '0.7', changefreq: 'monthly' },
    { loc: '/connected-auto-care', priority: '0.7', changefreq: 'monthly' },
    { loc: '/products/auto-advantage', priority: '0.6', changefreq: 'monthly' },
    { loc: '/products/home-protection-plan', priority: '0.6', changefreq: 'monthly' },
    { loc: '/products/all-vehicle-protection', priority: '0.6', changefreq: 'monthly' },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};