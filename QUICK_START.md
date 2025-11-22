# Quick Start Guide

Get your MarketPro application up and running in minutes!

## ⚡ Fast Track Setup (15 minutes)

### 1. Install Dependencies (2 min)

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Set Up Firebase (5 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable these services:
   - Authentication → Email/Password
   - Firestore Database → Create database (start in production mode)
   - Storage → Create bucket
   - Functions → Upgrade to Blaze plan (required)

4. Get your Firebase config:
   - Project Settings → General → Your apps → Web app
   - Copy the configuration

### 3. Configure Environment (3 min)

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Deploy Firebase Rules (3 min)

```bash
# Login to Firebase
firebase login

# Update project ID in .firebaserc
# Replace "your-project-id" with your actual Firebase project ID

# Deploy security rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. Create Your First Admin Account (1 min)

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Create an account
3. Go to [Firebase Console](https://console.firebase.google.com/)
4. Firestore Database → `users` collection
5. Find your user → Edit → Change `role` to `"admin"`
6. Refresh your app and access `/admin/dashboard`

## ✅ You're Done!

Your app is now running locally with:
- ✅ Authentication working
- ✅ Admin dashboard accessible
- ✅ Client dashboard accessible
- ✅ Firestore security rules active

## 🚀 Optional Enhancements

### Add AI Chatbot (Optional)

1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com/)
2. Configure in Functions:
   ```bash
   firebase functions:config:set openai.key="sk-your-key-here"
   ```
3. Deploy functions:
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

### Add Google Meet Integration (Optional)

1. Create Google Cloud service account
2. Enable Google Calendar API
3. Share your calendar with service account
4. Configure:
   ```bash
   firebase functions:config:set google.service_account_email="sa@project.iam.gserviceaccount.com"
   firebase functions:config:set google.private_key="-----BEGIN PRIVATE KEY-----\n..."
   ```
5. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

### Add Analytics (Optional)

Add to `.env.local`:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=your-pixel-id
```

## 🎨 Customize Your Brand

1. **Update Company Name**
   - `components/layout/Navbar.tsx` → Change "MarketPro"
   - `components/layout/Footer.tsx` → Update company info

2. **Update Colors**
   - `tailwind.config.js` → Modify primary colors

3. **Update Content**
   - `app/page.tsx` → Homepage content
   - `app/about/page.tsx` → About page
   - `components/layout/Footer.tsx` → Contact info

## 📱 Test Everything

- [ ] Visit homepage
- [ ] Register new account
- [ ] Login
- [ ] Access client dashboard
- [ ] Create admin user in Firestore
- [ ] Access admin dashboard
- [ ] Test contact form
- [ ] Check mobile responsive

## 🆘 Common Issues

### "Permission denied" in Firestore
→ Make sure you deployed rules: `firebase deploy --only firestore:rules`

### "Function not found"
→ Deploy functions: `firebase deploy --only functions`

### "Build failed"
→ Clear cache: `rm -rf .next node_modules && npm install`

## 📚 Next Steps

- Read full [README.md](./README.md) for complete documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize pages and content
- Add your logo and branding
- Set up production Firebase project
- Deploy to Hostinger

## 💡 Pro Tips

1. **Use Firebase Emulators for local testing** (optional):
   ```bash
   firebase emulators:start
   ```

2. **Create test data** in Firestore manually to see how it works

3. **Check browser console** for any errors during development

4. **Use React DevTools** extension for debugging

---

Need help? Check the full documentation in README.md or DEPLOYMENT.md
