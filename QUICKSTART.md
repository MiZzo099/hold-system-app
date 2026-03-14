# 🚀 PTOC Hold Management System - Quick Start Guide

## Welcome!

You're now running the **PTOC Hold Management System v9.5** - a professional healthcare authorization and hold management platform.

---

## 🎯 What You Can Do

### 1. **View the Dashboard** (Default View)
- See live statistics on active holds
- Monitor holds by clinic, reason, and team member
- Check for critical alerts on holds 14+ days old
- View recent activity feed

### 2. **Place a New Hold**
- Click **🔒 Place Hold** tab
- Follow the 3-step wizard
- Select hold category and specific reason
- Enter patient information
- Automatic email notifications sent

### 3. **Search Hold History**
- Click **📜 History** tab
- Search by patient name, EMR ID, or location
- Filter by action type (placed, cleared, escalated)
- Browse paginated results

### 4. **Monitor Escalations**
- Click **⚠️ Escalation** tab
- View holds requiring immediate attention
- See critical (14+ days) and high (7-13 days) holds
- Send follow-up emails or clear holds

### 5. **Configure Settings**
- Click **⚙️ Settings** tab
- Adjust automation intervals
- Configure email preferences
- Monitor active triggers
- Access admin functions (password required)

---

## 🎨 Understanding the Color Scheme

- **🔵 Blue**: Primary information and actions
- **🔴 Red**: Critical alerts and urgent actions (14+ days)
- **🟡 Yellow**: High priority warnings (7-13 days)
- **🟢 Green**: Success states and cleared holds

---

## 📊 Dashboard Metrics Explained

| Metric | Meaning |
|--------|---------|
| **Total Active Holds** | All patients currently on hold |
| **Open 7+ Days** | Holds requiring follow-up |
| **Open 14+ Days** | Critical holds needing immediate action |
| **Cleared This Week** | Holds successfully resolved |
| **Placed This Week** | New holds created |

---

## 🔒 Placing a Hold - Step by Step

### Step 1: Select Category
Choose from these categories:
- **Missing Referral** - Referral document issues
- **Pending Authorization** - Awaiting MD or insurance approval
- **New Case Required** - Denied or duplicate cases
- **COB Update** - Insurance coordination issues
- **Coverage Issue** - Insurance inactive or not accepted
- **Coverage Issue WC** - Workers' Comp specific issues
- **Insurance Consent** - Missing signed consent
- **Discharge Letter** - Need letter from previous provider

### Step 2: Select Reason
Each category has 1-4 specific reasons. Choose the most accurate one.

### Step 3: Enter Patients & Notes
- Paste one or more patient EMR IDs (comma-separated)
- Optionally add custom notes to override default message
- Review the hold summary
- Click **🔒 Place Hold**

**What Happens Next:**
✅ Hold added to database
✅ Source spreadsheet updated
✅ Email notification sent to appropriate department
✅ Hold history logged automatically

---

## ⚠️ Escalation Management

### Automatic Escalation
Holds older than 7 days are flagged as "escalated":
- System tracks days on hold
- Color coding changes based on age
- Critical alert for 14+ day holds
- Automated email reminders sent

### Manual Actions
From the Escalation Center:
1. **Send Follow-up Email** - Notify clinic of unresolved hold
2. **Clear Hold** - Remove hold after issue resolved

---

## 📧 Email Routing

Emails are automatically routed to the right department:

| Hold Type | Department | Email |
|-----------|-----------|-------|
| Referral Issues | Referral Team | Referral Team Email |
| Insurance Issues | Benefits Team | Benefits Team Email |
| Authorization | Customer Care | Customer Care Email |
| General | Clinic | Clinic-Specific Email |

---

## 📋 Understanding Hold Reasons

### Missing Referral Holds
**What it means**: Patient cannot be seen without a valid referral
**Action Required**: Reach out to patient to obtain referral from MD
**Time to Resolve**: 1-3 days typically
**Contact**: Referral Coordination - 718-648-0888 ext. 2

### Pending Authorization Holds
**What it means**: Awaiting approval from insurance or MD
**Action Required**: Follow up with insurance/MD
**Time to Resolve**: 3-7 days typically
**Contact**: Benefits department or MD office

### COB (Coordination of Benefits) Holds
**What it means**: Insurance information needs updating
**Action Required**: Patient must contact insurance to update COB
**Time to Resolve**: 5-14 days typically
**Note**: Patient can continue as self-pay while resolving

### Coverage Issue Holds
**What it means**: Current insurance won't cover treatment
**Action Required**: Get new insurance or discuss self-pay option
**Time to Resolve**: Depends on insurance availability

---

## 🔍 How to Search History

1. Click **📜 History** tab
2. Enter search term:
   - Patient name (e.g., "John Smith")
   - EMR ID (e.g., "12345")
   - Location (e.g., "Astoria")
3. (Optional) Filter by action type
4. Results show most recent first
5. Click prev/next for pagination

---

## ⚙️ Settings Explained

### Auto-Sync Interval
- **Default**: 30 minutes
- **Purpose**: Updates hold statuses with database
- **Adjust if**: You want more/less frequent updates

### Escalation Threshold
- **Default**: 7 days
- **Purpose**: Triggers escalation for older holds
- **Adjust if**: You want different escalation timing

### Email Notifications
- **Default**: ON
- **Purpose**: Sends alerts for new holds and escalations
- **Adjust if**: You want to disable notifications

### Weekly Report Day
- **Default**: Monday
- **Purpose**: Day to receive hold summary email
- **Reports Include**: Stats, top clinics, aging holds

---

## 🔐 Admin Functions (Password Required)

**Password**: AGONY

### Available Admin Actions:
1. **Clear All Hold History** - Delete entire history log
2. **Reset ESCALATED Flags** - Re-allow escalation emails
3. **Force Send Nightly Report** - Run report immediately
4. **Wipe PENDING-RETRY** - Clear failed email entries

⚠️ **Use with caution** - These actions are permanent!

---

## 💡 Pro Tips

✅ **Tip 1**: Use the search feature to find patients quickly
✅ **Tip 2**: Check Escalation Center daily for critical holds
✅ **Tip 3**: Add custom notes for unusual cases
✅ **Tip 4**: Monitor the Recent Activity feed for your team
✅ **Tip 5**: Adjust auto-sync if database is slow

---

## ❓ Frequently Asked Questions

**Q: Can I place a hold on a patient already on hold?**
A: No, the system prevents duplicate holds for the same patient/reason

**Q: What if I place a hold by mistake?**
A: Clear it immediately using the dashboard or escalation center

**Q: How long does a hold typically last?**
A: Depends on reason. Most resolve in 1-7 days. Escalations trigger at 7+ days.

**Q: Can I add notes to existing holds?**
A: Yes, via the Follow-Up Log feature in source spreadsheet

**Q: What time zone are all dates in?**
A: America/New_York (Eastern Time)

**Q: Can I export the history?**
A: Yes, the history data is searchable and can be copied from the table

**Q: What does "Re-Hold Protection" mean?**
A: System warns if you try to re-hold someone cleared within 7 days

---

## 🆘 Troubleshooting

### Dashboard shows 0 holds
- Wait for auto-sync (up to 30 min)
- Click "Sync All Hold Statuses" in source spreadsheet

### Emails not sending
- Check internet connection
- Verify email addresses in settings
- Try "Force Send Nightly Report" in admin panel

### Can't access admin panel
- Click "Show" button in admin section
- Enter correct password
- Check caps lock!

---

## 📞 Getting Help

**For Support:**
- Contact: Mostafa Hassan
- Email: auth28@cobsolution.com
- Department: Authorization & Clearance

**For System Issues:**
- Check recent activity log
- Review hold history for patterns
- Contact system administrator

---

## 🎓 Video Tutorial Topics (Ready for Recording)

1. Dashboard Overview & Navigation
2. Placing Your First Hold
3. Using the Search & Filter Functions
4. Managing Escalations
5. Configuring System Settings
6. Admin Panel Features

---

**Ready to get started? Click any tab above to begin!**

*Last Updated: January 2024*
*Version: 9.5*
