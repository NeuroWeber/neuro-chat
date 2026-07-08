# 🚀 Deployment Guide

This guide covers deploying your **Next.js frontend + Supabase database** to production.

---

## 📋 Prerequisites

Before deploying, make sure:

- ✅ GitHub account created
- ✅ Supabase project with tables set up ([SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ Realtime enabled on Supabase tables ([REALTIME_SETUP.md](./REALTIME_SETUP.md))
- ✅ .env.local configured with real Supabase credentials

---

## 🌐 Deploy Frontend to Vercel (15 minutes)

**Vercel** is the best platform for Next.js apps—created by the Next.js team.

### Step 1: Push Code to GitHub

```powershell
cd C:\NEUROWEB\WEB\my-app

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Full Stack Web App"
git remote add origin https://github.com/NeuroWeber/neuro-chat.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and `my-app` with your repo name.

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Select **Sign up with GitHub**
4. Authorize Vercel to access your GitHub account

### Step 3: Deploy on Vercel

1. Visit https://vercel.com/new
2. Select your GitHub repository from the list
3. Click **Import**
4. Configure project name and framework (should auto-detect Next.js)
5. Under **Environment Variables**, add your Supabase credentials:

   | Key                             | Value                              |
   | ------------------------------- | ---------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | `https://YOUR-PROJECT.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase        |

   **To find these values:**
   - Open Supabase Dashboard
   - Go to **Settings** → **API**
   - Copy **Project URL** and **Anon public key**

6. Click **Deploy**
7. Wait 2-3 minutes for deployment to complete

✅ **Your app is now live!** Vercel provides a URL like: `https://my-app.vercel.app`

---

## � Enable Auto-Deployments (Optional)

With Vercel, deployments happen automatically:

- **Push to `main` branch** → Vercel auto-deploys
- **Preview deployments** for pull requests
- **Production URL** stays the same

You can disable auto-deploy in Vercel Settings if needed.

---

## 🗄️ Database (Already Hosted)

**Supabase is cloud-hosted—no deployment needed!**

Your database automatically works with the frontend because:

- Supabase URL is in environment variables ✅
- RLS policies allow public access ✅
- Realtime is enabled ✅

---

## 🧪 Test Your Live Deployment

1. Visit your Vercel URL: `https://my-app.vercel.app`
2. Connect to a channel (somto or chisom)
3. Send a message—it should:
   - ✅ Appear instantly (optimistic update)
   - ✅ Save to Supabase
   - ✅ Sync in realtime to other browser tabs
4. Open in another browser tab—test realtime sync 🔄

---

## 🔒 Environment Variables Reference

### Frontend (set on Vercel)

```
---

## 🚨 Common Issues & Solutions

### Issue: "Error: Missing Supabase credentials"
**Solution:** Verify environment variables are set on Vercel:
1. Go to Vercel Project → Settings → Environment Variables
2. Confirm both variables are present
3. Redeploy: Vercel → Deployments → Click latest → Redeploy

### Issue: "Messages not appearing in realtime"
**Solution:** Check Supabase configuration:
1. Verify Realtime is enabled: Dashboard → Replication (blue 🔵 toggle)
2. Check RLS policies exist: Dashboard → Authentication → Policies
3. See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for complete setup

### Issue: "Page shows blank/white screen"
**S📈 Performance Tips

### Improve Load Time:
1. Enable caching in Vercel (Settings → Caching)
2. Optimize images in `/public` folder
3. Use Next.js Image component for image optimization

### Monitor Performance:
- Vercel Dashboard → Analytics (shows real user metrics)
- Check build logs for warnings: Deployments → Logs

---

## 🔐 Security Checklist

- ✅ Use `NEXT_PUBLIC_` prefix only for safe variables (exposed to browser)
- ✅ Never commit `.env.local` to GitHub
- ✅ Supabase RLS policies restrict data access
- ✅ Anon key has limited permissions
- ✅ HTTPS enabled by default on Vercel

---

## 🎉 You're Done!

Your full stack app is now:
- ✅ **Deployed globally** (Vercel)
- ✅ **Database live** (Supabase)
- ✅ **Auto-updated** (Git integration)
- ✅ **Scalable** (auto-scaling)

**Share your Vercel URL with anyone to use the app!**

---

## 📚 Next Steps

- **Monitor performance:** Vercel Analytics
- **Update the app:** Push to GitHub → auto-deploys
- **Add a custom domain:** Vercel → Settings → Domains
- **Scale up:** Upgrade Vercel/Supabase plans if needed

---

## 🆘 Need Help?

- **Vercel docs:** https://vercel.com/docs
- **Next.js docs:** https://nextjs.org/docs
- **Supabase docs:** https://supabase.com/docs
- **See also:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), [REALTIME_SETUP.md](./REALTIME_SETUP.md)
- Check Realtime is enabled in Supabase ([REALTIME_SETUP.md](./REALTIME_SETUP.md))
- Check RLS policies exist
- Open browser console (F12) for errors

### Backend API not working

- Check Railway logs: Project → Deployments → Logs
- Verify Ollama is installed and running
- Check environment variables match what code expects

### Realtime sync fails

- Verify table has Realtime enabled in Supabase Dashboard → Replication
- Check RLS policies exist and allow public access
- Refresh browser (Ctrl+F5)

---

## 📊 Cost Estimates

| Service      | Free Tier                    | Cost            |
| ------------ | ---------------------------- | --------------- |
| **Vercel**   | 100GB bandwidth/month        | $20/month (Pro) |
| **Railway**  | $5 credit/month              | Pay-as-you-go   |
| **Supabase** | 500MB storage, 2GB bandwidth | $25/month (Pro) |
| **Ollama**   | Self-hosted or cloud service | Varies          |

---

## 🚀 Next Steps

1. Follow steps above for frontend + backend deployment
2. Test thoroughly on live URLs
3. Monitor logs for errors
4. Set up automatic deployments (already done with Vercel)
5. Consider enabling analytics: Vercel → Analytics tab

**Your app is now production-ready! 🎉**
```
