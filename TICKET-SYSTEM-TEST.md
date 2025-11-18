# Ticket System Testing Checklist

## Quick Test Steps

### Test 1: Create Ticket from Client Side
1. Open `index.html` in browser
2. Click "Account" button → Sign In
3. Login with: `john@example.com` / `password123`
4. Navigate to "Messages" section in dashboard
5. Click "New Ticket" button
6. Fill in:
   - Category: Select any category
   - Priority: Select a priority
   - Subject: "Test ticket from client"
   - Message: "This is a test ticket"
7. Click "Create Ticket"
8. **Expected**: Ticket appears in ticket list

### Test 2: Ticket Appears in Admin Dashboard
1. Open new browser tab
2. Navigate to `admin-login.html`
3. Login with: `admin@waarheid.nl` / `admin123`
4. Click "Messages" in sidebar
5. **Expected**:
   - See the test ticket in the ticket list
   - Shows correct client name (John Smith)
   - Shows category icon
   - Shows status (Open)
   - Shows unread badge if not yet viewed

### Test 3: Admin Can Switch Between Tickets
1. In admin dashboard Messages section
2. Use the filter dropdown at top
3. Select different statuses: All / Open / In Progress / Resolved / Closed
4. **Expected**: Ticket list filters correctly
5. Click on different tickets in the list
6. **Expected**: Conversation view updates to show selected ticket

### Test 4: Admin Can View Ticket Conversation
1. Click on any ticket in the list
2. **Expected**:
   - Right panel shows full conversation
   - Shows ticket subject and client info
   - Messages displayed in chronological order
   - Client messages on left, admin messages on right
   - Status badge visible
   - Status change dropdown available

### Test 5: Admin Can Reply to Tickets
1. In a ticket conversation view
2. Type a message in the input field at bottom
3. Click send button (or press Enter)
4. **Expected**:
   - Message appears in conversation thread
   - Message shows as from "Waarheid Support Team"
   - Conversation scrolls to bottom
   - Input field clears

### Test 6: Client Sees Admin Reply
1. Go back to client dashboard tab
2. Navigate to Messages section
3. Click on the ticket you created
4. **Expected**:
   - See admin's reply in conversation
   - Unread badge shows count of new messages
   - After viewing, unread count clears

### Test 7: Admin Can Change Ticket Status
1. In admin dashboard, open any ticket
2. Use the "Change Status..." dropdown in header
3. Select a new status (e.g., "In Progress")
4. **Expected**:
   - Status badge updates immediately
   - Ticket list updates to reflect new status
   - Filter counts update

### Test 8: Client Sees Status Changes
1. In client dashboard, Messages section
2. Click on a ticket
3. **Expected**:
   - Status badge shows current status
   - Status reflects what admin set

### Test 9: Badge Counts Update
1. Create a new ticket from client side
2. Check notification badge in client header
3. **Expected**: Shows unread count
4. Switch to admin dashboard
5. Check Messages badge in admin sidebar
6. **Expected**: Shows unread count
7. Click the ticket to view it
8. **Expected**: Badge count decreases

### Test 10: Closed Tickets Cannot Be Replied To
1. In admin dashboard, change a ticket status to "Closed"
2. **Expected**:
   - Reply input is hidden
   - Shows "Ticket is closed" message
3. In client dashboard, open the closed ticket
4. **Expected**:
   - Reply input is disabled
   - Shows "Ticket is closed" message

## Known Working Features

✅ Ticket list with cards showing metadata
✅ Category icons for different ticket types
✅ Priority badges (low/normal/high/urgent)
✅ Status badges with color coding
✅ Unread message indicators
✅ Conversation threading
✅ Chat-style message bubbles
✅ Relative timestamps
✅ Admin can reply to tickets
✅ Admin can change ticket status
✅ Client can create new tickets with categories
✅ Client can view old tickets
✅ Client can reply to tickets
✅ Badge notifications for unread messages

## Demo Data Available

The system includes 4 demo tickets:
1. **Ticket #1**: John Smith - "Question about SEO campaign progress" (Resolved)
2. **Ticket #2**: Sarah Johnson - "Billing question for November" (Open)
3. **Ticket #3**: Mike Brown - "Need help with analytics dashboard" (In Progress)
4. **Ticket #4**: John Smith - "Feature request for reporting" (Open)

Each ticket has realistic conversation threads showing client-admin interaction.

## Testing Notes

- All data stored in localStorage
- Changes persist across page reloads
- No backend server required for demo
- Use browser console commands from TESTING-GUIDE.md for database inspection

## Browser Console Commands

### View all tickets
```javascript
DataManager.tickets.getAll()
```

### View specific client's tickets
```javascript
DataManager.tickets.getByClient('client_demo_001')
```

### View tickets by status
```javascript
DataManager.tickets.getByStatus('open')
```

### Get unread count for admin
```javascript
DataManager.tickets.getUnreadCount(null, true)
```

### Get unread count for client
```javascript
DataManager.tickets.getUnreadCount('client_demo_001', false)
```

### Create test ticket
```javascript
DataManager.tickets.create({
  clientId: 'client_demo_001',
  subject: 'Test Ticket',
  category: 'general',
  priority: 'normal',
  initialMessage: 'This is a test ticket message'
})
```

## Issues Fixed

✅ **Issue**: Tickets created by clients not appearing in admin dashboard
   **Solution**: Updated admin Messages section to use `DataManager.tickets.getAll()` instead of old message system

✅ **Issue**: Admin couldn't switch between messages
   **Solution**: Implemented ticket list with click handlers and filter dropdown

✅ **Issue**: Badge counts showing wrong values
   **Solution**: Updated all badge functions to use `DataManager.tickets.getUnreadCount()`

---

**Test Date**: 2024-11-18
**System**: Ticket/Support System v1.0
**Status**: Ready for testing
