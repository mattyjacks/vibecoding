# Deployment & Hosting Guide for Tri State Honey

## Recommended Hosting Options
1. **GitHub Pages / Cloudflare Pages / Vercel / Netlify**:
   - Zero configuration needed. Simply point the build root to `/tsh3/tsh3demo1` or deploy directly.
   - Built-in global CDN with sub-second TTL and automatic SSL certificates.

2. **AWS S3 + CloudFront**:
   - Upload all files to an Amazon S3 bucket configured for static web hosting.
   - Attach AWS CloudFront distribution pointing to S3 with custom domain `tristatehoney.com`.
   - Add CloudFront Function for security headers (`X-Frame-Options`, `Content-Security-Policy`).

3. **Apache / Nginx / LiteSpeed Web Server**:
   - Copy `/tsh3/tsh3demo1/` to `/var/www/html/` or public web root.
   - Enable Gzip / Brotli compression for CSS, JS, and JSON assets.
   - Enable browser caching headers with `Cache-Control: public, max-age=31536000` for images.
