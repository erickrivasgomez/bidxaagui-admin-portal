# 🧪 Testing Guide - Magic Link Authentication

Quick guide to test the complete authentication flow.

---

## 🚀 Prerequisites

1. ✅ Frontend running: `http://localhost:5174`
2. ✅ Backend Worker running: `http://localhost:8787`
3. ✅ Admin user seeded in D1 database
4. ✅ Resend API key configured

---

## 📝 Step-by-Step Testing

### **Step 1: Start Services**

**Terminal 1 - Frontend**:
```bash
cd bidxaagui-admin-portal
npm run dev
```
→ Opens at `http://localhost:5174`

**Terminal 2 - Backend**:
```bash
cd backend-worker
npx wrangler dev
```
→ Opens at `http://localhost:8787`

---

### **Step 2: Test Health Check**

**Browser**: Open `http://localhost:8787/api/health`

**Expected Response**:
```json
{
  "status": "ok",
  "message": "BIDXAAGUI API is running",
  "environment": "development",
  "timestamp": "2025-12-05T..."
}
```

✅ If you see this, the Worker is running correctly!

---

### **Step 3: Test Frontend Login Page**

**Browser**: Open `http://localhost:5174`

**Expected**:
- BIDX AAGUI branding
- Email input field
- "Enviar Enlace Mágico" button
- Warm cream and olive colors

---

### **Step 4: Request Magic Link**

**In Frontend**:
1. Enter your admin email (the one you seeded in D1)
2. Click "Enviar Enlace Mágico"

**Expected Frontend Behavior**:
- Button shows loading spinner
- Text changes to "Enviando..."
- Success message appears: "Check your email!"
- Email address is shown
- Form hides, success state shows

**Expected Backend**:
- Worker logs show request received
- Token generated and stored in D1
- Email sent via Resend

---

### **Step 5: Check Email**

**In Your Inbox**:
1. Check the email you entered
2. Look for: "Tu enlace de acceso - BIDXAAGUI"
3. From: "BIDXAAGUI <noreply@bidxaagui.com>"

**Email Should Contain**:
- ✅ BIDXAAGUI header (olive green)
- ✅ "¡Tu enlace de acceso está listo!"
- ✅ Orange "Acceder al Panel" button
- ✅ 15-minute expiration notice
- ✅ Alternative text link
- ✅ BIDXAAGUI footer

**⚠️ If no email**:
- Check spam folder
- Check Resend dashboard logs
- Verify API key in `.dev.vars`
- Check domain is verified in Resend

---

### **Step 6: Click Magic Link**

**In Email**:
1. Click the "Acceder al Panel" button
2. OR click the alternative link

**Expected**:
- Redirects to: `http://localhost:5174/auth/verify?token=xxxxx`
- Shows loading spinner
- "Verificando enlace..." message

---

### **Step 7: Verify Token**

**Frontend automatically**:
1. Extracts token from URL
2. Calls Worker: `GET /api/auth/magic-link/verify?token=xxxxx`
3. Receives JWT + user data
4. Stores in localStorage
5. Shows success: "¡Acceso concedido!"
6. Redirects to `/dashboard`

**Expected Dashboard**:
- ✅ BIDXAAGUI header
- ✅ Welcome message with your email
- ✅ "Cerrar Sesión" button
- ✅ Stats cards (placeholders)
- ✅ "Próximos pasos" section

---

### **Step 8: Test Protected Route**

**Try accessing Dashboard directly**:
1. Logout (click "Cerrar Sesión")
2. Try to open: `http://localhost:5174/dashboard`

**Expected**:
- Automatically redirects to `/login`
- Must request new magic link

---

### **Step 9: Test Token Expiration**

**Wait 15 minutes**:
1. Request a new magic link
2. Don't click it immediately
3. Wait 16+ minutes
4. Try to click the old link

**Expected**:
- Error: "Magic link expired. Please request a new one."
- Error icon (red X)
- Button: "Request new link"

---

### **Step 10: Test Single-Use Token**

**Click link twice**:
1. Click magic link → Login succeeds
2. Click same link again

**Expected**:
- Error: "Magic link already used. Please request a new one."

---

## 🧪 cURL Testing (Optional)

### **Request Magic Link**:
```bash
curl -X POST http://localhost:8787/api/auth/magic-link/request \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com"}'
```

**Expected**:
```json
{
  "success": true,
  "message": "Magic link sent! Check your email."
}
```

### **Verify Token** (use token from email):
```bash
curl "http://localhost:8787/api/auth/magic-link/verify?token=YOUR_TOKEN_HERE"
```

**Expected**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "xxx",
      "email": "your-email@example.com",
      "name": "Admin"
    }
  }
}
```

---

## ✅ Success Checklist

- [ ] Health check responds (200 OK)
- [ ] Frontend loads login page
- [ ] Can request magic link
- [ ] Email received in inbox
- [ ] Email has correct branding
- [ ] Magic link redirects correctly
- [ ] Token verification works
- [ ] JWT returned
- [ ] Dashboard loads after login
- [ ] Protected routes work
- [ ] Logout works
- [ ] Expired token rejected
- [ ] Used token rejected
- [ ] Invalid email rejected

---

## 🐛 Common Issues & Solutions

### **Frontend can't connect to Worker**:
```
Solution: Check both are running on correct ports
- Frontend: 5174
- Backend: 8787
```

### **Email not sending**:
```
Solution: 
1. Check `.dev.vars` has RESEND_API_KEY
2. Verify domain in Resend dashboard
3. Check Resend logs
```

### **Database errors**:
```
Solution:
1. Verify admin user is seeded in D1
2. Run: SELECT * FROM admin_users;
3. Should see your email
```

### **CORS errors in browser**:
```
Solution:
1. Check Worker is running
2. Verify CORS headers in response
3. Check network tab in DevTools
```

### **Token not found in database**:
```
Solution:
1. Check D1 binding in wrangler.toml
2. Verify database ID is correct
3. Check magic_link_tokens table exists
```

---

## 📊 What to Check in D1 Console

### **Verify admin user exists**:
```sql
SELECT * FROM admin_users;
```

### **Check magic link tokens**:
```sql
SELECT * FROM magic_link_tokens ORDER BY created_at DESC LIMIT 10;
```

### **Check for used/expired tokens**:
```sql
SELECT token, used, expires_at, created_at 
FROM magic_link_tokens 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

---

## 🎉 All Tests Passing?

**Congrats!** Your authentication system works end-to-end! 🚀

**Next Steps**:
1. Test with multiple admin users
2. Test edge cases (network errors, etc.)
3. Prepare for production deployment
4. Add more features (subscribers, editions, etc.)

---

**Need Help?** Check:
- `AUTH_FRONTEND_IMPLEMENTATION.md`
- `AUTH_BACKEND_IMPLEMENTATION.md`
- Cloudflare D1 Console
- Resend Dashboard logs
