# 🛠️ Setup Guide: Cloudflare D1 & Resend Email

Complete step-by-step guide to configure Cloudflare D1 database and Resend email service through their web interfaces.

---

## 📋 Prerequisites

- ✅ Cloudflare account (free tier works)
- ✅ Domain `bidxaagui.com` configured in Cloudflare
- ✅ Access to email for verification

---

# Part 1: Cloudflare D1 Database Setup

## Step 1: Access Cloudflare Dashboard

1. **Go to**: https://dash.cloudflare.com/
2. **Log in** with your Cloudflare account
3. **Important**: Make note of your Account ID
   - You'll find it on the right sidebar or in the URL after login
   - Format: `https://dash.cloudflare.com/{ACCOUNT_ID}/...`

---

## Step 2: Navigate to Workers & Pages

1. From the Cloudflare Dashboard home/sidebar
2. Click on **"Workers & Pages"** in the left sidebar
3. OR: Direct link to Workers: `https://dash.cloudflare.com/{YOUR_ACCOUNT_ID}/workers-and-pages`

---

## Step 3: Access D1 Databases

1. In the Workers & Pages section
2. Click on the **"D1 SQL Databases"** tab at the top
3. OR: Click **"D1"** in the left sidebar under "Storage"
4. Direct link: `https://dash.cloudflare.com/{YOUR_ACCOUNT_ID}/workers/d1`

---

## Step 4: Create New D1 Database

1. Click the **"Create"** or **"Create database"** button
2. Fill in the database details:
   - **Database name**: `bidxaagui-db`
   - **Location**: Choose "Automatic" (recommended) or select your preferred region
3. Click **"Create"** button

---

## Step 5: Get Database Information

After creation, you'll see your database details page. **Copy and save** the following:

- ✅ **Database Name**: `bidxaagui-db`
- ✅ **Database ID**: A UUID like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- ✅ **Binding Name**: Will be `DB` (we'll configure this later)

**Important**: Keep this Database ID saved - you'll need it for the Worker configuration.

---

## Step 6: Execute Database Schema

Now we'll create the tables through the D1 Console.

### 6.1 Open Console
1. On your database details page
2. Click the **"Console"** tab
3. You'll see a SQL query editor

### 6.2 Execute Schema SQL

Copy and paste the following SQL into the console and click **"Execute"**:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Magic Link Tokens Table
CREATE TABLE magic_link_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES admin_users(id)
);

-- Newsletter Subscribers Table
CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT 1,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME,
  unsubscribe_token TEXT UNIQUE
);

-- Ediciones (Magazine) Table
CREATE TABLE ediciones (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  cover_url TEXT,
  fecha DATE,
  publicada BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Páginas (Magazine Pages) Table
CREATE TABLE paginas (
  id TEXT PRIMARY KEY,
  edicion_id TEXT NOT NULL,
  numero INTEGER NOT NULL,
  imagen_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE,
  UNIQUE(edicion_id, numero)
);

-- Email Campaigns History Table
CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recipients_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  sent_by TEXT NOT NULL,
  FOREIGN KEY(sent_by) REFERENCES admin_users(id)
);
```

### 6.3 Create Indexes

Execute this SQL to create performance indexes:

```sql
-- Performance Indexes
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_subscribed ON subscribers(subscribed);
CREATE INDEX idx_ediciones_publicada ON ediciones(publicada);
CREATE INDEX idx_ediciones_fecha ON ediciones(fecha DESC);
CREATE INDEX idx_paginas_edicion ON paginas(edicion_id);
CREATE INDEX idx_magic_tokens_expires ON magic_link_tokens(expires_at);
```

---

## Step 7: Seed First Admin User

Execute this to create your first admin account (replace with your email):

```sql
INSERT INTO admin_users (id, email, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'your-email@example.com',  -- ⚠️ CHANGE THIS TO YOUR EMAIL
  'Admin',
  CURRENT_TIMESTAMP
);
```

**Replace** `'your-email@example.com'` with the email you want to use for admin access.

---

## Step 8: Verify Tables Created

Run this query to verify all tables exist:

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

You should see:
- `admin_users`
- `magic_link_tokens`
- `subscribers`
- `ediciones`
- `paginas`
- `email_campaigns`

---

## ✅ D1 Database Setup Complete!

**What you should have**:
- ✅ Database name: `bidxaagui-db`
- ✅ Database ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (saved)
- ✅ All tables created
- ✅ Indexes created
- ✅ First admin user seeded

**Keep the Database ID safe** - you'll need it for the Worker configuration.

---

# Part 2: Resend Email Service Setup

## Step 1: Create Resend Account

1. **Go to**: https://resend.com/
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - Email and password, OR
   - GitHub account (recommended for developers)
4. **Verify your email** if required

---

## Step 2: Access Resend Dashboard

1. After login, you'll be at: https://resend.com/home
2. You should see the main dashboard

---

## Step 3: Verify Your Domain

### 3.1 Navigate to Domains
1. In the left sidebar, click **"Domains"**
2. OR: Go to https://resend.com/domains
3. Click **"Add Domain"** button

### 3.2 Add Your Domain
1. Enter your domain: `bidxaagui.com`
2. Click **"Add"** or **"Continue"**

### 3.3 Configure DNS Records

Resend will show you **DNS records** that need to be added to your domain. You'll need to add these in Cloudflare.

**Typical records** (Resend will provide the exact values):

1. **SPF Record** (TXT)
   - Type: `TXT`
   - Name: `@` or `bidxaagui.com`
   - Value: Something like `"v=spf1 include:resend.com ~all"`

2. **DKIM Record** (TXT)
   - Type: `TXT`
   - Name: Something like `resend._domainkey`
   - Value: Long string starting with `p=...`

3. **DMARC Record** (TXT) - Optional but recommended
   - Type: `TXT`
   - Name: `_dmarc`
   - Value: `"v=DMARC1; p=none; rua=mailto:your-email@example.com"`

### 3.4 Add DNS Records in Cloudflare

1. **Open new tab**: https://dash.cloudflare.com/
2. Select your domain: **bidxaagui.com**
3. Click **"DNS"** in the left sidebar
4. Click **"Add record"** button

For each DNS record from Resend:
1. Select **Type**: `TXT`
2. Enter **Name**: (from Resend)
3. Enter **Content**: (from Resend)
4. **TTL**: Auto or 3600
5. **Proxy status**: DNS only (gray cloud)
6. Click **"Save"**

### 3.5 Verify Domain in Resend

1. Go back to Resend dashboard: https://resend.com/domains
2. Find your domain `bidxaagui.com`
3. Click **"Verify"** or **"Check DNS"**
4. Wait for verification (can take a few minutes to 24 hours for DNS propagation)
5. ✅ Status should change to **"Verified"**

**Note**: If verification fails, wait 10-15 minutes and try again (DNS propagation delay).

---

## Step 4: Create API Key

### 4.1 Navigate to API Keys
1. In the left sidebar, click **"API Keys"**
2. OR: Go to https://resend.com/api-keys
3. Click **"Create API Key"** button

### 4.2 Configure API Key
1. **Name**: `BIDXAAGUI Worker Production` (or whatever you prefer)
2. **Permission**: 
   - Select **"Sending access"** (can send emails)
   - OR **"Full access"** (for testing, includes analytics)
3. **Domain**: Select `bidxaagui.com` (if option available)
4. Click **"Add"** or **"Create"**

### 4.3 Copy API Key

⚠️ **IMPORTANT**: 
- Your API key will be shown **ONCE**
- Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Copy it immediately** and save it securely
- You cannot view it again later

**Save this API key** - you'll need it for the Worker secrets configuration.

---

## Step 5: Configure Sender Email

### 5.1 Decide on Sender Email
You'll send emails from an address like:
- `noreply@bidxaagui.com` (recommended for system emails)
- `admin@bidxaagui.com`
- `newsletter@bidxaagui.com`

### 5.2 Test Email Sending (Optional)

You can test sending an email from the Resend dashboard:
1. Go to: https://resend.com/emails
2. Click **"Send Test Email"**
3. Fill in:
   - **From**: `noreply@bidxaagui.com`
   - **To**: Your personal email
   - **Subject**: `Test from BIDXAAGUI`
   - **Body**: Any test message
4. Click **"Send"**
5. Check your inbox to verify delivery

---

## Step 6: Review Email Limits

### Free Tier Limits:
- ✅ **100 emails per day**
- ✅ **3,000 emails per month**
- ✅ 1 verified domain
- ✅ Full API access

### If You Need More:
- Pro Plan: **$20/month** for 50,000 emails/month
- Upgrade at: https://resend.com/settings/billing

For your initial launch, the **free tier should be sufficient**.

---

## ✅ Resend Email Setup Complete!

**What you should have**:
- ✅ Domain `bidxaagui.com` verified in Resend
- ✅ DNS records added to Cloudflare (SPF, DKIM)
- ✅ API key created and saved: `re_xxxxxxxxxxxx`
- ✅ Sender email decided: `noreply@bidxaagui.com`

---

# Part 3: Save Configuration Values

Create a secure note or document with these values:

## Cloudflare D1:
```
Database Name: bidxaagui-db
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Binding Name: DB
Account ID: YOUR_CLOUDFLARE_ACCOUNT_ID
```

## Resend:
```
API Key: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
Verified Domain: bidxaagui.com
Sender Email: noreply@bidxaagui.com
```

## Admin User:
```
Email: your-email@example.com
User ID: 00000000-0000-0000-0000-000000000001
```

---

# Next Steps

Now that D1 and Resend are configured, you can:

1. ✅ **Configure Worker** - Add D1 binding and Resend secrets to `wrangler.toml`
2. ✅ **Implement Auth Endpoints** - Build the magic link request and verify endpoints
3. ✅ **Create Email Template** - Design the magic link email
4. ✅ **Deploy Worker** - Push to production

---

## 🆘 Troubleshooting

### D1 Issues:
- **Can't see D1 option?** → Ensure your account has Workers enabled
- **Database creation fails?** → Check account limits (free tier = 10 databases)
- **SQL errors?** → Verify SQLite syntax (D1 uses SQLite)

### Resend Issues:
- **Domain verification fails?** → Wait 15-30 minutes for DNS propagation
- **Still failing?** → Use DNS checker: https://mxtoolbox.com/SuperTool.aspx
- **Can't send emails?** → Verify domain status is "Verified" (green check)
- **Lost API key?** → Delete old key, create new one

### DNS Propagation:
- Check DNS propagation status: https://dnschecker.org/
- Enter your domain: `bidxaagui.com`
- Select record type: `TXT`
- Look for Resend records globally

---

## 📞 Support Resources

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Resend Docs**: https://resend.com/docs/introduction
- **Cloudflare Support**: https://support.cloudflare.com/
- **Resend Support**: support@resend.com or Discord: https://resend.com/discord

---

**Status**: Ready to configure Worker with these services! 🚀
