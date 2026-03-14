# 🔐 Authentication Setup & Password Management Guide

## Current Status
✅ **System is now live with correct user mapping**

When you log in with username `menna` and password `demo123`, you will see:
- **Name**: Menna Sayed
- **Email**: menna.sayed@cobsolution.com
- **Clinic**: Flatbush
- **Role**: Staff
- **Team**: Referral

---

## User Credentials

### Demo Users (Current Setup)
All demo users use password: `demo123`

| Username | Full Name | Email | Clinic | Role | Status |
|----------|-----------|-------|--------|------|--------|
| mostafa | Mostafa Hassan | auth28@cobsolution.com | Fordham | Admin | ✅ Active |
| omar | Omar Abdullah | auth29@cobsolution.com | Astoria | Staff | ✅ Active |
| menna | Menna Sayed | menna.sayed@cobsolution.com | Flatbush | Staff | ✅ Active |
| aya | Aya Mohamed | billing35@cobsolution.com | Bay Ridge | Staff | ✅ Active |
| ali | Ali Esmail | ali.esmail@cobsolution.com | Midtown | Viewer | ✅ Active |
| shaimaa | Shaimaa Khaled | billing52@cobsolution.com | Bushwick | Staff | ✅ Active |
| menna_b | Menna Bassem | billing11@cobsolution.com | Tribeca | Staff | ✅ Active |

---

## How Authentication Works

### 1. **Login Flow**
```
User Enters Credentials
        ↓
Check Google Sheets "Users" Tab
        ↓
Match Username (Case-Insensitive)
        ↓
Verify Password Hash
        ↓
Return User Object with Correct Name, Email, Clinic, Role, Permissions
        ↓
Display User Info in Header
```

### 2. **What Happens When You Log In**

When you enter `username: menna` and `password: demo123`:

1. **Username Lookup**: System finds row in Users tab where column C = "menna"
2. **Name Retrieval**: Gets value from column B = "Menna Sayed"
3. **Email Retrieval**: Gets value from column A = "menna.sayed@cobsolution.com"
4. **Other Details**: Clinic, Role, Team, Permissions from corresponding columns
5. **Session Storage**: User object is saved to localStorage
6. **Display**: Header shows "Menna Sayed" with clinic and role

---

## How to Change Passwords

### Option 1: Update Demo Users (Quick)
Edit `src/services/authService.ts` line 209-217:

```typescript
{
  id: 'user_3',
  email: 'menna.sayed@cobsolution.com',
  name: 'Menna Sayed',
  username: 'menna',
  clinic: 'Flatbush',
  role: 'staff',
  team: 'referral',
  permissions: ['view_holds', 'place_hold', 'clear_hold'],
  passwordHash: 'CHANGE_THIS_TO_NEW_PASSWORD', // ← Update here
  status: 'active'
}
```

### Option 2: Update Google Sheets Database (Recommended for Production)

1. Open your Google Sheets database
2. Go to "Users" tab
3. For each user, update column H (Password Hash):
   - In production, use hashed passwords (SHA-256 or bcrypt)
   - For demo, you can use plain text (not recommended)

**Google Sheets Users Tab Structure**:
```
A: Email
B: Name
C: Username
D: Clinic
E: Role
F: Team
G: Permissions
H: Password (or Hash)
I: Status
```

---

## Password Hashing

### For Development (Current)
```javascript
passwordHash: 'demo123' // Plain text - demo only
```

### For Production (Recommended)
Use SHA-256 or bcrypt:

```javascript
// SHA-256 example
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Usage:
const hash = await hashPassword('demo123');
// Store 'hash' in Google Sheets
```

---

## Adding New Users

### Step 1: Add Row to Google Sheets
Add new row to "Users" tab with:
- Email
- Full Name
- Username (lowercase)
- Clinic
- Role (admin/staff/viewer)
- Team (referral/benefits/customercare/clinic)
- Permissions (comma-separated)
- Password Hash
- Status (active/inactive)

### Step 2: Update Demo Users (Optional)
Add to `getMockUsers()` in `src/services/authService.ts`:

```typescript
{
  id: 'user_8',
  email: 'newuser@cobsolution.com',
  name: 'New User Name',
  username: 'newuser',
  clinic: 'Clinic Name',
  role: 'staff',
  team: 'referral',
  permissions: ['view_holds', 'place_hold'],
  passwordHash: 'password123',
  status: 'active'
}
```

### Step 3: Rebuild
```bash
npm run build
```

---

## Permission Levels

### Admin
- ✅ view_holds
- ✅ place_hold
- ✅ clear_hold
- ✅ escalate
- ✅ manage_users
- ✅ generate_reports
- ✅ All actions

### Staff
- ✅ view_holds
- ✅ place_hold
- ✅ clear_hold
- ✅ generate_reports
- ❌ manage_users
- ❌ escalate

### Viewer
- ✅ view_holds
- ❌ place_hold
- ❌ clear_hold
- ❌ escalate
- ❌ manage_users

---

## Troubleshooting

### Issue: Wrong name displayed after login
**Solution**: 
1. Check username matches exactly in Users tab
2. Verify Google Sheets API is connected
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`

### Issue: "Username not found"
**Solution**:
1. Verify username exists in Users tab column C
2. Check for extra spaces
3. Username is case-insensitive but must match exactly

### Issue: "Invalid password"
**Solution**:
1. Verify password in Users tab column H
2. For demo mode, use `demo123`
3. Check for extra spaces in password field

### Issue: Can't access after password change
**Solution**:
1. Clear browser cache and localStorage
2. Log in again with new password
3. Check Google Sheets for correct password hash

---

## Security Recommendations

### For Production:
1. ✅ Use bcrypt or Argon2 for password hashing
2. ✅ Store hashed passwords only (never plain text)
3. ✅ Use HTTPS only
4. ✅ Implement 2FA (Two-Factor Authentication)
5. ✅ Add rate limiting for login attempts
6. ✅ Log all authentication events
7. ✅ Regular security audits
8. ✅ Enforce strong password policy

### Current Demo Status:
- ⚠️ Using plain text passwords (demo only)
- ⚠️ No rate limiting
- ⚠️ No 2FA
- ✅ User data verified against Google Sheets
- ✅ Session stored securely in localStorage

---

## Environment Variables

Create `.env.local` file:

```
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_SPREADSHEET_ID=your_sheet_id_here
REACT_APP_USERS_TAB=Users
REACT_APP_DATABASE_TAB=Database
```

---

## Support

For issues with authentication:
1. Check browser console (F12 → Console tab)
2. Verify Google Sheets connection
3. Clear localStorage and try again
4. Review error messages carefully

✅ **System is ready to use with correct user mapping!**
