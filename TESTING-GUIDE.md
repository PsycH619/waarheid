# Waarheid Marketing - Testing Guide

## Database System

### Local Database (Current)
The system uses localStorage as a database for local testing. It automatically initializes with demo data on first load.

**Database Features:**
- Auto-initialization with demo data
- 3 demo clients with projects, messages, invoices
- Admin-client messaging system
- Project management with milestones
- Invoice tracking with status
- Consultation booking system

### Demo Accounts

#### Client Accounts
All client passwords: `password123`

1. **John Smith** (2 projects, 4 invoices, 3 messages)
   - Email: `john@example.com`
   - Company: Tech Solutions Inc
   - Projects: SEO Campaign (65%), Website Development (85%)

2. **Sarah Johnson** (1 project, 2 invoices, 1 message)
   - Email: `sarah@example.com`
   - Company: Digital Marketing Co
   - Projects: Social Media Marketing (45%)

3. **Mike Brown** (1 project, 1 invoice, 1 message)
   - Email: `mike@example.com`
   - Company: E-commerce Solutions
   - Projects: Marketing Automation (15%)

#### Admin Account
- Email: `admin@waarheid.nl`
- Password: `admin123`
- Access: Full admin dashboard with all management features

---

## Testing Workflows

### 1. Client Sign Up Flow
**Test Steps:**
1. Open the website homepage
2. Click "Account" button in header
3. Click "Sign Up" tab in modal
4. Fill in the form with new details
5. Use a unique email (not in demo accounts)
6. Create password (min 8 characters)
7. Confirm password
8. Click "Create Account"

**Expected Result:**
- New client created in database
- Auto-login and redirect to client dashboard
- Client appears in admin dashboard's client list

**What to Verify:**
- Email validation (should reject existing emails)
- Password validation (min 8 chars, must match confirmation)
- Client ID assigned automatically
- User data stored correctly

### 2. Client Sign In Flow
**Test Steps:**
1. Open homepage
2. Click "Account" button
3. Enter demo account credentials
   - Email: `john@example.com`
   - Password: `password123`
4. Click "Sign In"

**Expected Result:**
- Successful login
- Redirect to client dashboard
- See user's name in header
- Projects, messages, invoices loaded

**What to Verify:**
- Invalid credentials show error message
- Correct credentials log in successfully
- Dashboard shows only this client's data
- All sidebar buttons work (Dashboard, Projects, Analytics, Messages, etc.)

### 3. Admin Login Flow
**Test Steps:**
1. Go to `admin-login.html` OR
2. Click "Admin Login" link in sign-in modal
3. Enter admin credentials
4. Click "Sign In"

**Expected Result:**
- Redirect to admin dashboard
- See all clients, projects, consultations
- Full admin controls available

---

## Admin Dashboard Testing

### Consultations Section
**Test:**
1. Login as admin
2. Go to "Consultations" section
3. View pending/approved/rejected consultations

**Actions to Test:**
- ✅ View consultation details
- ✅ Approve consultation
- ✅ Reject consultation
- ✅ Convert approved consultation to project

**Verification:**
- Status changes reflect immediately
- Converting to project creates new project
- Project appears in Projects section
- Client can see new project in their dashboard

### Projects Section
**Test:**
1. In admin dashboard, go to "Projects"
2. Click "Add New Project"

**Actions to Test:**
- ✅ Create new project (select client from dropdown)
- ✅ Edit existing project
- ✅ Update project progress
- ✅ Add milestones
- ✅ Change project status
- ✅ Delete project (with confirmation)

**Verification:**
- New projects appear in client dashboard immediately
- Progress updates reflect in client view
- Milestone completion shows in project details
- Deleting project removes from client view

### Clients Section
**Test:**
1. Go to "Clients" section in admin
2. View all registered clients

**Actions to Test:**
- ✅ View client details
- ✅ See client's projects
- ✅ See client's messages
- ✅ Add new client manually
- ✅ Update client information

**Verification:**
- All signups appear in client list
- Client details accurate
- Projects linked correctly
- Messages filtered by client

### Messages Section
**Test:**
1. Go to "Messages" section
2. Click "New Message"

**Actions to Test:**
- ✅ Send message to specific client
- ✅ View message thread
- ✅ Reply to client messages
- ✅ Mark as read/unread

**Verification:**
- Messages appear in client's message section
- Unread count updates in client header
- Client can reply to admin messages
- Message threading works correctly

### Invoices Section
**Test:**
1. Go to "Invoices" section
2. Click "Create Invoice"

**Actions to Test:**
- ✅ Create invoice for client
- ✅ Link invoice to project
- ✅ Set amount, dates
- ✅ Change invoice status (pending/paid/overdue)

**Verification:**
- Invoice appears in client dashboard
- Status changes reflect immediately
- Client can view/download invoice
- Pay now button shows for pending invoices

---

## Client Dashboard Testing

### Dashboard Section (Overview)
**Test:**
1. Login as `john@example.com` / `password123`
2. View dashboard overview

**What to Verify:**
- ✅ Welcome message shows user's name
- ✅ Stats show accurate counts:
  - Active Projects: Count of in_progress/launching/optimizing
  - Pending Reviews: Count of pending projects
- ✅ Recent projects displayed with progress bars
- ✅ Notification badge shows unread message count

### My Projects Section
**Test:**
1. Click "My Projects" in sidebar

**What to Verify:**
- ✅ Only THIS client's projects shown
- ✅ Project cards show:
  - Title, description
  - Status badge
  - Progress percentage
  - Start date
  - Progress bar
- ✅ Click "View Details" opens modal with:
  - Full project information
  - Milestones timeline
  - Progress breakdown
  - Notes from admin

### Analytics Section
**Test:**
1. Click "Analytics" in sidebar

**What to Verify:**
- ✅ KPI cards display:
  - Total Impressions
  - Click-Through Rate
  - Conversions
  - Revenue Generated
- ✅ Performance chart loads
- ✅ Traffic sources chart loads
- ✅ Charts are interactive

### Messages Section
**Test:**
1. Click "Messages" in sidebar

**What to Verify:**
- ✅ Shows messages between client and admin
- ✅ Messages sorted by date (newest first)
- ✅ Unread messages highlighted
- ✅ Can send new message to admin
- ✅ Message appears in admin dashboard
- ✅ Notification badge updates

**Send Message Test:**
1. Click "New Message" button
2. Enter message text
3. Click send

**Verification:**
- Message saved to database
- Admin can see message in admin dashboard
- Message marked as from client (not admin)

### Schedule Section
**Test:**
1. Click "Schedule" in sidebar

**What to Verify:**
- ✅ Shows client's consultation bookings
- ✅ Displays status (Pending/Approved/Declined/Completed)
- ✅ Shows date, time, service type
- ✅ Color-coded status badges
- ✅ "Book Consultation" button works

### Invoices Section
**Test:**
1. Click "Invoices" in sidebar

**What to Verify:**
- ✅ Only THIS client's invoices shown
- ✅ Invoice cards display:
  - Invoice number
  - Project title
  - Amount
  - Status (Pending/Paid/Overdue)
  - Issue and due dates
- ✅ Action buttons:
  - View invoice
  - Download invoice (demo mode alert)
  - Pay Now (for pending invoices, demo mode alert)

### Reports Section
**Test:**
1. Click "Reports" in sidebar

**What to Verify:**
- ✅ Report generation cards displayed:
  - Performance Report
  - Project Summary
  - Financial Report
  - Monthly Summary
- ✅ Project-specific reports shown (if client has projects)
- ✅ Generate buttons trigger demo alerts

---

## Data Flow Testing

### Client Creates → Admin Sees
**Test:**
1. Create new client account via signup
2. Login as admin
3. Check Clients section

**Expected:** New client appears in list immediately

### Admin Creates Project → Client Sees
**Test:**
1. Admin creates project for client
2. Login as that client
3. Check Dashboard and Projects sections

**Expected:**
- Project count updates in stats
- Project appears in project list
- Project details accessible

### Admin Sends Message → Client Gets Notification
**Test:**
1. Admin sends message to client
2. Login as that client
3. Check header notification badge
4. Go to Messages section

**Expected:**
- Notification badge shows unread count
- Message appears in Messages section
- Message highlighted as unread

### Client Sends Message → Admin Sees
**Test:**
1. Client sends message via Messages section
2. Login as admin
3. Check Messages section

**Expected:**
- Message appears in admin messages
- Filtered correctly by client
- Shows as from client (not admin)

### Admin Creates Invoice → Client Sees
**Test:**
1. Admin creates invoice for client
2. Login as that client
3. Go to Invoices section

**Expected:**
- Invoice appears in list
- Correct amount, dates, status
- Action buttons available

---

## Database Management

### Reset Database
**Command (in browser console):**
```javascript
DatabaseInit.reset()
```
This will clear all data and reinitialize with demo data.

### View Database Info
**Command:**
```javascript
DatabaseInit.getInfo()
```
Shows:
- Initialization status
- Date initialized
- Counts of all data (clients, projects, messages, etc.)

### Export Database
**Command:**
```javascript
DatabaseInit.export()
```
Downloads current database as JSON file for backup.

### Manual Initialization
**Command:**
```javascript
DatabaseInit.initialize(true) // force = true to override existing
```

---

## Common Issues & Solutions

### Issue: Sign in accepts wrong credentials
**Solution:** Database might not be initialized properly
```javascript
// Check if initialized
DatabaseInit.isInitialized()
// If false, run:
DatabaseInit.initialize()
```

### Issue: Client dashboard shows no projects
**Cause:** Either:
1. Client has no projects assigned
2. Database not initialized
3. ClientId mismatch

**Solution:**
1. Login as admin and create project for client
2. Check console for errors
3. Verify clientId in localStorage matches project's clientId

### Issue: Messages not showing
**Cause:**
1. No messages for this client
2. clientId filtering issue

**Solution:**
1. Send message from admin to client
2. Check browser console for errors
3. Verify message has correct clientId

### Issue: New signup not appearing in admin
**Cause:** Admin dashboard needs refresh

**Solution:**
1. Refresh admin dashboard page
2. Check Clients section
3. Client should appear with status "active"

---

## Browser Console Commands

### View all clients
```javascript
DataManager.clients.getAll()
```

### View all projects
```javascript
DataManager.projects.getAll()
```

### View specific client's projects
```javascript
DataManager.projects.getByClient('client_demo_001')
```

### View all messages
```javascript
DataManager.messages.getAll()
```

### View specific client's messages
```javascript
DataManager.messages.getAll().filter(m => m.clientId === 'client_demo_001')
```

### Create test message
```javascript
DataManager.messages.create({
  clientId: 'client_demo_001',
  subject: 'Test Message',
  message: 'This is a test message',
  fromAdmin: true,
  read: false
})
```

---

## Firebase Migration Preparation

The current system is designed to make Firebase migration straightforward:

### Current Structure
- All data stored in localStorage
- Structured in collections (clients, projects, messages, etc.)
- Each record has unique ID
- Relationships via foreign keys (clientId)

### Migration Steps (Future)
1. **Set up Firebase project**
   - Create Firestore database
   - Configure authentication

2. **Replace DataManager methods**
   - Change localStorage calls to Firestore calls
   - Update read operations to use snapshots
   - Update write operations to use set/update/delete

3. **Update authentication**
   - Replace localStorage auth with Firebase Auth
   - Migrate password storage to Firebase Auth

4. **Test thoroughly**
   - Verify all CRUD operations
   - Test real-time updates
   - Check permission rules

### Code Changes Required
- `js/data-manager.js` → Update all methods to use Firestore SDK
- `js/auth-state.js` → Integrate Firebase Authentication
- Remove `js/database-init.js` (no longer needed)
- Add Firebase config and initialization

**Benefit of current approach:**
The API structure (DataManager.clients.create(), etc.) remains the same, only the implementation changes.

---

## Security Notes

### Current (Demo Mode)
⚠️ **NOT SECURE FOR PRODUCTION:**
- Passwords stored in plain text
- No server-side validation
- LocalStorage is client-accessible
- No encryption

### For Production (Firebase)
✅ **Security improvements:**
- Firebase Auth handles password hashing
- Server-side validation via Cloud Functions
- Firestore Security Rules prevent unauthorized access
- HTTPS encryption
- Multi-factor authentication possible
- OAuth providers (Google, Microsoft)

---

## Performance Testing

### Load Testing
**Test with:**
- 10+ clients
- 50+ projects
- 100+ messages

**Monitor:**
- Page load times
- Dashboard render speed
- Search/filter performance

### Current Limits
- localStorage: ~5-10MB per origin
- Acceptable for: 100-500 clients
- For larger scale: Firebase required

---

## Support

### Debug Mode
To enable detailed console logging, add to localStorage:
```javascript
localStorage.setItem('debug_mode', 'true')
```

### Clear All Data (including auth)
```javascript
localStorage.clear()
location.reload()
```

### Reset Just Database
```javascript
DatabaseInit.clearDatabase()
DatabaseInit.initialize()
```

---

**Last Updated:** 2024-11-18
**Version:** 1.0.0
**Database:** localStorage (preparing for Firebase)
