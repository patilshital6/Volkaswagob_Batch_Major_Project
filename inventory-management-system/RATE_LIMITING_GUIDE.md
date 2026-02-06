# Rate Limiting Guide - 429 Error Fix

## 🔒 What is Rate Limiting?

The **429 (Too Many Requests)** error is a **security feature** from Supabase that prevents:
- Spam account creation
- Brute force attacks
- API abuse
- Resource exhaustion

This is **normal and expected behavior** - it means Supabase is protecting your application!

---

## ⚠️ When You See 429 Errors

### Common Scenarios:
1. **Multiple signup attempts** in a short time
2. **Testing/development** with repeated requests
3. **Legitimate users** hitting the limit during peak times

### Default Supabase Limits:
- **Signup requests:** ~5-10 per hour per IP (varies by plan)
- **Login attempts:** ~10-20 per hour per IP
- **API requests:** Varies by subscription tier

---

## ✅ Solutions

### **Solution 1: Wait and Retry (Recommended)**
- Wait **5-15 minutes** before trying again
- The rate limit resets automatically
- This is the simplest solution

### **Solution 2: Check Supabase Dashboard**
1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Check your **rate limit settings**
3. For development, you might want to:
   - Use different test accounts
   - Space out your testing
   - Use Supabase CLI for local development

### **Solution 3: Adjust Rate Limits (Paid Plans)**
If you're on a paid plan:
1. Go to **Supabase Dashboard** → **Settings** → **Rate Limiting**
2. Adjust limits for development (if available)
3. **Note:** Free tier has fixed limits

### **Solution 4: Use Different IP/Network**
- Try from a different network
- Use a VPN (for testing only)
- Use mobile hotspot

### **Solution 5: Local Development Setup**
For heavy testing, consider:
- Using Supabase CLI for local development
- Setting up test accounts manually via SQL
- Using environment-specific rate limits

---

## 🛠️ Code Improvements Applied

### Better Error Handling
The signup form now:
- ✅ Detects 429 errors specifically
- ✅ Shows user-friendly message
- ✅ Suggests waiting before retrying
- ✅ Logs errors for debugging

**Updated Code:**
```typescript
if (error.status === 429 || error.message?.includes('429')) {
    toast.error(
        'Too many signup attempts. Please wait a few minutes before trying again.',
        { duration: 5000 }
    )
}
```

---

## 📊 Rate Limit Information

### Supabase Free Tier Limits:
- **Signups:** ~5 per hour per IP
- **Logins:** ~10 per hour per IP
- **API Requests:** 500MB bandwidth/month

### Supabase Pro Tier:
- Higher limits
- Configurable rate limits
- Better for production

---

## 🎯 Best Practices

### For Development:
1. **Create test accounts manually** via SQL when possible
2. **Space out testing** - don't create 10 accounts in 1 minute
3. **Use different emails** for testing
4. **Wait between attempts** if you hit limits

### For Production:
1. **Inform users** about rate limits in UI
2. **Show helpful messages** (already implemented)
3. **Monitor rate limit hits** in Supabase dashboard
4. **Consider upgrading** if limits are too restrictive

---

## 🔍 How to Check Current Rate Limits

### Via Supabase Dashboard:
1. Go to **Project Settings** → **API**
2. Check **Rate Limiting** section
3. View current limits and usage

### Via API:
```sql
-- Check authentication logs (if you have access)
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 🚨 If Rate Limits Are Too Restrictive

### Option 1: Upgrade Plan
- Pro tier has higher limits
- Better for production use
- More control over rate limiting

### Option 2: Contact Supabase Support
- Explain your use case
- Request limit adjustments
- They may help for legitimate needs

### Option 3: Implement Your Own Rate Limiting
- Add application-level rate limiting
- Use Redis or similar for tracking
- More control but more complexity

---

## ✅ Current Status

**Error Handling:** ✅ **IMPROVED**
- Better 429 error detection
- User-friendly messages
- Helpful retry suggestions

**Rate Limiting:** ⚠️ **SUPABASE DEFAULT**
- Standard Supabase limits apply
- Cannot be changed on free tier
- Wait and retry is the solution

---

## 📝 Summary

**The 429 error is:**
- ✅ A **security feature** (good thing!)
- ✅ **Normal behavior** during development
- ✅ **Protecting your app** from abuse

**What to do:**
1. **Wait 5-15 minutes** before retrying
2. **Space out testing** to avoid hitting limits
3. **Use the improved error messages** (already implemented)
4. **Consider upgrading** if limits are too restrictive for production

**The code now handles this gracefully!** 🎉
