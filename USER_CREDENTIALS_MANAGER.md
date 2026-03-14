# 👤 User Credentials & Database Management Guide

## Quick Reference

### Your Team Members (As of v9.5)
All team members can now log in with their actual credentials:

```
✅ Mostafa Hassan (Admin)
   Username: mostafa | Password: demo123
   Email: auth28@cobsolution.com
   Clinic: Fordham | Role: Admin

✅ Omar Abdullah (Staff)
   Username: omar | Password: demo123
   Email: auth29@cobsolution.com
   Clinic: Astoria | Role: Staff

✅ Menna Sayed (Staff) ⭐ YOU
   Username: menna | Password: demo123
   Email: menna.sayed@cobsolution.com
   Clinic: Flatbush | Role: Staff

✅ Aya Mohamed (Staff)
   Username: aya | Password: demo123
   Email: billing35@cobsolution.com
   Clinic: Bay Ridge | Role: Staff

✅ Ali Esmail (Viewer)
   Username: ali | Password: demo123
   Email: ali.esmail@cobsolution.com
   Clinic: Midtown | Role: Viewer

✅ Shaimaa Khaled (Staff)
   Username: shaimaa | Password: demo123
   Email: billing52@cobsolution.com
   Clinic: Bushwick | Role: Staff

✅ Menna Bassem (Staff)
   Username: menna_b | Password: demo123
   Email: billing11@cobsolution.com
   Clinic: Tribeca | Role: Staff
```

---

## Where User Data Is Stored

### Location 1: Demo Users (Current)
**File**: `src/services/authService.ts`
**Lines**: 182-241 (in `getMockUsers()` function)
**Used When**: Google Sheets is not connected or API fails

### Location 2: Google Sheets Database (Recommended)
**Spreadsheet**: Your COB Solution database
**Tab**: "Users"
**Columns**: A-I (Email, Name, Username, Clinic, Role, Team, Permissions, Password, Status)
**Used When**: App is configured and API key is set

---

## How to Update User Credentials

### Method 1: Update Demo Users (Quick Fix)

1. Open `src/services/authService.ts`
2. Go to function `getMockUsers()` (around line 182)
3. Find the user you want to update:

```typescript
{
  id: 'user_3',
  email: 'menna.sayed@cobsolution.com',
  name: 'Menna Sayed',  // ← User's displayed name
  username: 'menna',     // ← Login username
  clinic: 'Flatbush',
  role: 'staff',
  team: 'referral',
  permissions: ['view_holds', 'place_hold', 'clear_hold'],
  passwordHash: 'demo123',  // ← Password (change this)
  status: 'active'
}
```

4. Update the fields you need
5. Save the file
6. Run: `npm run build`
7. Redeploy

---

### Method 2: Update Google Sheets Database (Production)

**Step 1: Open Your Google Sheet**
1. Go to: https://docs.google.com/spreadsheets/d/1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM/
2. Click on "Users" tab at the bottom

**Step 2: Understand the Structure**
```
Row 1 (Header):
  A: Email
  B: Name
  C: Username
  D: Clinic
  E: Role
  F: Team
  G: Permissions
  H: Password (or Password Hash)
  I: Status

Row 2: First user data
Row 3: Second user data
... etc
```

**Step 3: Update User Info**
- Find the row with the user
- Update any column as needed
- Example: To change Menna's password:
  - Find row with "menna" in column C
  - Update column H with new password

**Step 4: Verify Changes**
- The app reads from this sheet directly
- Changes take effect immediately (with 5-minute cache)
- No rebuild needed when updating Google Sheets

---

## Adding New Users to the System

### Method 1: Add to Google Sheets (Recommended)

1. Open your Users sheet
2. Find the next empty row
3. Add new user data:

```
Email                      | Name              | Username  | Clinic       | Role   | Team      | Permissions              | Password | Status
newuser@cobsolution.com   | New User Name    | newuser   | Clinic Name  | staff  | referral  | view_holds,place_hold    | pass123  | active
```

4. Done! They can now log in

### Method 2: Add to Demo Users (Development)

1. Open `src/services/authService.ts`
2. Find `getMockUsers()` function
3. Add new user object before the closing bracket:

```typescript
{
  id: 'user_8',
  email: 'newuser@cobsolution.com',
  name: 'New User Name',
  username: 'newuser',
  clinic: 'Clinic Name',
  role: 'staff',
  team: 'referral',
  permissions: ['view_holds', 'place_hold', 'clear_hold'],
  passwordHash: 'newpassword123',
  status: 'active'
}
```

4. Save and rebuild: `npm run build`

---

## Password Management

### Change Individual Password

**In Google Sheets:**
1. Find user row
2. Update column H (Password)
3. Changes apply immediately

**In Demo Users (src/services/authService.ts):**
1. Find user object
2. Update `passwordHash` field
3. Save and rebuild

### Change All Passwords

**Example: Reset all users to 'demo123'**

Google Sheets:
1. Select column H (all rows)
2. Type `demo123` in first cell
3. Press Ctrl+D to fill down

Demo Users (src/services/authService.ts):
```typescript
// Change all passwordHash values to 'demo123'
passwordHash: 'demo123',
```

---

## Role-Based Access Control

### Admin Role
✅ Can do everything:
- View all holds
- Place holds
- Clear holds
- Send escalation emails
- Manage users
- View reports
- Access all features

### Staff Role
✅ Can:
- View holds
- Place holds
- Clear holds
- View reports
❌ Cannot:
- Manage users
- Send escalation emails
- Access admin settings

### Viewer Role
✅ Can:
- View holds only
❌ Cannot:
- Place holds
- Clear holds
- Modify anything
- Send emails

---

## Team Mapping

### By Team:
```
Referral Team:
  - Mostafa Hassan (Admin)
  - Menna Sayed
  - (Add more as needed)

Benefits Team:
  - Omar Abdullah
  - Aya Mohamed
  - Shaimaa Khaled

Customer Care:
  - (Add users as needed)

Clinic:
  - Ali Esmail (Viewer)
  - (Add users as needed)
```

### Update Team Assignment:
1. Open Google Sheets Users tab
2. Find user in column F (Team)
3. Update with: referral, benefits, customercare, or clinic
4. Save

---

## Permissions System

### Available Permissions:
```
view_holds           - Can see hold dashboard
place_hold          - Can place new holds
clear_hold          - Can clear existing holds
escalate            - Can send escalation emails
manage_users        - Can manage user accounts
generate_reports    - Can view and export reports
```

### How to Update Permissions:

**In Google Sheets (Column G):**
```
Single permission: view_holds

Multiple permissions (comma-separated):
view_holds,place_hold,clear_hold,escalate
```

**In Demo Users (src/services/authService.ts):**
```typescript
permissions: ['view_holds', 'place_hold', 'clear_hold', 'escalate']
```

---

## User Status Management

### Active vs Inactive Users

**In Google Sheets (Column I):**
- `active` - User can log in ✅
- `inactive` - User cannot log in ❌

**In Demo Users (src/services/authService.ts):**
```typescript
status: 'active'    // Can log in
status: 'inactive'  // Blocked from login
```

---

## Troubleshooting User Issues

### Problem: User cannot log in
**Check:**
1. Username is correct (case-insensitive)
2. Status is "active" in Google Sheets
3. Password is correct
4. No extra spaces in username/password

### Problem: Wrong name displayed
**Check:**
1. Column B (Name) in Google Sheets has correct name
2. Clear browser cache
3. Rebuild the app
4. Log in again

### Problem: Wrong clinic/role displayed
**Check:**
1. Columns D (Clinic) and E (Role) are correct in Google Sheets
2. Clear localStorage: `localStorage.clear()`
3. Rebuild and test again

### Problem: User can't perform certain actions
**Check:**
1. User role is high enough
2. Permissions in column G include the needed action
3. User status is "active"
4. Clear app cache and try again

---

## Backup & Recovery

### Backup User Data
1. Open Google Sheets "Users" tab
2. Select all data (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Excel or text file
5. Save backup file

### Restore User Data
1. Open original data backup
2. Copy data (Ctrl+C)
3. Open Google Sheets "Users" tab
4. Select cell A2
5. Paste (Ctrl+V)
6. Verify all data restored correctly

---

## API Connection

### When Google Sheets is Connected:
- App reads directly from "Users" tab
- Changes sync automatically (5-min cache)
- No rebuild needed
- Real-time user management

### When Google Sheets is NOT Connected:
- App uses demo users from `getMockUsers()`
- Changes require code edit and rebuild
- Good for offline/testing

### How to Enable Google Sheets Connection:

1. Get your Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_PART]/edit
   ```

2. Get Google API Key:
   - Go to Google Cloud Console
   - Create new project
   - Enable Sheets API
   - Create API key
   - Restrict to Sheets API only

3. Update `.env.local`:
   ```
   REACT_APP_SPREADSHEET_ID=your_sheet_id_here
   REACT_APP_GOOGLE_API_KEY=your_api_key_here
   ```

4. Rebuild: `npm run build`

---

## Summary

✅ **You can now log in as Menna Sayed with:**
- Username: `menna`
- Password: `demo123`
- Your actual name, email, and clinic will be displayed

✅ **Manage users through:**
- Google Sheets (recommended for production)
- Demo users file (for development)

✅ **Change passwords:**
- Update column H in Google Sheets, OR
- Update `passwordHash` in demo users array

✅ **Add new users:**
- Add row to Google Sheets Users tab
- App automatically picks them up

**Questions? Check the AUTHENTICATION_SETUP.md file for more details!**
