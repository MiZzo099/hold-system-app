# PTOC Hold Management System - Database Integration Guide

## Overview
The PTOC Hold Management System v9.5 now includes:
- **User Authentication System** with username/password login
- **Google Sheets Database Integration** for real-time data
- **Role-Based Access Control** (Admin, Staff, Viewer)
- **Permission Management** system

---

## 1. User Authentication Setup

### Database Tab Structure

Your Google Sheets database should have a "Users" tab with the following columns:

| Column | Header | Type | Example |
|--------|--------|------|---------|
| A | Email | Text | auth28@cobsolution.com |
| B | Name | Text | Mostafa Hassan |
| C | Username | Text | mostafa |
| D | Clinic | Text | Fordham |
| E | Role | Text | admin |
| F | Team | Text | referral |
| G | Permissions | Text | view_holds,place_hold,clear_hold,escalate |
| H | Password Hash | Text | (see below) |
| I | Status | Text | active |

### User Roles & Permissions

#### Admin Role
```
- view_holds
- place_hold
- clear_hold
- escalate
- manage_users
- generate_reports
- access_settings
```

#### Staff Role
```
- view_holds
- place_hold
- clear_hold
- generate_reports
```

#### Viewer Role
```
- view_holds
- view_history
```

### Password Hashing

For production security, passwords should be hashed using SHA-256:

```javascript
// JavaScript example to generate password hash
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Example: hash 'demo123'
hashPassword('demo123').then(hash => console.log(hash));
```

**Current Demo Users:**
```
Username: mostafa | Password: demo123 | Role: Admin
Username: omar   | Password: demo123 | Role: Staff
Username: menna  | Password: demo123 | Role: Staff
Username: aya    | Password: demo123 | Role: Staff
Username: ali    | Password: demo123 | Role: Viewer
```

---

## 2. Database Schema Setup

### Holds Tab Structure

| Column | Header | Type | Example |
|--------|--------|------|---------|
| A | Placed Date | Date | 2024-01-15 |
| B | Placed By | Email | auth28@cobsolution.com |
| C | Patient Name | Text | John Doe |
| D | EMR ID | Text | 12345 |
| E | Insurance | Text | Blue Cross |
| F | Hold Category | Text | Missing Referral |
| G | Hold Notes | Text | Patient needs referral from MD |
| H | Status | Text | HOLD |
| I | Clinic | Text | Fordham |
| J | Cleared Date | Date | (empty if active) |
| K | Cleared By | Email | (empty if active) |

### Hold History Tab Structure

Same as Holds tab but includes cleared holds with dates.

---

## 3. Google Sheets API Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Sheets API
4. Create an API key (restricted to Sheets API)

### Step 2: Share Your Spreadsheet
1. Open your PTOC Database spreadsheet
2. Click Share
3. Add the Google Cloud service account email
4. Grant Editor access

### Step 3: Environment Configuration

Create a `.env.local` file in your project root:

```env
REACT_APP_GOOGLE_API_KEY=YOUR_API_KEY_HERE
REACT_APP_SHEET_ID=1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM
REACT_APP_DB_NAME=Database
REACT_APP_USERS_TAB=Users
REACT_APP_HISTORY_TAB=Hold History
```

---

## 4. Integration Code

### AuthService Configuration

In `src/services/authService.ts`:

```typescript
const DB_CONFIG: DatabaseConfig = {
  spreadsheetId: process.env.REACT_APP_SHEET_ID || '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE',
  usersTab: 'Users'
};
```

### DatabaseService Configuration

In `src/services/databaseService.ts`:

```typescript
const DB_CONFIG = {
  spreadsheetId: process.env.REACT_APP_SHEET_ID || '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE',
  tabs: {
    database: process.env.REACT_APP_DB_NAME || 'Database',
    holds: 'Holds',
    history: process.env.REACT_APP_HISTORY_TAB || 'Hold History',
    users: 'Users'
  }
};
```

---

## 5. Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│  User visits application                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Check Local Storage│
         │  for Active Session │
         └────────┬────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
     YES │                    │ NO
        │                    │
        ▼                    ▼
    ┌────────┐      ┌──────────────┐
    │ App    │      │ Login Page   │
    │ Loaded │      │ Displayed    │
    └────────┘      └──────┬───────┘
                           │
                      User enters
                    username/password
                           │
                           ▼
                  ┌──────────────────┐
                  │ Verify with DB   │
                  └────────┬─────────┘
                           │
                  ┌────────┴─────────┐
                  │                  │
             VALID│                  │INVALID
                  │                  │
                  ▼                  ▼
            ┌──────────┐      ┌─────────────┐
            │ Save     │      │ Show Error  │
            │ Session  │      │ Message     │
            │ Load App │      │ Retry Login │
            └──────────┘      └─────────────┘
```

---

## 6. Using the Auth Context

### In Components

```typescript
import { useAuth } from '../contexts/AuthContext';

export function MyComponent() {
  const { user, logout, hasPermission } = useAuth();

  // Check if user has permission
  if (!hasPermission('place_hold')) {
    return <div>You don't have permission to place holds</div>;
  }

  return (
    <div>
      <h1>Hello, {user?.name}!</h1>
      <p>Clinic: {user?.clinic}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 7. Fetching Hold Data

### Using DatabaseService

```typescript
import { DatabaseService } from '../services/databaseService';

async function loadHolds() {
  const holds = await DatabaseService.fetchActiveHolds();
  const stats = await DatabaseService.getHoldsStats();
  
  console.log('Active holds:', holds);
  console.log('Statistics:', stats);
}
```

---

## 8. Adding/Updating Data in Sheets

### Via Google Sheets API

```typescript
async function addNewHold(hold: Hold) {
  const values = [[
    hold.placedDate,
    hold.placedBy,
    hold.patientName,
    hold.emrId,
    hold.clinic,
    hold.holdReason,
    hold.notes,
    'HOLD'
  ]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Database!A:H:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    }
  );

  return response.json();
}
```

---

## 9. Security Best Practices

✅ **DO:**
- Use HTTPS only
- Hash passwords with SHA-256 or bcrypt
- Implement rate limiting on login attempts
- Cache data locally (read-only)
- Use API keys with restricted scope
- Regularly rotate API keys

❌ **DON'T:**
- Store plain-text passwords
- Expose API keys in frontend code
- Use admin API keys for frontend
- Trust client-side validation only
- Share credentials in code

---

## 10. Troubleshooting

### Issue: "API key not valid"
**Solution:** Verify your API key is correct and enabled for Sheets API

### Issue: "Spreadsheet not found"
**Solution:** Check the spreadsheet ID and ensure it's shared with service account

### Issue: "User not found"
**Solution:** Verify username exists in Users tab and exact spelling matches

### Issue: "CORS Error"
**Solution:** Google Sheets API should work fine from browser. Check browser console for actual error.

---

## 11. Contact & Support

For issues with database integration:
- Check `.env.local` configuration
- Verify Google Sheets API is enabled
- Ensure spreadsheet is properly shared
- Review browser console for error messages

---

## Sample Spreadsheet Setup

[View Sample Template](https://docs.google.com/spreadsheets/d/1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM)

Users can duplicate this template and configure it with their own API keys.
