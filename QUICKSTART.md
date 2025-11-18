# Quick Start Guide - Waarheid Marketing Website

## What's Been Created

Your WordPress site has been completely rebuilt into a modern, clean HTML/CSS/JavaScript website! Here's what you have:

### ✅ Pages Created

1. **Homepage** ([index.html](index.html))
   - Hero section with your tagline
   - 3 core services
   - About section
   - Client showcase
   - Contact form

2. **About Page** ([about.html](about.html))
   - Mission statement
   - Your approach
   - Company values

3. **Service Pages**
   - [Marketing & Branding](services-marketing.html)
   - [Web & App Development](services-development.html)
   - [Automation & Business Intelligence](services-automation.html)

4. **404 Error Page** ([404.html](404.html))

### ✅ Technical Files

- **CSS**: Modern design system with purple/magenta colors ([css/style.css](css/style.css))
- **JavaScript**: Smooth interactions and animations ([js/main.js](js/main.js))
- **PHP Handler**: Contact form processing ([contact-handler.php](contact-handler.php))
- **Performance**: .htaccess with caching and compression
- **SEO**: robots.txt and sitemap.xml

### ✅ Images

All your 2024 images have been copied to the `images/2024/` folder.

## Next Steps

### 1. Test Locally (Optional)

If you want to test before uploading:

```bash
# If you have PHP installed
php -S localhost:8000
```

Then visit: http://localhost:8000

### 2. Upload to Your Server

**Option A: Replace WordPress completely**
1. Backup your WordPress site first!
2. Delete WordPress files (keep `wp-content/uploads/` for images)
3. Upload all new files to your web root

**Option B: Test in a subdirectory**
1. Create a new folder like `new-site/`
2. Upload all files there
3. Visit `yoursite.com/new-site/` to test
4. When ready, move files to root

### 3. Configure Contact Form

1. Open `contact-handler.php`
2. Change line 15:
   ```php
   $to_email = 'YOUR-EMAIL@waarheidmarketing.com';
   ```
3. Save and upload

### 4. Add Your Logo

1. Add your logo to `images/logo.png`
2. In all HTML files, update the logo section in the header:
   ```html
   <a href="index.html" class="logo">
     <img src="images/logo.png" alt="Waarheid Marketing">
   </a>
   ```

### 5. Update Contact Info

Search and replace in all HTML files:
- `info@waarheidmarketing.com` → Your email
- `+32 123 456 789` → Your phone
- Update social media links in footer

### 6. Enable HTTPS Redirect

Once SSL is active, in `.htaccess`, uncomment lines 6-8:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 7. Test Everything

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Contact form sends emails
- [ ] Mobile menu works on phone
- [ ] All images display
- [ ] Check on different browsers

## Customization Tips

### Change Colors

Edit `css/style.css` (lines 10-17):
```css
:root {
  --color-primary: #c50077;    /* Your main brand color */
  --color-secondary: #6a1c9a;  /* Secondary color */
  --color-accent: #d6a86f;     /* Accent color */
}
```

### Add New Pages

1. Copy an existing HTML file
2. Update the content
3. Add link to navigation menu
4. Add to `sitemap.xml`

### Add Google Analytics

Add before `</head>` in all HTML files:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## File Structure

```
Your New Site/
├── index.html              # Homepage
├── about.html              # About page
├── services-*.html         # Service pages (3 files)
├── 404.html                # Error page
├── contact-handler.php     # Form processor
├── .htaccess               # Performance config
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── css/
│   └── style.css          # All your styles
├── js/
│   └── main.js            # All interactions
├── images/
│   └── 2024/              # Your images
└── assets/
    └── fonts/             # Custom fonts
```

## Support

If you need help:
1. Check [README.md](README.md) for detailed documentation
2. View browser console for JavaScript errors (F12)
3. Check PHP error logs for form issues

## Performance Checklist

After uploading:
- [ ] Test site speed with Google PageSpeed Insights
- [ ] Verify mobile responsiveness
- [ ] Test contact form
- [ ] Submit sitemap to Google Search Console
- [ ] Check all links work
- [ ] Verify images load fast

---

**Your new website is ready to go! 🚀**

Modern, fast, and built with care for Waarheid Marketing.