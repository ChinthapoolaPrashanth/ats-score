# ATS Pro Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended)
1. **Connect your GitHub repo** to Netlify
2. **Set Environment Variable:**
   - Go to Site Settings > Environment Variables
   - Add: `OPENAI_API_KEY` = `your-api-key-here`
3. **Deploy** - Your site will be live!

### Option 2: Vercel
1. **Connect your GitHub repo** to Vercel
2. **Set Environment Variable:**
   - Go to Project Settings > Environment Variables
   - Add: `OPENAI_API_KEY` = `your-api-key-here`
3. **Deploy** - Your site will be live!

### Option 3: GitHub Pages
1. **Enable GitHub Pages** in your repo settings
2. **Set Environment Variable** (if supported by your hosting)
3. **Your site will be available** at: `https://yourusername.github.io/ats-score`

## 🔧 Manual Setup (Alternative)

If you want to include the API key directly in the code:

1. **Edit `config.js`:**
```javascript
window.OPENAI_API_KEY = 'your-api-key-here';
```

2. **Remove `config.js` from `.gitignore`**
3. **Commit and push** the changes

## 🌐 Your API Key
**Key:** `your-api-key-here` (check your OpenAI dashboard)

## ✅ After Deployment
- Users can visit your link and start using the tool immediately
- No API key configuration needed for users
- Your API key is hidden from users but functional
- Monitor usage through your OpenAI dashboard

## 🔒 Security Notes
- The API key will be visible in the browser's network tab (normal for client-side apps)
- Users cannot access your OpenAI account
- You can set usage limits in your OpenAI dashboard
- Consider rate limiting if you expect high traffic 