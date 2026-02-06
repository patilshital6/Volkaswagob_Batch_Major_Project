# Google Authentication Setup Guide

## Overview
Google OAuth has been integrated into both the signup and login pages. Users can now sign in or sign up using their Google account.

## Supabase Configuration Required

### Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click on it
4. Toggle **Enable Google provider** to ON

### Step 2: Configure Google OAuth Credentials

You'll need to create OAuth credentials in Google Cloud Console:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select a Project**
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://your-domain.com` (for production)
   - Add **Authorized redirect URIs**:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - You can find your project ref in Supabase Dashboard → Settings → API
5. **Copy the Client ID and Client Secret**

### Step 3: Add Credentials to Supabase

1. In Supabase Dashboard → Authentication → Providers → Google
2. Paste your **Client ID** and **Client Secret** from Google Cloud Console
3. Click **Save**

### Step 4: Update Redirect URLs (if needed)

The callback route is already set up at `/auth/callback`. Make sure your Supabase project has the correct redirect URL:

- In Supabase Dashboard → Authentication → URL Configuration
- Add your site URL: `http://localhost:3000` (development) or your production URL
- Add redirect URLs: 
  - `http://localhost:3000/auth/callback` (development)
  - `https://your-domain.com/auth/callback` (production)

## How It Works

### Signup Flow
1. User clicks "Sign up with Google"
2. Redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/auth/callback`
5. Supabase exchanges the code for a session
6. User is redirected to dashboard
7. Profile is automatically created with 'viewer' role (via database trigger)

### Login Flow
1. User clicks "Sign in with Google"
2. Same OAuth flow as signup
3. If user exists, they're logged in
4. If user doesn't exist, account is created automatically

## Features

✅ **Seamless Integration**: Google button appears on both signup and login pages
✅ **Automatic Profile Creation**: User profile is created automatically with Google account info
✅ **Role Assignment**: New Google users get 'viewer' role by default (same as email signup)
✅ **Error Handling**: Proper error messages if OAuth fails
✅ **Loading States**: Shows loading spinner during OAuth process
✅ **Redirect Handling**: Preserves redirect destination after OAuth

## Security Notes

- All OAuth flows use Supabase's secure authentication
- User roles are still enforced (viewer by default)
- OAuth tokens are managed securely by Supabase
- No sensitive credentials are stored in the frontend

## Troubleshooting

### "Failed to sign in with Google"
- Check if Google provider is enabled in Supabase
- Verify Client ID and Client Secret are correct
- Check redirect URIs match in both Google Console and Supabase

### "Redirect URI mismatch"
- Ensure redirect URI in Google Console matches: `https://[project-ref].supabase.co/auth/v1/callback`
- Check that your site URL is configured in Supabase

### User not redirected after OAuth
- Verify `/auth/callback` route is accessible
- Check browser console for errors
- Ensure middleware is not blocking the callback route

## Testing

1. Click "Sign up with Google" or "Sign in with Google"
2. Complete Google OAuth flow
3. Verify you're redirected to dashboard
4. Check that your profile was created with correct role

## Next Steps

After setting up Google OAuth in Supabase:
1. Test the flow in development
2. Add production redirect URLs
3. Consider adding other OAuth providers (GitHub, Microsoft, etc.)
