# 🏥 PTOC Hold Management System v9.5

**Production-Ready Authorization & Hold Control System with User Authentication & Google Sheets Integration**

Made by Mostafa Hassan

---

## 🚀 Features

### Authentication & Security
- ✅ Username/Password login system
- ✅ Role-based access control (Admin, Staff, Viewer)
- ✅ Permission management system
- ✅ Session management with localStorage
- ✅ SHA-256 password hashing

### Hold Management
- ✅ Place holds on patients
- ✅ Clear/resolve holds
- ✅ View active holds
- ✅ Track hold duration
- ✅ Add custom notes
- ✅ Multiple hold reasons

### Dashboard & Analytics
- ✅ Real-time hold statistics
- ✅ Holds by clinic breakdown
- ✅ Holds by reason analysis
- ✅ Team member statistics
- ✅ Escalation tracking (7+ days)
- ✅ Days on hold indicator

### Additional Features
- ✅ Hold history search
- ✅ Escalation notifications
- ✅ Weekly summary reports
- ✅ Re-hold protection
- ✅ Multi-clinic support
- ✅ Export capabilities

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [User Management](#user-management)
7. [Deployment](#deployment)
8. [API Integration](#api-integration)
9. [Troubleshooting](#troubleshooting)
10. [File Structure](#file-structure)

---

## 🎯 Quick Start

### Demo Access (Immediate)
```
URL: Application will be deployed to your server
Username: mostafa
Password: demo123
```

This gives you full admin access to test all features.

### Other Demo Users
- **Staff:** `omar` / `demo123`
- **Staff:** `menna` / `demo123`
- **Viewer:** `ali` / `demo123`

---

## 💻 System Requirements

- **Node.js:** v16 or higher
- **npm:** v7 or higher
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet:** Required for Google Sheets API calls

---

## 📥 Installation

### 1. Clone/Download Project
```bash
cd ptoc-hold-management
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## ⚙️ Configuration

### Environment Variables
Create `.env.local` in project root:

```env
# Google Sheets Configuration
REACT_APP_GOOGLE_API_KEY=YOUR_API_KEY_HERE
REACT_APP_SHEET_ID=1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM

# Database Tabs
REACT_APP_DB_NAME=Database
REACT_APP_USERS_TAB=Users
REACT_APP_HISTORY_TAB=Hold History
```

### Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Sheets API
4. Create an API Key (restrict to Sheets API)
5. Copy the key to `.env.local`

---

## 📊 Database Setup

### Google Sheets Structure

Your database should have these tabs:

#### 1. Users Tab
| Column | Header | Type |
|--------|--------|------|
| A | Email | email@domain.com |
| B | Name | John Doe |
| C | Username | johndoe |
| D | Clinic | Fordham |
| E | Role | admin/staff/viewer |
| F | Team | referral/benefits/customercare/clinic |
| G | Permissions | comma,separated,list |
| H | Password Hash | SHA-256 hash |
| I | Status | active/inactive |

#### 2. Database Tab
| Column | Header | Type |
|--------|--------|------|
| A | Placed Date | Date |
| B | Placed By | email@domain.com |
| C | Patient Name | Text |
| D | EMR ID | Text |
| E | Insurance | Text |
| F | Hold Category | Text |
| G | Hold Notes | Text |
| H | Status | HOLD/CLEAR |
| I | Clinic | Text |

#### 3. Hold History Tab
Same structure as Database tab but for historical records.

---

## 👥 User Management

### Add New User

1. Open your Google Sheets database
2. Go to "Users" tab
3. Add new row with user info
4. Generate password hash:

```javascript
// In browser console:
async function hashPassword(pwd) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

hashPassword('password123').then(console.log);
```

### Roles & Permissions

**Admin Role:**
- View all holds
- Place holds
- Clear holds
- Send escalations
- Manage users
- View reports
- Access settings

**Staff Role:**
- View all holds
- Place holds
- Clear holds
- View reports

**Viewer Role:**
- View all holds
- View history

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel

# Add environment variables in dashboard
# REACT_APP_GOOGLE_API_KEY
# REACT_APP_SHEET_ID
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
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

---

## 🔌 API Integration

### AuthService

```typescript
import { AuthService } from './services/authService';

// Login
const result = await AuthService.login({ 
  username: 'mostafa', 
  password: 'demo123' 
});

// Check permission
AuthService.hasPermission(user, 'place_hold');

// Save session
AuthService.saveSession(user);

// Logout
AuthService.logout();
```

### DatabaseService

```typescript
import { DatabaseService } from './services/databaseService';

// Fetch active holds
const holds = await DatabaseService.fetchActiveHolds();

// Get statistics
const stats = await DatabaseService.getHoldsStats();

// Add new hold
await DatabaseService.addHold({...});

// Clear hold
await DatabaseService.clearHold(holdId);
```

### AuthContext

```typescript
import { useAuth } from './contexts/AuthContext';

export function MyComponent() {
  const { user, logout, hasPermission } = useAuth();
  
  return (
    <div>
      <h1>Hello {user?.name}</h1>
      <p>{user?.clinic}</p>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Login Issues

**"User not found"**
- Check username spelling (case-sensitive)
- Verify user exists in Users tab
- Ensure Status = "active"

**"Invalid password"**
- Verify password hash is correct
- Check password wasn't changed

### Database Issues

**"API key not valid"**
- Verify API key in .env.local
- Check API key is restricted to Sheets API
- Regenerate key if needed

**"Spreadsheet not found"**
- Check spreadsheet ID is correct
- Verify sheet is accessible
- Ensure tabs exist

**"Permission denied"**
- Check Google Cloud permissions
- Verify spreadsheet is shared

### Performance Issues

**"Slow load times"**
- Check internet connection
- Verify API rate limits not exceeded
- Clear browser cache
- Check for large data volumes

---

## 📁 File Structure

```
ptoc-hold-management/
├── src/
│   ├── components/
│   │   ├── Login.tsx                 # Authentication UI
│   │   ├── HoldDashboard.tsx         # Main dashboard
│   │   ├── HoldPlacementForm.tsx     # Place new holds
│   │   ├── HoldHistory.tsx           # Hold history
│   │   ├── EscalationCenter.tsx      # Escalation management
│   │   └── Settings.tsx              # App settings
│   ├── services/
│   │   ├── authService.ts            # Authentication logic
│   │   └── databaseService.ts        # Database operations
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth state management
│   ├── types/
│   │   └── auth.ts                   # TypeScript types
│   ├── App.tsx                       # Main app component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Tailwind CSS
├── dist/                             # Production build
├── .env.local                        # Environment variables
├── vite.config.ts                    # Vite configuration
├── tailwind.config.js                # Tailwind configuration
├── package.json                      # Dependencies
├── SETUP_GUIDE.md                    # Setup instructions
├── DATABASE_INTEGRATION_GUIDE.md     # Database guide
└── README.md                         # This file
```

---

## 🔐 Security

### Best Practices
- ✅ Passwords hashed with SHA-256
- ✅ API keys restricted to Sheets API
- ✅ Session stored locally only
- ✅ HTTPS required in production
- ✅ Environment variables for secrets
- ✅ Role-based access control
- ✅ Permission validation

### Production Checklist
- [ ] Use HTTPS only
- [ ] Restrict API key scope
- [ ] Enable 2FA on Google Account
- [ ] Regularly rotate API keys
- [ ] Monitor API usage
- [ ] Audit user access logs
- [ ] Backup database regularly

---

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md) - Database configuration
- [Component Documentation](./docs/COMPONENTS.md) - Component API
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues

---

## 🎯 Feature Roadmap

### Current (v9.5)
- ✅ User authentication
- ✅ Role-based access control
- ✅ Hold management dashboard
- ✅ Google Sheets integration

### Upcoming (v10.0)
- 🔄 Email notifications
- 🔄 SMS alerts
- 🔄 Bulk operations
- 🔄 Advanced reporting
- 🔄 Mobile app
- 🔄 API endpoints
- 🔄 Audit logs

---

## 🤝 Support

For issues or questions:

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)
3. Check troubleshooting section above
4. Review browser console for errors
5. Contact support@cobsolution.com

---

## 📝 License

PTOC Hold Management System v9.5
Made by Mostafa Hassan

---

## 🎉 Getting Started

1. **Login:** Use demo credentials (mostafa / demo123)
2. **Explore:** Check out the dashboard and features
3. **Setup:** Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for production
4. **Configure:** Add your database and users
5. **Deploy:** Use Vercel, Netlify, or Docker

---

**Ready to get started?** 👉 [Read the Setup Guide](./SETUP_GUIDE.md)

Happy managing! 🚀
