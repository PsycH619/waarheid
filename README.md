# MarketPro - Modern Marketing Agency Platform

A complete, production-ready web application for a marketing agency built with Next.js and Firebase.

## 🚀 Features

### Public Website
- Modern, responsive landing page
- Services showcase
- Portfolio/case studies
- Pricing plans
- About page
- Contact form
- SEO optimized

### Client Features
- Secure authentication (Email/Password)
- Personal dashboard
- Project tracking and management
- Real-time support chat
- AI-powered chatbot assistant
- Appointment booking with Google Meet integration
- File uploads and management

### Admin Features
- Comprehensive admin dashboard
- Client management
- Project management
- Support chat management
- Appointment scheduling
- Analytics and reporting

### Technical Features
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Real-time**: Live chat and updates
- **Security**: Role-based access control, Firestore security rules
- **Analytics**: Google Analytics, Facebook Pixel, LinkedIn Insight Tag
- **SEO**: Optimized meta tags, sitemap support

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Google Cloud Project (for Google Meet integration)
- OpenAI API key (for AI chatbot)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

Select the following features:
- Firestore
- Functions
- Storage
- Hosting (optional, if deploying to Firebase)

### 3. Environment Configuration

Create `.env.local` in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Analytics & Tracking
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=your-fb-pixel-id
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=your-linkedin-id

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Firebase Functions Configuration

Set up environment variables for Cloud Functions:

```bash
# OpenAI API Key for AI Chatbot
firebase functions:config:set openai.key="your-openai-api-key"

# Google Service Account for Calendar/Meet (optional)
firebase functions:config:set google.service_account_email="your-service-account@project.iam.gserviceaccount.com"
firebase functions:config:set google.private_key="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### 6. Deploy Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

## 🏃 Development

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run Functions Emulator

```bash
cd functions
npm run serve
```

## 🌐 Deployment

### Deploy to Hostinger

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Export static files** (if using static hosting):
   ```bash
   npm run export
   ```

3. **Upload to Hostinger**:
   - Use FTP/SFTP to upload the `.next` folder or `out` folder (if exported)
   - Configure Node.js application in Hostinger control panel
   - Set environment variables in Hostinger

### Configure DNS (AWS Route 53)

1. In AWS Route 53, create a hosted zone for your domain
2. Add an A record or CNAME pointing to your Hostinger server
3. Update nameservers at your domain registrar

### Deploy Firebase Functions

```bash
firebase deploy --only functions
```

## 🔐 Security Setup

### Create First Admin User

After deploying, you need to create your first admin user:

1. Register a new account through the web interface
2. Go to Firebase Console > Firestore Database
3. Find the user document in the `users` collection
4. Change the `role` field from `"client"` to `"admin"`

### Google Meet Integration Setup

1. Create a Google Cloud service account
2. Enable Google Calendar API
3. Share your Google Calendar with the service account email
4. Add service account credentials to Firebase Functions config (see step 4 above)

## 📂 Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── (public pages)      # Landing, services, pricing, etc.
│   ├── admin/              # Admin dashboard
│   ├── client/             # Client dashboard
│   ├── login/              # Authentication pages
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── auth/               # Auth components
│   ├── booking/            # Appointment booking
│   ├── chat/               # Chat widgets
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
├── lib/                    # Utilities and helpers
│   ├── firebase.ts         # Firebase initialization
│   ├── firestore.ts        # Firestore helpers
│   ├── auth.ts             # Auth helpers
│   └── hooks/              # Custom React hooks
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── aiChatbot.ts    # AI chatbot function
│       ├── bookingWithMeet.ts  # Google Meet integration
│       └── index.ts
├── types/                  # TypeScript types
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── firebase.json           # Firebase configuration
```

## 🎨 Customization

### Branding

Update the following:
- Company name in `components/layout/Navbar.tsx`
- Logo and colors in `tailwind.config.js`
- Meta tags in `app/layout.tsx`
- Contact information in `components/layout/Footer.tsx`

### Styling

The project uses Tailwind CSS. Customize colors in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your brand colors
      },
    },
  },
}
```

## 📊 Analytics Setup

### Google Analytics

The GA4 tracking code is already integrated. Just add your Measurement ID to `.env.local`.

### Facebook Pixel

Add your Facebook Pixel ID to `.env.local` to enable tracking.

### Google Ads Conversion Tracking

Add your Google Ads ID to `.env.local`.

## 🧪 Testing

### Create Test Users

For development, create test accounts:
- Admin: test-admin@example.com
- Client: test-client@example.com

Remember to set proper roles in Firestore.

## 🐛 Troubleshooting

### Firestore Permission Denied

- Verify security rules are deployed
- Check user role in Firestore
- Ensure user is authenticated

### Cloud Functions Not Working

- Check function logs: `firebase functions:log`
- Verify environment variables are set
- Check Firebase billing is enabled (Functions require Blaze plan)

### Google Meet Links Not Generating

- Verify service account credentials
- Check Calendar API is enabled
- Ensure calendar is shared with service account

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@marketpro.com or open an issue in the repository.

## 🚀 Next Steps

1. **Set up your Firebase project**
2. **Configure environment variables**
3. **Deploy Firestore rules and functions**
4. **Create your first admin account**
5. **Customize branding and content**
6. **Deploy to Hostinger**
7. **Configure DNS in Route 53**
8. **Test all features**
9. **Launch! 🎉**

---

Built with ❤️ using Next.js and Firebase
