# PTOC Hold Management System - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Access the Application

Visit the deployed application at your hosting URL.

### 2. Login with Demo Credentials

```
Username: mostafa
Password: demo123
Role: Admin
```

Other demo users:
- `omar / demo123` (Staff)
- `menna / demo123` (Staff)
- `aya / demo123` (Staff)
- `ali / demo123` (Viewer)

---

## Production Setup (15-30 minutes)

### Prerequisites
- Google Account
- Your PTOC Database Spreadsheet
- Admin access to Google Cloud Console

### Step 1: Set Up Google Sheets API

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "Select a Project" → "New Project"
   - Name: "PTOC Hold Management"
   - Click "Create"

2. **Enable Google Sheets API:**
   - Search for "Google Sheets API" in the search bar
   - Click "Enable"
   - This might take a minute to activate

3. **Create an API Key:**
   - Go to Credentials (left menu)
   - Click "Create Credentials" → "API Key"
   - Copy your API key
   - ⚠️ **IMPORTANT:** Restrict this key to Google Sheets API only:
     - Click on your API key
     - Scroll to "API restrictions"
     - Select "Google Sheets API"
     - Click "Save"

### Step 2: Prepare Your Google Sheets

1. **Access your PTOC Database spreadsheet**

2. **Verify/Create Tab Structure:**
   - Tab 1: "Database" (your holds data)
   - Tab 2: "Users" (user credentials)
   - Tab 3: "Hold History" (cleared holds)
   - Tab 4: "Holds" (active holds)

3. **Set Up Users Tab:**
   ```
   Column A: Email (e.g., auth28@cobsolution.com)
   Column B: Name (e.g., Mostafa Hassan)
   Column C: Username (e.g., mostafa)
   Column D: Clinic (e.g., Fordham)
   Column E: Role (admin, staff, or viewer)
   Column F: Team (referral, benefits, customercare, clinic)
   Column G: Permissions (comma-separated list)
   Column H: Password Hash (SHA-256 hashed)
   Column I: Status (active or inactive)
   ```

4. **Share the Spreadsheet:**
   - Click "Share"
   - Make sure it's set to "Anyone with the link can view" or share with specific users
   - Note your Spreadsheet ID from the URL:
     ```
     https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
     ```

### Step 3: Configure the Application

1. **Create Environment File:**
   - Create `.env.local` in the project root
   - Add these variables:
   ```env
   REACT_APP_GOOGLE_API_KEY=YOUR_API_KEY_HERE
   REACT_APP_SHEET_ID=YOUR_SPREADSHEET_ID_HERE
   REACT_APP_DB_NAME=Database
   REACT_APP_USERS_TAB=Users
   REACT_APP_HISTORY_TAB=Hold History
   ```

2. **Update Service Configurations:**

   **In `src/services/authService.ts`:**
   ```typescript
   const DB_CONFIG: DatabaseConfig = {
     spreadsheetId: process.env.REACT_APP_SHEET_ID || '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM',
     apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE',
     usersTab: process.env.REACT_APP_USERS_TAB || 'Users'
   };
   ```

   **In `src/services/databaseService.ts`:**
   ```typescript
   const DB_CONFIG = {
     spreadsheetId: process.env.REACT_APP_SHEET_ID || '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM',
     apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY_HERE',
     tabs: {
       database: process.env.REACT_APP_DB_NAME || 'Database',
       holds: 'Holds',
       history: process.env.REACT_APP_HISTORY_TAB || 'Hold History',
       users: process.env.REACT_APP_USERS_TAB || 'Users'
     }
   };
   ```

### Step 4: Build & Deploy

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The 'dist' folder is ready to deploy
```

---

## User Management

### Adding a New User

1. Open your PTOC Database spreadsheet
2. Go to the "Users" tab
3. Add a new row with:
   - Email: `user@cobsolution.com`
   - Name: `John Doe`
   - Username: `johndoe`
   - Clinic: `Fordham`
   - Role: `staff`
   - Team: `referral`
   - Permissions: `view_holds,place_hold,clear_hold`
   - Password Hash: Generate using SHA-256
   - Status: `active`

### Password Generation

Use this online tool or Node.js:

```javascript
// Node.js
const crypto = require('crypto');
const password = 'your_password_here';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

Or in a browser console:

```javascript
async function hashPassword(pwd) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

hashPassword('demo123').then(console.log);
```

---

## Role & Permission Management

### Role Definitions

| Feature | Admin | Staff | Viewer |
|---------|-------|-------|--------|
| View Holds | ✅ | ✅ | ✅ |
| Place Hold | ✅ | ✅ | ❌ |
| Clear Hold | ✅ | ✅ | ❌ |
| View History | ✅ | ✅ | ✅ |
| Escalate Hold | ✅ | ❌ | ❌ |
| Access Settings | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ |

### Custom Permissions

You can set custom permissions in the "Permissions" column:

**Available Permissions:**
- `view_holds` - View active holds
- `place_hold` - Place new holds
- `clear_hold` - Clear/resolve holds
- `escalate` - Send escalation emails
- `view_history` - View hold history
- `manage_users` - Manage user accounts
- `generate_reports` - Generate reports
- `access_settings` - Access admin settings

**Example:** Staff user with escalation rights
```
Permissions: view_holds,place_hold,clear_hold,escalate,generate_reports
```

---

## Testing the Integration

### Test Checklist

- [ ] Login with demo user (mostafa/demo123)
- [ ] Verify user info in header
- [ ] View Hold Dashboard
- [ ] Place a new hold
- [ ] View hold history
- [ ] Check escalation center
- [ ] Access settings
- [ ] Logout and login again
- [ ] Try with different roles (staff, viewer)

### Troubleshooting

**Problem:** "API key not valid"
```
✓ Check your API key is correct
✓ Verify Google Sheets API is enabled
✓ Ensure API key is restricted to Sheets API
```

**Problem:** "Spreadsheet not found"
```
✓ Verify Spreadsheet ID is correct
✓ Check spreadsheet is accessible
✓ Ensure tabs exist: Database, Users, Hold History
```

**Problem:** "User not found"
```
✓ Check username spelling (case-sensitive)
✓ Verify user row in Users tab
✓ Ensure Status = "active"
```

**Problem:** "CORS Error"
```
✓ This is normal - Google handles CORS for Sheets API
✓ Check browser console for specific error
✓ Verify API key restrictions
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel

# Add environment variables in Vercel dashboard:
# - REACT_APP_GOOGLE_API_KEY
# - REACT_APP_SHEET_ID
# - REACT_APP_DB_NAME
# - REACT_APP_USERS_TAB
# - REACT_APP_HISTORY_TAB
```

### Option 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Add environment variables in Netlify UI.

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and deploy:
```bash
docker build -t ptoc-hold-app .
docker run -p 3000:3000 ptoc-hold-app
```

---

## Performance Optimization

### Caching Strategy

The app implements smart caching:
- **User cache:** 5 minutes
- **Holds cache:** 2 minutes
- **History cache:** 5 minutes

### API Rate Limiting

Google Sheets API limits:
- 500 requests per 100 seconds per user
- 500 requests per 100 seconds per project

The app handles this by caching and batching requests.

---

## Security Checklist

- ✅ API key restricted to Sheets API
- ✅ Passwords hashed with SHA-256
- ✅ User sessions stored in localStorage
- ✅ HTTPS required for production
- ✅ Environment variables for sensitive data
- ✅ Role-based access control implemented
- ✅ Permission checks on all features

---

## Support & Documentation

- 📚 [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)
- 📖 [Component Documentation](./docs/COMPONENTS.md)
- 🐛 [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

---

## Next Steps

1. ✅ Complete Setup Guide (this document)
2. 📖 Read [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)
3. 🔧 Configure your `.env.local`
4. 🧪 Test with demo credentials
5. 👥 Add your team members to Users tab
6. 🚀 Deploy to production
7. 📊 Monitor and maintain

---

Made by Mostafa Hassan | PTOC Hold Management System v9.5
