# Waarheid Marketing - Website Rebuild

Modern, clean HTML/CSS/JavaScript website for Waarheid Marketing - A Marketing & Digitalization Agency.

## Overview

This is a complete rebuild of the WordPress website into a modern, lightweight, and fast static website with dynamic form handling.

### Features

- **Modern Design**: Clean, professional design with purple/magenta color scheme
- **Fully Responsive**: Mobile-first design that works on all devices
- **Fast Performance**: No WordPress overhead, pure HTML/CSS/JS
- **SEO Friendly**: Semantic HTML, meta tags, and clean structure
- **Interactive Elements**: Smooth animations, scroll effects, and transitions
- **Contact Form**: PHP-powered contact form with email notifications
- **Easy to Maintain**: Simple file structure, well-commented code

## Project Structure

```
Waarheid Rework/
│
├── index.html                  # Homepage
├── about.html                  # About page
├── services-marketing.html     # Marketing & Branding service page
├── services-development.html   # Web & App Development service page
├── services-automation.html    # Automation & BI service page
├── contact-handler.php         # Contact form processing script
│
├── css/
│   └── style.css              # Main stylesheet with design system
│
├── js/
│   └── main.js                # JavaScript for interactions
│
├── images/                    # Images and media files
│   └── 2024/                  # WordPress migrated images
│
├── assets/
│   └── fonts/                 # Custom fonts (if needed)
│
└── README.md                  # This file
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern CSS with CSS Variables, Flexbox, Grid
- **JavaScript**: Vanilla JS (no frameworks)
- **PHP**: Server-side form processing
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family

## Pages Included

1. **Homepage** (`index.html`)
   - Hero section with call-to-action
   - Services overview (3 core services)
   - About section
   - Clients showcase
   - Contact form

2. **About Page** (`about.html`)
   - Company mission
   - Approach and values
   - Why choose Waarheid

3. **Service Pages**
   - Marketing & Branding (`services-marketing.html`)
   - Web & App Development (`services-development.html`)
   - Automation & Business Intelligence (`services-automation.html`)

## Setup Instructions

### 1. Server Requirements

- **Web Server**: Apache, Nginx, or any web server
- **PHP**: Version 7.4 or higher (for contact form)
- **Mail Function**: PHP mail() function enabled

### 2. Installation

1. **Upload Files**: Upload all files to your web server's public directory (usually `public_html/` or `www/`)

2. **Configure Contact Form**:
   - Open `contact-handler.php`
   - Change line 15: `$to_email = 'info@waarheidmarketing.com';` to your email
   - Change line 16: `$from_email` to your domain email
   - Save the file

3. **Create Logs Directory** (optional):
   ```bash
   mkdir logs
   chmod 755 logs
   ```

4. **Test Contact Form**:
   - Visit your website
   - Fill out the contact form
   - Check if you receive the email

### 3. Customization

#### Update Contact Information

Search and replace in all HTML files:
- `info@waarheidmarketing.com` → Your email
- `+32 123 456 789` → Your phone number
- Update social media links in footer

#### Add Your Logo

1. Add your logo image to `images/` folder (e.g., `logo.png`)
2. In all HTML files, find the `.logo` element and add:
   ```html
   <a href="index.html" class="logo">
     <img src="images/logo.png" alt="Waarheid Marketing">
   </a>
   ```

#### Change Colors

Edit `css/style.css` and update CSS variables:
```css
:root {
  --color-primary: #c50077;    /* Main brand color */
  --color-secondary: #6a1c9a;  /* Secondary color */
  --color-accent: #d6a86f;     /* Accent color */
  /* ... other colors */
}
```

#### Add Images

1. Place images in `images/` folder
2. Reference them in HTML: `<img src="images/your-image.jpg" alt="Description">`

## Contact Form Setup

The contact form uses PHP to send emails. Make sure:

1. **PHP Mail is Configured**: Test with a simple PHP mail script
2. **SPF/DKIM Records**: Set up for your domain to avoid spam filters
3. **Alternative**: Use a service like SendGrid, Mailgun, or FormSpree

### Using FormSpree (Alternative)

If PHP mail doesn't work:

1. Sign up at [FormSpree.io](https://formspree.io)
2. Get your form endpoint
3. Update the form in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance Optimization

### For Production:

1. **Minify CSS/JS**:
   - Use tools like [UglifyJS](https://github.com/mishoo/UglifyJS) or online minifiers
   - Rename to `style.min.css` and `main.min.js`

2. **Optimize Images**:
   - Compress with [TinyPNG](https://tinypng.com/) or [ImageOptim](https://imageoptim.com/)
   - Use WebP format for better compression
   - Implement lazy loading (already in JS)

3. **Enable Caching**:
   Add to `.htaccess`:
   ```apache
   # Cache static assets
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

4. **Enable Gzip Compression**:
   Add to `.htaccess`:
   ```apache
   # Enable Gzip
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
   </IfModule>
   ```

## SEO Optimization

✅ Already included:
- Semantic HTML5 tags
- Meta descriptions on all pages
- Alt text for images
- Clean URLs
- Fast loading times
- Mobile responsive

### To improve SEO further:

1. **Add Google Analytics**:
   Add before `</head>` in all HTML files:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'YOUR_GA_ID');
   </script>
   ```

2. **Add robots.txt**:
   Create `robots.txt` in root:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://waarheidmarketing.com/sitemap.xml
   ```

3. **Create sitemap.xml**:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://waarheidmarketing.com/</loc>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://waarheidmarketing.com/about.html</loc>
       <priority>0.8</priority>
     </url>
     <!-- Add more pages -->
   </urlset>
   ```

## Maintenance

### Regular Tasks:

1. **Update Content**: Edit HTML files directly
2. **Add Blog Posts**: Create new HTML files following the existing structure
3. **Update Client Logos**: Replace in the clients section
4. **Check Forms**: Test contact form monthly
5. **Security**: Keep PHP updated, review logs

## Migrating from WordPress

Images have been copied from `public_html/wp-content/uploads/2024/` to `images/2024/`.

### If you need more WordPress content:

1. **Export Posts/Pages**: WordPress Admin → Tools → Export
2. **Convert Content**: Copy text from WordPress to HTML files
3. **Download Media**: Via FTP from `wp-content/uploads/`

## Troubleshooting

### Contact Form Not Working

1. Check PHP mail is enabled: Create `test-mail.php`:
   ```php
   <?php
   $result = mail('your@email.com', 'Test', 'This is a test');
   echo $result ? 'Mail sent!' : 'Mail failed!';
   ?>
   ```

2. Check error logs: `logs/contact-submissions.log`

3. Try FormSpree alternative (see above)

### Images Not Loading

1. Check file paths are correct
2. Ensure images are uploaded to server
3. Check file permissions: `chmod 644 images/*`

### Mobile Menu Not Working

1. Clear browser cache
2. Check JavaScript console for errors
3. Ensure `js/main.js` is loaded

## Support

For questions or issues:
- Email: info@waarheidmarketing.com
- Review code comments in files
- Check browser console for JavaScript errors

## Credits

- **Design & Development**: Custom rebuild for Waarheid Marketing
- **Icons**: Font Awesome (https://fontawesome.com)
- **Fonts**: Google Fonts - Inter (https://fonts.google.com)

## License

Proprietary - All rights reserved by Waarheid Marketing

---

**Built with clarity, creativity, and modern technology** 🚀