# 🚀 DEPLOYMENT QUICK START - Safety Forms Application

**Server**: 147.93.95.151  
**Domain**: safety.creohub.io  
**Application**: Safety Manager  
**Status**: Ready to Deploy

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Local Machine (Windows)
```
✓ [ ] Node.js 16+ installed
✓ [ ] npm 8+ installed
✓ [ ] Code committed to git
✓ [ ] All tests passing locally (npm run test:e2e)
✓ [ ] Frontend builds successfully (npm run build)
```

### Server (Linux/Ubuntu 20.04+)
```
✓ [ ] Ubuntu 20.04+ or Debian 10+
✓ [ ] Node.js 16+ installed
✓ [ ] npm 8+ installed
✓ [ ] Nginx installed
✓ [ ] SQLite3 installed
✓ [ ] Git installed
✓ [ ] PM2 installed globally (npm install -g pm2)
✓ [ ] UFW firewall configured
✓ [ ] IP: 147.93.95.151 reachable
✓ [ ] SSH key configured
```

---

## 🚀 DEPLOYMENT STEPS (5 MINUTES)

### Step 1: Prepare on Local Machine (2 min)
```bash
# Windows: Follow the automated script
deploy-prepare.bat

# This will:
# - Clean old builds
# - Install dependencies
# - Run tests (optional)
# - Build frontend
# - Create deployment package

# Output: deployment_TIMESTAMP/ folder ready
```

### Step 2: Upload to Server (1 min)
```bash
# Copy deployment package to server
scp -r deployment_TIMESTAMP root@147.93.95.151:/var/www/safety/
```

### Step 3: Run on Server (2 min)
```bash
# SSH to server
ssh root@147.93.95.151

# Navigate to app directory
cd /var/www/safety

# Run deployment script
sudo bash deploy.sh

# This will:
# - Pull latest code
# - Install dependencies
# - Build frontend
# - Initialize database
# - Start services with PM2
# - Validate SSL
# - Run health checks
```

### Step 4: Verify Deployment (30 sec)
```bash
# Check service status
pm2 status

# View logs
pm2 logs safety-backend

# Test API
curl https://safety.creohub.io/api/health

# Open in browser
# https://safety.creohub.io
```

---

## 📦 FILES CREATED FOR DEPLOYMENT

| File | Purpose | Location |
|------|---------|----------|
| `DEPLOYMENT_GUIDE.md` | Complete deployment guide | Root directory |
| `deploy.sh` | Automated Linux deployment | Root directory |
| `deploy-prepare.bat` | Windows build preparation | Root directory |
| `ecosystem.config.js` | PM2 process manager config | Root directory |
| `backend/.env.production` | Backend environment template | backend/ |
| `frontend/.env.production` | Frontend environment template | frontend/ |

---

## 🔧 CONFIGURATION REQUIRED

### 1. Update .env Files on Server
```bash
# Edit backend environment
nano /var/www/safety/backend/.env

# Set these values:
NODE_ENV=production
JWT_SECRET=generate-random-secure-string
DATABASE_URL=sqlite:///var/www/safety/database/safety.db
CORS_ORIGIN=https://safety.creohub.io
LOG_LEVEL=info
```

### 2. Install SSL Certificate (Let's Encrypt)
```bash
# This is automated in deploy.sh, but manual steps:
certbot certonly --nginx -d safety.creohub.io

# Auto-renewal:
systemctl enable certbot.timer
systemctl start certbot.timer
```

### 3. Verify DNS
```bash
# Make sure DNS propagates to server
nslookup safety.creohub.io
# Should return: 147.93.95.151
```

---

## ✅ VERIFICATION CHECKLIST

After deployment runs, verify:

```
✓ [ ] npm pm2 status shows "online"
✓ [ ] www-data owns /var/www/safety
✓ [ ] Database file exists: /var/www/safety/database/safety.db
✓ [ ] Frontend build exists: /var/www/safety/frontend/build
✓ [ ] SSL certificate valid: certbot certificates
✓ [ ] Nginx config valid: nginx -t
✓ [ ] API responding: curl http://localhost:5000/api/health
✓ [ ] Frontend loads: https://safety.creohub.io
✓ [ ] Login works with test credentials
✓ [ ] Can submit form and upload photos
✓ [ ] PDF generation works
```

---

## 🔧 COMMON TASKS

### Restart Application
```bash
pm2 restart safety-backend
```

### View Logs
```bash
# Recent logs
pm2 logs safety-backend --lines 50

# Follow logs in real-time
pm2 logs safety-backend

# Full logs
tail -f /var/log/safety-backend-out.log
```

### Update Application
```bash
cd /var/www/safety
git pull origin main
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

### Check Server Health
```bash
# Process status
pm2 status

# Resource usage
pm2 monit

# System resources
top
df -h
free -h
```

### Manage Uploads
```bash
# Check upload size
du -sh /var/www/safety/backend/uploads/

# Clear old uploads (30+ days)
find /var/www/safety/backend/uploads -type f -mtime +30 -delete
```

---

## 🐛 TROUBLESHOOTING

### Port 5000 Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or restart PM2
pm2 restart all
```

### Database Error
```bash
# Check database
ls -la /var/www/safety/database/

# Reinitialize
cd /var/www/safety/backend
npm run init-db
```

### Nginx Configuration Error
```bash
# Test config
nginx -t

# View error
journalctl -u nginx | tail -20

# Reload
systemctl reload nginx
```

### SSL Certificate Issues
```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew

# View Nginx SSL config
cat /etc/nginx/sites-available/safety.creohub.io
```

### PM2 Won't Start
```bash
# Kill all PM2 processes
pm2 kill

# Start fresh
pm2 start ecosystem.config.js

# Check logs
pm2 logs
```

### High Memory Usage
```bash
# Monitor memory
pm2 monit

# Check logs for errors
pm2 logs

# Restart service
pm2 restart safety-backend

# Check for file descriptor leaks
lsof -p $(pgrep -f "node ./backend/server.js") | wc -l
```

---

## 📊 MONITORING

### Setup Process Monitoring
```bash
# Install PM2+ for web dashboard
pm2 install pm2-auto-pull

# Start monitoring
pm2 web

# Access dashboard at: http://localhost:9615
```

### Check Application Logs Daily
```bash
# View today's errors
grep "ERROR\|error" /var/log/safety-backend-out.log

# Count errors
grep "ERROR" /var/log/safety-backend-out.log | wc -l

# View last hour
tail -f /var/log/safety-backend-out.log
```

### Monitor Disk Space
```bash
# Check disk usage
df -h

# Check application size
du -sh /var/www/safety
du -sh /var/www/safety/backend/uploads

# Setup alert (crontab)
# Add to: crontab -e
# 0 * * * * df -h | awk 'NR==2 {if ($5>80) print "Disk usage above 80%"}'
```

### Performance Metrics
```bash
# API response time
curl -w "Response time: %{time_total}s\n" https://safety.creohub.io/api/health

# Check database size
ls -lh /var/www/safety/database/safety.db
```

---

## 🔐 SECURITY

### Verify Security
```bash
# Check SSL grade
# https://www.ssllabs.com/ssltest/analyze.html?d=safety.creohub.io

# Test security headers
curl -I https://safety.creohub.io | grep -i "X-"

# Check firewall
ufw status numbered
```

### Regular Backups
```bash
# Backup command (runs automatically in deploy.sh)
cp /var/www/safety/database/safety.db /backups/safety/safety_$(date +%Y%m%d_%H%M%S).db

# List backups
ls -la /backups/safety/

# Restore from backup
cp /backups/safety/safety_TIMESTAMP.db /var/www/safety/database/safety.db
```

### Update Server
```bash
# Monthly security updates
apt-get update
apt-get upgrade -y

# Monitor for updates
unattended-upgrade  # Already configured with auto-security-updates
```

---

## 📈 SCALING UP (Future)

### Add Load Balancer
```nginx
# Health check endpoint
upstream backend {
    server safety1.example.com:5000;
    server safety2.example.com:5000;
    server safety3.example.com:5000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

### Database Optimization
```bash
# For high-load environments, migrate to PostgreSQL:
# Update DATABASE_URL in .env
NODE_ENV=production
DATABASE_URL=postgres://user:pass@db-server:5432/safety
```

### Content Delivery Network
```bash
# Add CloudFlare or similar CDN
# Point DNS to CloudFlare
# Dynamic caching for API responses
```

---

## 📞 SUPPORT

**Common Documentation**:
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Testing Commands](TEST_COMMANDS.md)
- [API Documentation](API_DOCUMENTATION.md)

**Nginx Docs**: https://nginx.org/en/docs/  
**PM2 Docs**: https://pm2.keymetrics.io/  
**Node.js Docs**: https://nodejs.org/en/docs/  
**Let's Encrypt**: https://letsencrypt.org/docs/

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment Complete When**:
- [x] https://safety.creohub.io loads
- [x] Login page displays correctly  
- [x] SSL certificate is valid
- [x] API endpoints responding
- [x] Database initialized
- [x] PM2 showing "online"
- [x] All health checks pass

---

## 📝 DEPLOYMENT LOG

**Deployment Date**: [Enter date]  
**Deployed By**: [Enter name]  
**Version**: [Enter version]  
**Notes**: [Any special notes]

---

**Ready to deploy? Run:**
```bash
# On Windows:
deploy-prepare.bat

# On Server:
bash deploy.sh
```

**Questions?** See DEPLOYMENT_GUIDE.md for complete documentation.
