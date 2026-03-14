# Adding Users to PTOC Hold Management System

Complete guide to adding new team members to the system.

---

## Quick Summary

You need to:
1. Open your Google Sheets database
2. Add user info to the "Users" tab
3. Generate a password hash
4. Share login credentials securely
5. Done! They can login immediately

---

## Step-by-Step Instructions

### Step 1: Access Your Database

1. Open your PTOC Database Google Sheet
2. Navigate to the **"Users"** tab
3. You should see columns: Email, Name, Username, Clinic, Role, Team, Permissions, Password Hash, Status

### Step 2: Add User Information

Click on the first empty row and fill in:

| Field | Example | Notes |
|-------|---------|-------|
| **Email** | rashwan@cobsolution.com | Full email address |
| **Name** | Rashwan | Full name for display |
| **Username** | rashwan | For login (lowercase, no spaces) |
| **Clinic** | Fordham | Must match clinic list |
| **Role** | staff | admin, staff, or viewer |
| **Team** | referral | referral, benefits, customercare, or clinic |
| **Permissions** | view_holds,place_hold,clear_hold | Comma-separated list |
| **Password Hash** | (see below) | Generated from password |
| **Status** | active | active or inactive |

### Step 3: Generate Password Hash

Open your browser console (F12 → Console tab) and paste this code:

```javascript
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate hash for password
hashPassword('newUserPassword123').then(hash => {
  console.log('Copy this hash:', hash);
});
```

**Steps:**
1. Replace `'newUserPassword123'` with the actual password you want
2. Press Enter
3. Copy the hash that appears in console
4. Paste into "Password Hash" column

**Example Output:**
```
Copy this hash: 6b3a55e0c69f19611da3c35f5897141e0a8f80f2f8e5e0b1b5f3d9e1a8c0f5d7
```

### Step 4: Verify User Entry

Check that your new user row has:
- ✅ All required fields filled
- ✅ Valid email address
- ✅ Unique username
- ✅ Valid clinic name
- ✅ Valid role (admin, staff, viewer)
- ✅ Valid team
- ✅ Status = "active"
- ✅ Password hash (64 character hex string)

### Step 5: Share Credentials

Send to user via secure channel:
```
Welcome to PTOC Hold Management System!

Your login credentials:
Username: rashwan
Password: [the password you set above - NOT the hash]
URL: [your application URL]

Your role: Staff
Your clinic: Fordham
Your team: Referral

Please change your password on first login.
```

---

## Role & Permission Reference

### Available Roles

**Admin**
```
Permissions: view_holds,place_hold,clear_hold,escalate,manage_users,generate_reports,access_settings
Can: Do everything
```

**Staff**
```
Permissions: view_holds,place_hold,clear_hold,generate_reports
Can: Manage holds, view reports
```

**Viewer**
```
Permissions: view_holds,view_history
Can: View holds and history only
```

### Available Permissions

| Permission | What it allows |
|------------|----------------|
| `view_holds` | See active holds dashboard |
| `place_hold` | Place new holds on patients |
| `clear_hold` | Clear/resolve holds |
| `view_history` | View cleared holds history |
| `escalate` | Send escalation emails |
| `manage_users` | Add/edit/remove users |
| `generate_reports` | Create and download reports |
| `access_settings` | Access admin settings |

### Example: Custom Permission Set

For a billing coordinator who needs to place holds and view reports:
```
Role: staff
Team: benefits
Permissions: view_holds,place_hold,clear_hold,generate_reports
```

---

## Clinic Reference

Valid clinic names (must match exactly):
```
- Allerton
- Astoria
- Bay Ridge
- Bedstuy
- Sunset
- Bensonhurst
- Brownsville
- Bushwick
- Castle Hill
- Cobble Hill
- Central Harlem
- Chelsea
- Church Ave
- Clinton Hill
- Corona
- Flatbush
- Fordham
- Grand Concourse
- Greenpoint
- Hells Kitchen
- Huntspoint
- Inwood
- Jamaica
- Lenox Hill
- Midtown
- Midwood
- Riverdale
- Sensory Freeway
- Sheepshead Bay
- Sugar Hill
- Tribeca
- Upper East Side
- Belmont
- Homecare
```

---

## Password Hash Generation Methods

### Method 1: Browser Console (Easiest)
```javascript
// Copy-paste in F12 → Console
async function hash(pwd) {
  const e = new TextEncoder();
  const d = e.encode(pwd);
  const h = await crypto.subtle.digest('SHA-256', d);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
}
hash('password123').then(console.log);
```

### Method 2: Node.js
```bash
node -e "const c = require('crypto'); console.log(c.createHash('sha256').update('password123').digest('hex'));"
```

### Method 3: Online Tool
Visit: https://www.sha256online.com/
- Enter password
- Click "Generate SHA256 hash"
- Copy the hash

---

## Bulk Add Multiple Users

If adding many users, create a template:

| Email | Name | Username | Clinic | Role | Team | Permissions | Status |
|-------|------|----------|--------|------|------|-------------|--------|
| auth@email.com | Name 1 | username1 | Fordham | staff | referral | view_holds,place_hold,clear_hold | active |
| auth2@email.com | Name 2 | username2 | Astoria | staff | benefits | view_holds,place_hold,clear_hold | active |
| auth3@email.com | Name 3 | username3 | Bay Ridge | viewer | clinic | view_holds,view_history | active |

Then:
1. Generate hashes for each password
2. Fill Password Hash column
3. Paste all rows into Google Sheet

---

## Testing New User Account

After adding a user:

1. **Test Login:**
   - Open application
   - Enter username and password
   - Should login successfully

2. **Verify Permissions:**
   - Check which features are available
   - Try an action they shouldn't have permission for
   - Should see "Permission Denied" message

3. **Confirm Clinic Assignment:**
   - Header should show correct clinic
   - Should only see holds for their clinic (if configured)

4. **Check Team Assignment:**
   - Verify in holds they create
   - Should route to correct team

---

## Resetting User Passwords

If a user forgets their password:

1. Open Users tab
2. Find their row
3. Generate new hash for new password (follow Step 3 above)
4. Replace old hash with new hash
5. Send new credentials securely

---

## Deactivating Users

To remove access without deleting:

1. Open Users tab
2. Find user's row
3. Change Status to: `inactive`
4. User cannot login anymore

---

## Troubleshooting User Issues

### "User not found" error
- Check username spelling (case-sensitive)
- Verify user row exists in Users tab
- Check Status = "active"

### "Invalid password" error
- Verify password hash is correct
- Check no extra spaces in hash
- Hash should be exactly 64 characters

### Permission denied on feature
- Check user's permissions list
- Verify spelling of permission
- Permissions are comma-separated, no spaces after commas

### Can't find clinic
- Check clinic name matches exactly
- Clinic names are case-sensitive
- Refer to clinic list above

---

## Security Tips

✅ **DO:**
- Change default demo passwords immediately
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Share credentials only via secure channels
- Regenerate hashes securely
- Audit user list regularly
- Remove inactive users after 30 days

❌ **DON'T:**
- Share passwords in email
- Use simple passwords (password123, etc.)
- Reuse the same password
- Leave demo accounts active
- Share API keys with users
- Store passwords in plain text

---

## Examples

### Example 1: Adding a Clinic Manager

```
Email: ramy@cobsolution.com
Name: Ramy Elkomi
Username: ramy
Clinic: Fordham
Role: staff
Team: referral
Permissions: view_holds,place_hold,clear_hold,generate_reports
Password: FordhamRamy2024!
Password Hash: [generate with method above]
Status: active
```

### Example 2: Adding a Benefits Coordinator

```
Email: menna@cobsolution.com
Name: Menna Sayed
Username: menna
Clinic: Multiple (Homecare coordination)
Role: staff
Team: benefits
Permissions: view_holds,place_hold,clear_hold,generate_reports,escalate
Password: BenefitsTeam2024!
Password Hash: [generate with method above]
Status: active
```

### Example 3: Adding a Viewer/Monitor

```
Email: monitor@cobsolution.com
Name: Reports Monitor
Username: monitor
Clinic: All
Role: viewer
Team: clinic
Permissions: view_holds,view_history
Password: MonitorOnly2024!
Password Hash: [generate with method above]
Status: active
```

---

## Next Steps

1. ✅ Add user to Users tab
2. ✅ Generate password hash
3. ✅ Set Status = "active"
4. ✅ Share credentials securely
5. ✅ User logs in and tests
6. ✅ Monitor login activity

---

## Support

Questions about adding users?
- Check clinic name in the reference list
- Verify permissions are comma-separated
- Ensure password hash is 64 characters
- Check username is unique

Contact: support@cobsolution.com

---

Made by Mostafa Hassan | PTOC Hold Management System v9.5
