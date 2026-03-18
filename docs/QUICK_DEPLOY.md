# 🚀 Quick Deployment Instructions

## 📦 Files to Upload (2 files)

1. **safety-complete-20260212_224431.tar.gz** (615 KB)
2. **deploy-enhanced-loto.sh**

**Upload Location:** `/var/www/safety/` on server 147.93.95.151

---

## ⚡ Method 1: SCP Upload (Fast)

Open PowerShell or Git Bash on Windows:

```bash
cd d:\Safety
scp safety-complete-20260212_224431.tar.gz root@147.93.95.151:/var/www/safety/
scp deploy-enhanced-loto.sh root@147.93.95.151:/var/www/safety/
```

---

## ⚡ Method 2: WinSCP (GUI - Easier)

1. Download: https://winscp.net/eng/download.php
2. Connect to: `147.93.95.151` (user: `root`)
3. Navigate to: `/var/www/safety/`
4. Drag and drop both files

---

## 🚀 Deploy on Server

SSH to server (you're already there):

```bash
cd /var/www/safety
chmod +x deploy-enhanced-loto.sh
./deploy-enhanced-loto.sh
```

**That's it!** Script handles everything:
- Creates backup
- Extracts files
- Installs dependencies
- Builds frontend
- Restarts services

**Estimated time:** 5-10 minutes

---

## ✅ After Deployment

Visit: **https://safety.creohub.io**

Test Enhanced LOTO Form:
1. Login
2. New Form → Lockout/Tagout (LOTO)
3. Should see 25 sections with seafood-specific features

---

## 📞 If Issues

```bash
# Check logs
pm2 logs

# Restart manually
pm2 restart all
nginx -s reload
```

**Ready to deploy!** 🎯
