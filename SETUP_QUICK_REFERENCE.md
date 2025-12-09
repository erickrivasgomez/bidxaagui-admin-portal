# 🎯 Quick Reference: Service Configuration

Quick links and checklist for setting up Cloudflare D1 and Resend.

---

## 📌 Quick Links

### Cloudflare
- 🏠 **Dashboard**: https://dash.cloudflare.com/
- 🗄️ **D1 Databases**: https://dash.cloudflare.com/{ACCOUNT_ID}/workers/d1
- 👷 **Workers**: https://dash.cloudflare.com/{ACCOUNT_ID}/workers-and-pages
- 🌐 **DNS Settings**: https://dash.cloudflare.com/{ACCOUNT_ID}/bidxaagui.com/dns

### Resend
- 🏠 **Dashboard**: https://resend.com/home
- 📧 **Domains**: https://resend.com/domains
- 🔑 **API Keys**: https://resend.com/api-keys
- 📨 **Emails**: https://resend.com/emails

---

## ✅ Setup Checklist

### Part 1: Cloudflare D1
- [ ] Log into Cloudflare Dashboard
- [ ] Navigate to Workers & Pages → D1
- [ ] Create database: `bidxaagui-db`
- [ ] Copy Database ID
- [ ] Open Console tab
- [ ] Execute schema SQL (create tables)
- [ ] Execute indexes SQL
- [ ] Insert first admin user (with your email)
- [ ] Verify tables created
- [ ] Save Database ID securely

### Part 2: Resend Email
- [ ] Create Resend account (or log in)
- [ ] Add domain: `bidxaagui.com`
- [ ] Copy DNS records (SPF, DKIM, DMARC)
- [ ] Go to Cloudflare DNS settings
- [ ] Add TXT records from Resend
- [ ] Wait 5-15 minutes (DNS propagation)
- [ ] Verify domain in Resend
- [ ] Create API key (Sending access)
- [ ] Copy API key immediately
- [ ] Test send email (optional)
- [ ] Save API key securely

### Part 3: Configuration Values
- [ ] Database ID saved
- [ ] Resend API key saved
- [ ] Admin email noted
- [ ] Ready for Worker configuration

---

## 📝 Configuration Template

Copy this and fill in your values:

```txt
===========================================
BIDXAAGUI - Service Configuration
===========================================

CLOUDFLARE D1
-------------
Database Name: bidxaagui-db
Database ID: ________________________________
Binding Name: DB
Account ID: ________________________________

RESEND EMAIL
------------
API Key: re_____________________________
Verified Domain: bidxaagui.com
Sender Email: noreply@bidxaagui.com

ADMIN USER
----------
Email: ________________________________
User ID: 00000000-0000-0000-0000-000000000001

DATE CONFIGURED
---------------
Date: ________________________________

===========================================
⚠️ KEEP THIS SECURE - Contains API keys!
===========================================
```

---

## 🔍 Verification Commands

### Check D1 Database:
1. Go to D1 Console
2. Run: `SELECT name FROM sqlite_master WHERE type='table';`
3. Should see 6 tables

### Check Admin User:
1. Go to D1 Console
2. Run: `SELECT * FROM admin_users;`
3. Should see your admin record

### Check Resend Domain:
1. Go to: https://resend.com/domains
2. Look for green "Verified" badge
3. If not verified, wait and click "Verify" again

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Can't find D1 in Cloudflare | Enable Workers in your account settings |
| Database creation fails | Check free tier limits (max 10 databases) |
| Resend domain won't verify | Wait 30min for DNS, check TXT records in Cloudflare |
| Lost Resend API key | Delete old key, create new one |
| DNS records not showing | Use https://dnschecker.org/ to check propagation |
| SQL syntax error | Ensure no smart quotes (use plain text editor) |

---

## ⏭️ After Setup

Once both services are configured, proceed to:

1. **Configure Worker** (`wrangler.toml`)
   - Add D1 binding
   - Add Resend API key as secret
   - Configure environment variables

2. **Implement Endpoints**
   - Magic link request
   - Magic link verification
   - JWT generation

3. **Create Email Template**
   - HTML email design
   - Magic link button
   - BIDXAAGUI branding

4. **Test & Deploy**
   - Local testing with `wrangler dev`
   - Deploy to production

---

**Need help?** Reference the full guide: `SETUP_GUIDE_D1_RESEND.md`
