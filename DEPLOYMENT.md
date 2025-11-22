# Deployment Guide - MarketPro

Complete guide for deploying your MarketPro application to production.

## 📦 Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] All environment variables set
- [ ] Firestore security rules tested
- [ ] Cloud Functions tested locally
- [ ] Google service account created (for Meet integration)
- [ ] OpenAI API key obtained (for AI chatbot)
- [ ] Domain configured in Route 53
- [ ] Hostinger account set up

## 🔧 Step-by-Step Deployment

### Step 1: Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com/
   # Create a new project
   # Enable Google Analytics (optional)
   ```

2. **Enable Required Services**
   - Authentication (Email/Password provider)
   - Cloud Firestore
   - Cloud Storage
   - Cloud Functions
   - Enable Blaze (Pay-as-you-go) plan for Functions

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the configuration values

### Step 2: Configure Environment Variables

1. **Create `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in Firebase values**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

3. **Add Analytics IDs**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_FB_PIXEL_ID=your-pixel-id
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
   NEXT_PUBLIC_LINKEDIN_PARTNER_ID=your-linkedin-id
   ```

### Step 3: Deploy Firebase Backend

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase in project**
   ```bash
   firebase init
   ```
   Select:
   - Firestore
   - Functions
   - Storage

3. **Update Firebase project ID**
   ```bash
   # Edit .firebaserc and replace "your-project-id" with actual ID
   ```

4. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   firebase deploy --only storage
   ```

5. **Configure Cloud Functions**
   ```bash
   # Set OpenAI API key
   firebase functions:config:set openai.key="sk-..."

   # Optional: Set Google service account for Meet integration
   firebase functions:config:set google.service_account_email="your-sa@project.iam.gserviceaccount.com"
   firebase functions:config:set google.private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

6. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

### Step 4: Google Meet Integration (Optional)

1. **Create Service Account**
   - Go to Google Cloud Console
   - Navigate to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file

2. **Enable Google Calendar API**
   - In Google Cloud Console
   - Go to APIs & Services > Library
   - Search for "Google Calendar API"
   - Click Enable

3. **Share Calendar**
   - Open Google Calendar
   - Settings > Share calendar
   - Add service account email
   - Give "Make changes to events" permission

4. **Configure in Firebase**
   ```bash
   firebase functions:config:set google.service_account_email="sa@project.iam.gserviceaccount.com"
   firebase functions:config:set google.private_key="$(cat service-account-key.json | jq -r .private_key)"
   ```

### Step 5: Build Next.js Application

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Test the build locally**
   ```bash
   npm run start
   # Visit http://localhost:3000
   ```

### Step 6: Deploy to Hostinger

#### Option A: Deploy as Node.js Application

1. **Login to Hostinger Control Panel**

2. **Create Node.js Application**
   - Go to Advanced > Node.js
   - Click "Create Application"
   - Select Node.js 18
   - Set application root to public_html/marketpro (or your preferred path)
   - Set application URL

3. **Upload Files via FTP/SFTP**
   ```bash
   # Upload these directories/files:
   - .next/
   - public/
   - node_modules/
   - package.json
   - package-lock.json
   - next.config.js
   ```

4. **Set Environment Variables in Hostinger**
   - In Node.js app settings
   - Add all variables from .env.local

5. **Start the application**
   ```bash
   npm run start
   ```

#### Option B: Deploy as Static Export

1. **Configure for static export**
   ```js
   // next.config.js
   module.exports = {
     output: 'export',
     // ... other config
   }
   ```

2. **Build static site**
   ```bash
   npm run build
   ```

3. **Upload `out/` folder to Hostinger**
   - Use File Manager or FTP
   - Upload to public_html/

4. **Configure .htaccess for routing**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Step 7: Configure DNS in Route 53

1. **Get Hostinger Server IP**
   - In Hostinger control panel
   - Note your server IP address

2. **Configure Route 53**
   - Go to AWS Route 53 console
   - Select your hosted zone
   - Create A record:
     ```
     Name: @
     Type: A
     Value: [Hostinger IP]
     TTL: 300
     ```
   - Create CNAME record for www:
     ```
     Name: www
     Type: CNAME
     Value: yourdomain.com
     TTL: 300
     ```

3. **Update Nameservers** (if needed)
   - Copy Route 53 nameservers
   - Update at your domain registrar

4. **Wait for DNS Propagation** (can take 24-48 hours)

### Step 8: SSL Certificate

1. **In Hostinger Control Panel**
   - Go to SSL/TLS
   - Select "Let's Encrypt"
   - Install free SSL certificate

2. **Force HTTPS**
   - Add to .htaccess:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Step 9: Create First Admin User

1. **Register via Web Interface**
   - Go to your domain/register
   - Create an account

2. **Update Role in Firestore**
   - Go to Firebase Console
   - Firestore Database
   - Find user in `users` collection
   - Change `role` field to `"admin"`

3. **Test Admin Access**
   - Login with admin account
   - Verify access to /admin/dashboard

### Step 10: Post-Deployment Testing

- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test client dashboard access
- [ ] Test admin dashboard access
- [ ] Test project creation (admin)
- [ ] Test chat system
- [ ] Test appointment booking
- [ ] Test Google Meet link generation
- [ ] Test AI chatbot
- [ ] Verify analytics tracking
- [ ] Test on mobile devices
- [ ] Check SSL certificate
- [ ] Test all public pages

## 🔒 Security Hardening

1. **Review Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Enable App Check** (recommended)
   - Go to Firebase Console
   - Build > App Check
   - Register your web app
   - Add reCAPTCHA v3 site key

3. **Configure CORS**
   - In Firebase Storage rules
   - Limit to your domain only

4. **Rate Limiting**
   - Consider implementing rate limiting in Functions
   - Use Firebase App Check

## 📊 Monitoring

1. **Firebase Console**
   - Monitor Authentication users
   - Check Firestore usage
   - Review Function logs
   - Monitor Storage usage

2. **Google Analytics**
   - Set up goals and conversions
   - Monitor user behavior

3. **Error Tracking** (optional)
   - Integrate Sentry
   - Monitor errors in production

## 🔄 Continuous Deployment

### Using GitHub Actions (Optional)

1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Production

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         # Add deployment steps for Hostinger
         # Deploy Functions
         - run: cd functions && npm install && npm run build
         - uses: w9jds/firebase-action@master
           with:
             args: deploy --only functions
           env:
             FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
   ```

## 🆘 Troubleshooting

### Issue: Functions not deploying
```bash
# Check region configuration
firebase functions:config:get

# Redeploy specific function
firebase deploy --only functions:functionName
```

### Issue: Firestore permission denied
```bash
# Verify rules
firebase firestore:rules:get

# Redeploy rules
firebase deploy --only firestore:rules
```

### Issue: DNS not resolving
- Check nameserver propagation: https://dnschecker.org
- Verify A record points to correct IP
- Wait 24-48 hours for full propagation

### Issue: SSL certificate errors
- Verify domain points to correct server
- Reinstall SSL certificate in Hostinger
- Clear browser cache

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Check Hostinger error logs
3. Review deployment checklist
4. Contact support

## ✅ Production Checklist

- [ ] All environment variables configured
- [ ] Firebase project deployed
- [ ] Functions deployed and tested
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] DNS configured correctly
- [ ] SSL certificate installed
- [ ] Admin user created
- [ ] All features tested
- [ ] Analytics verified
- [ ] Mobile responsive checked
- [ ] Performance optimized
- [ ] Backups configured

---

🎉 Congratulations! Your MarketPro application is now live!
