# 🚀 DEPLOYMENT QUICK REFERENCE CARD

## SAFETY FORMS - SEAFOOD SAFETY MANAGEMENT SYSTEM

**Server**: 147.93.95.151 | **Domain**: safety.creohub.io | **Status**: ✅ READY

---

## 📋 ONE-PAGE DEPLOYMENT GUIDE

### STEP 1: BUILD LOCALLY (5 min)
```bash
# Windows PowerShell
cd d:\Safety
.\Deploy-Package.ps1

# Output: deployment_YYYYMMDD_HHMM/
```

### STEP 2: UPLOAD (2 min)
```bash
scp -r deployment_YYYYMMDD_HHMM root@147.93.95.151:/var/www/safety/
```

### STEP 3: DEPLOY ON SERVER (3 min)
```bash
ssh root@147.93.95.151
cd /var/www/safety
sudo bash deploy.sh
```

**Total: ~10 minutes ⏱️**

---

## ✅ VERIFY DEPLOYMENT

```bash
# Check services
pm2 status                          → Should show "online"

# Test API
curl https://safety.creohub.io/api/health  → Should respond

# Open in browser
https://safety.creohub.io          → Should load dashboard

# Test form submission
1. Click "New Assessment"
2. Select form type (e.g., Inspection)
3. Fill form & add photo
4. Click "Complete & Generate PDF"
5. PDF should download automatically
```

---

## 📊 KEY COMMANDS

### Status & Monitoring
```bash
pm2 status                    # Service status
pm2 logs                      # View logs
pm2 monit                     # Monitor resources
pm2 restart all               # Restart services
```

### Database
```bash
sqlite3 database/safety.db ".tables"           # List tables
sqlite3 database/safety.db "SELECT COUNT(*) FROM forms;" # Count forms
```

### Nginx
```bash
systemctl status nginx        # Nginx status
nginx -t                      # Test config
systemctl reload nginx        # Reload config
tail -f /var/log/nginx/error.log  # View errors
```

### System Info
```bash
node --version               # Check Node
npm --version               # Check npm
pm2 -v                      # Check PM2
df -h                       # Disk space
free -h                     # Memory
```

---

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| **Service won't start** | `pm2 logs` → check errors → `pm2 restart all` |
| **404 on API** | `curl http://127.0.0.1:5000/api/health` → verify backend running |
| **SSL error** | `certbot certificates` → check expiry → `certbot renew` |
| **Database error** | Check path: `/var/www/safety/database/safety.db` |
| **Nginx not connecting** | Check: `nginx -t` → `systemctl reload nginx` |
| **Port already in use** | `lsof -i :5000` → `kill -9 <PID>` |

---

## 🔐 SECURITY CHECKLIST

- [ ] SSL certificate installed & valid
- [ ] HTTPS enforced (HTTP→HTTPS redirect)
- [ ] Security headers configured
- [ ] Firewall ports configured (80, 443 open; 5000 closed)
- [ ] JWT secret generated (32+ chars)
- [ ] Environment variables in `.env`
- [ ] Database backups configured

---

## 📁 IMPORTANT PATHS

| Path | Purpose |
|------|---------|
| `/var/www/safety/` | Application root |
| `/var/www/safety/backend/src` | Backend code |
| `/var/www/safety/frontend/build` | Frontend build |
| `/var/www/safety/database/safety.db` | Database |
| `/var/www/safety/backend/uploads/` | Uploaded files |
| `/backups/safety/` | Database backups |
| `/var/log/safety/` | Application logs |
| `/etc/nginx/sites-available/` | Nginx config |
| `/etc/letsencrypt/live/` | SSL certificates |

---

## 🚨 EMERGENCY PROCEDURES

### Service Down
```bash
# 1. Check status
pm2 status

# 2. View logs
pm2 logs --err

# 3. Restart
pm2 restart all

# 4. Verify
curl https://safety.creohub.io
```

### Restore from Backup
```bash
# 1. Stop service
pm2 stop all

# 2. Restore database
cp /backups/safety/safety_BACKUP.db /var/www/safety/database/safety.db

# 3. Restart
pm2 restart all

# 4. Verify
pm2 status
```

### Manual Redeployment
```bash
# 1. SSH to server
ssh root@147.93.95.151

# 2. Navigate to app
cd /var/www/safety

# 3. Pull latest
git pull origin main

# 4. Install dependencies
npm install --production

# 5. Restart services
pm2 restart all
```

---

## 💾 BACKUP & RECOVERY

```bash
# Manual backup
cp /var/www/safety/database/safety.db /backups/safety/backup_$(date +%s).db

# List backups
ls -lh /backups/safety/

# Restore backup
cp /backups/safety/backup_XXXXX.db /var/www/safety/database/safety.db
pm2 restart all
```

---

## 📞 MONITORING

### Health Check (Every 5 min)
```bash
# Add to crontab:
# */5 * * * * curl -f https://safety.creohub.io/api/health || alert
```

### Log Rotation
```bash
# PM2 logs rotate automatically
# Manual cleanup:
pm2 flush
```

### Disk Space
```bash
# Check
df -h

# If low, check log size:
du -sh /var/log/safety/*
```

---

## 🎯 DEPLOYMENT CHECKLIST

Before deploying:
- [ ] Code committed to git
- [ ] All tests passing
- [ ] Frontend builds successfully
- [ ] `.env` prepared
- [ ] Server access verified
- [ ] DNS configured

During deployment:
- [ ] Deploy package created
- [ ] Files uploaded
- [ ] Database initialized
- [ ] Services started
- [ ] Health checks passed

After deployment:
- [ ] Frontend accessible
- [ ] API responding
- [ ] Forms submitting
- [ ] PDFs generating
- [ ] Photos uploading
- [ ] Logs show no errors

---

## 📊 PERFORMANCE BASELINE

| Metric | Target | Check Command |
|--------|--------|----------------|
| Page Load | < 2s | Chrome DevTools → Network tab |
| API Response | < 500ms | `curl -w "@curl-format.txt"` |
| Memory | < 300MB | `pm2 monit` |
| CPU | < 20% | `top` or `pm2 monit` |

---

## 🆘 SUPPORT CONTACTS

**Technical Issues**: deployment@safety.com  
**Security Concerns**: security@safety.com  
**Emergency**: +1-XXX-XXX-XXXX (24/7)

---

## 📚 DOCUMENTATION

- **Full Protocol**: FULL_DEPLOYMENT_PROTOCOL.md
- **Quick Start**: DEPLOYMENT_QUICKSTART.md  
- **Checklist**: DEPLOYMENT_CHECKLIST.md
- **Summary**: DEPLOYMENT_SUMMARY.md
- **API Docs**: API_DOCUMENTATION.md
- **Security**: SECURITY.md

---

## ✨ USEFUL ALIASES (Add to ~/.bashrc)

```bash
alias safety-status='pm2 status'
alias safety-logs='pm2 logs safety-backend'
alias safety-restart='pm2 restart safety-backend'
alias safety-db='sqlite3 /var/www/safety/database/safety.db'
alias safety-monitor='pm2 monit'
alias safety-backup='cp /var/www/safety/database/safety.db /backups/safety/backup_$(date +%s).db'
```

---

## 🔗 QUICK LINKS

| Resource | URL |
|----------|-----|
| Application | https://safety.creohub.io |
| API Health | https://safety.creohub.io/api/health |
| PM2 Web Dashboard | http://147.93.95.151:9615 |
| SSH to Server | ssh root@147.93.95.151 |
| Nginx Status | systemctl status nginx |

---

## ⏱️ TIMELINE

- **Build**: 5 minutes (local)
- **Upload**: 2 minutes (SCP)
- **Deploy**: 3 minutes (server)
- **Verify**: 2 minutes (testing)
- **Total**: ~10-15 minutes

---

🎉 **DEPLOYMENT COMPLETE WHEN:**
- ✅ pm2 status shows "online"
- ✅ https://safety.creohub.io loads
- ✅ Form submission works
- ✅ PDF download works
- ✅ Logs show no critical errors

---

**Last Updated**: February 13, 2026  
**Version**: 1.0  
**Status**: PRODUCTION READY ✅
