# 🔌 PTOC Hold Management System - Integration Guide

## Overview

This guide explains how to connect the PTOC Hold Management System web app to the live Google Sheets database and Apps Script backend.

---

## 🗂️ Database Structure

### Primary Database URL
```
https://docs.google.com/spreadsheets/d/1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM/edit
```

### Sheet Tabs

#### 1. "Database" Tab (Main)
The core data store with these columns:

| Col | Field | Type | Purpose |
|-----|-------|------|---------|
| A | Date Placed | Date | When hold was placed |
| B | User Email | Email | Who placed the hold |
| C | Patient Name | Text | Full patient name |
| D | EMR ID | Text | Patient identifier |
| E | Insurance | Text | Insurance provider |
| F | Category | Text | Hold reason category |
| G | Note | Text | Hold description |
| H | Status | Text | "Hold", "Clear", "Once a Week" |
| I | Location | Text | Clinic location |
| J | Date Placed | Date | Duplicate timestamp |
| K | User Email | Email | Duplicate user |
| L | Thread ID | Text | Gmail thread ID |
| M | Escalated Flag | Text | "ESCALATED" or blank |
| N | Days on Hold | Number | Calculated field |
| O | Request Status | Text | Workload status |
| P | Submission Date | Date | Auth submission date |
| Q | Updates Date | Date | Last update date |
| R | Decision Date | Date | Authorization decision date |
| S | Decision | Text | Approved/Denied |
| T | Additional Info | Text | Notes |

#### 2. "From Workload Holds" Tab (Secondary)
Mirror of main database with additional formula columns:
- Column 17: Status calculation formula
- Column 18: Date lookup formula

#### 3. "Hold History" Tab (Audit Log)
Automatic logging of all actions:

| Col | Field | Type |
|-----|-------|------|
| A | Timestamp | DateTime |
| B | Action | Text |
| C | Patient Name | Text |
| D | EMR ID | Text |
| E | Location | Text |
| F | Category | Text |
| G | Reason Label | Text |
| H | User | Email |

#### 4. "Deletion Log" Tab (Auto-created)
Tracks all deleted values for audit trail

#### 5. "Hold Dashboard" Tab (Reports)
Auto-generated dashboard with:
- Summary statistics
- Holds by clinic
- Holds by reason
- Holds by team member

---

## 🔐 Email Routing Configuration

### Primary Email Accounts
```javascript
const primaryEmail      = "auth28@cobsolution.com";      // Default recipient
const referralCcList    = "auth28@cobsolution.com";      // Referral issues
const benefitsEmail     = "auth28@cobsolution.com";      // Insurance/COB issues
const customerCareEmail = "auth28@cobsolution.com";      // Authorization issues
const globalCcList      = "auth28@cobsolution.com";      // All emails CCed
```

### Clinic Email Mapping
```javascript
const clinicEmails = {
  "Fordham":         "auth28@cobsolution.com",
  "Astoria":         "auth28@cobsolution.com",
  "Bay Ridge":       "auth28@cobsolution.com",
  // ... 30+ clinics total
};
```

### User Email to Name Mapping
```javascript
const userNames = {
  "auth28@cobsolution.com":           "Mostafa Hassan",
  "auth29@cobsolution.com":           "Omar Abdullah",
  "menna.sayed@cobsolution.com":      "Menna Sayed",
  // ... 15+ users total
};
```

---

## 📡 API Integration Points

### 1. Google Sheets API

**Setup Required:**
1. Enable Google Sheets API in Google Cloud Console
2. Create service account credentials
3. Share spreadsheet with service account email
4. Store credentials securely

**Implementation:**
```javascript
// Example: Read holds from database
import { google } from 'googleapis';

const sheets = google.sheets({ version: 'v4', auth });
const result = await sheets.spreadsheets.values.get({
  spreadsheetId: '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM',
  range: 'Database!A:S',
});

const rows = result.data.values;
// Process holds data
```

### 2. Gmail API

**Setup Required:**
1. Enable Gmail API in Google Cloud Console
2. Add Gmail scope to OAuth2
3. Grant app permission to read/send emails

**Implementation:**
```javascript
// Example: Send hold notification email
const gmail = google.gmail({ version: 'v1', auth });

await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    raw: Base64.encode(emailMessage),
  },
});
```

### 3. Apps Script Binding

**Current System:**
The original system uses Google Apps Script as the backend. To migrate:

```javascript
// In React component
const holdData = await window.google.script.run
  .withSuccessHandler((result) => {
    // Handle response
  })
  .withFailureHandler((error) => {
    // Handle error
  })
  .processHoldFromSidebar(category, label, customNote, forceRehold);
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────┐
│   React Web Application (Frontend)   │
│  - Dashboard                         │
│  - Hold Placement                    │
│  - History Search                    │
│  - Escalation Management             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│   API Layer (Node.js/Express)        │
│  - Google Sheets API client          │
│  - Gmail API client                  │
│  - Database operations               │
│  - Email routing                     │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│   Google Cloud Services              │
│  - Google Sheets (Data storage)      │
│  - Gmail (Email notifications)       │
│  - Cloud Tasks (Scheduling)          │
└─────────────────────────────────────┘
```

---

## 🛠️ Implementation Steps for Live Integration

### Step 1: Set Up Backend Service

```bash
# Create Node.js/Express server
npm init -y
npm install express google-auth-library googleapis nodemailer
```

### Step 2: Create API Endpoints

```javascript
// GET /api/holds - Fetch all active holds
// POST /api/holds - Create new hold
// PUT /api/holds/:id - Update hold status
// DELETE /api/holds/:id - Clear hold
// GET /api/history - Search hold history
// GET /api/escalations - Get 7+ day holds
// POST /api/email/send - Send notification email
```

### Step 3: Implement Database Service

```javascript
class HoldsDatabase {
  async getActiveHolds() {
    // Query Database sheet for all HOLD/ONCE A WEEK status
  }
  
  async placeHold(patientData) {
    // Add new row to Database sheet
  }
  
  async clearHold(emrId, rowIndex) {
    // Update Status to "Clear"
  }
  
  async searchHistory(query) {
    // Query Hold History sheet
  }
}
```

### Step 4: Implement Email Service

```javascript
class EmailService {
  async sendHoldNotification(clinic, patients, reason) {
    // Get clinic email from routing map
    // Build HTML email from template
    // Send via Gmail API
    // Log thread ID to Database sheet
  }
  
  async sendEscalationEmail(patient, daysOnHold) {
    // Special escalation email format
  }
  
  async sendWeeklySummary(stats) {
    // Aggregate stats and send summary
  }
}
```

### Step 5: Connect Frontend to Backend

```typescript
// In React component
const API_BASE = process.env.REACT_APP_API_URL;

async function placeHold(category: string, label: string, patients: string[]) {
  const response = await fetch(`${API_BASE}/api/holds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      label,
      patients,
      timestamp: new Date(),
      user: getCurrentUser(),
    }),
  });
  
  return response.json();
}
```

### Step 6: Implement Scheduled Tasks

```javascript
// Using node-cron for scheduled tasks
const cron = require('node-cron');

// Auto-sync every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await syncHoldStatuses();
});

// Daily escalation check at 8 AM EST
cron.schedule('0 8 * * *', async () => {
  await checkAndSendEscalations();
}, {
  timezone: 'America/New_York'
});

// Weekly summary every Monday at 8 AM
cron.schedule('0 8 * * 1', async () => {
  await sendWeeklySummary();
}, {
  timezone: 'America/New_York'
});
```

---

## 🔒 Security Considerations

### Authentication
- OAuth 2.0 for Google APIs
- Session tokens for user authentication
- JWT for API endpoints

### Authorization
- Verify user email against allowed users
- Role-based access control:
  - **Standard User**: Place/clear holds, view history
  - **Admin**: Access admin functions with password
  - **System**: Automated tasks (nightly reports, escalations)

### Data Protection
- Encrypt sensitive data in transit (HTTPS)
- Mask sensitive info in logs
- Rate limiting on API endpoints
- Input validation on all forms

### Audit Trail
- Log all holds placed/cleared
- Track user actions with timestamps
- Maintain deletion history
- Monitor escalation triggers

---

## 📊 Hold Reasons Configuration

The system has 8 main categories with 27 total specific reasons:

```javascript
const HOLD_REASONS = [
  {
    category: "Missing Referral",
    reasons: [
      "No Referral on Chart",
      "Restricted Clearance (Direct Access)",
      "MD Signature Missing"
    ]
  },
  // ... 7 more categories
];
```

### Customizing Hold Reasons

1. Edit `HOLD_REASONS` array in backend
2. Add new `category` or `reasons` as needed
3. Define `routing` for email destination
4. Set `isDynamic` flag for custom fields
5. Define `dynamicPrompt` for user input
6. Create WebPT message template in `webpt` field

---

## 📝 Hold Status Values

```
"Hold"       - Patient is on active hold
"Clear"      - Hold has been resolved
"Once a Week" - Special status for limited sessions
"PENDING-NIGHTLY" - Email pending send in nightly job
"PENDING-RETRY" - Email failed, will retry
"ESCALATED" - Flagged for escalation email
"PROCESSED-ERROR-CAUGHT" - System error occurred
```

---

## 🚀 Deployment Checklist

- [ ] Set up Google Cloud project and APIs
- [ ] Configure OAuth credentials
- [ ] Deploy backend service (Node.js/Express)
- [ ] Update API base URL in React env vars
- [ ] Set up scheduled tasks (cron)
- [ ] Configure email accounts
- [ ] Test Google Sheets connection
- [ ] Test Gmail integration
- [ ] Load test with sample data
- [ ] Set up error logging (Sentry/Datadog)
- [ ] Configure backup schedule
- [ ] Document access procedures
- [ ] Train users on system
- [ ] Go live with production URL

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('HoldsService', () => {
  it('should place a hold without duplicates', () => {
    // Test duplicate prevention
  });
  
  it('should escalate holds 7+ days old', () => {
    // Test escalation logic
  });
  
  it('should route emails to correct departments', () => {
    // Test email routing
  });
});
```

### Integration Tests
- Test Sheets API connectivity
- Test Gmail API sending
- Test database operations
- Test email templates

### E2E Tests
- Place a hold → Verify in database → Check email sent
- Clear a hold → Verify status updated → Check email sent
- Search history → Verify results accurate
- Escalation trigger → Verify emails sent to correct team

---

## 📚 Code Examples

### Create Hold
```typescript
interface CreateHoldRequest {
  category: string;
  label: string;
  patients: string[];
  customNote?: string;
  location: string;
}

async function createHold(req: CreateHoldRequest) {
  const reason = getReasonByLabel(req.label);
  const noteText = req.customNote || reason.note;
  
  // Add to database
  await database.appendRow({
    dateCreated: new Date(),
    patient: req.patients,
    category: req.category,
    note: noteText,
    status: 'Hold'
  });
  
  // Send emails
  await emailService.sendHoldNotifications(
    req.location,
    req.patients,
    req.category
  );
  
  return { success: true };
}
```

### Search History
```typescript
async function searchHistory(query: string, type?: string) {
  const results = await database.queryHistorySheet(
    `AND(
      OR(patientName CONTAINS '${query}', emrId = '${query}'),
      ${type ? `action = '${type}'` : '1 = 1'}
    )`
  );
  
  return results.map(row => ({
    timestamp: row.timestamp,
    action: row.action,
    patient: row.patientName,
    emrId: row.emrId,
    category: row.category,
    user: userNames[row.userEmail]
  }));
}
```

---

## 🔗 External Resources

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Google Cloud Console](https://console.cloud.google.com)
- [Node.js Google Client Library](https://github.com/googleapis/google-api-nodejs-client)

---

## 📞 Support

For integration questions:
- Contact: Mostafa Hassan
- Email: auth28@cobsolution.com
- Original Apps Script system available for reference

---

**Last Updated**: January 2024
**Version**: 9.5 Integration Guide
