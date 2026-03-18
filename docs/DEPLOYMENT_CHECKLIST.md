# 📋 DEPLOYMENT CHECKLIST - Safety Forms Application

**Server**: 147.93.95.151  
**Domain**: safety.creohub.io  
**Application**: Safety Manager  
**Prepared**: February 13, 2026

---

## 🎯 PRE-DEPLOYMENT (Local Machine)

### Code & Repository
- [ ] All code committed to git
- [ ] No uncommitted changes (`git status` clean)
- [ ] `.gitignore` configured properly
- [ ] No sensitive data in repository
- [ ] README.md up to date

### Build Prerequisites
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] 5GB free disk space
- [ ] No antivirus blocking npm modules
- [ ] Internet connection stable

### Dependencies
- [ ] `backend/package.json` updated
- [ ] `frontend/package.json` updated
- [ ] No high-risk security vulnerabilities (`npm audit`)
- [ ] All dependencies documented
- [ ] Lock files present (package-lock.json)

### Configuration Files
- [ ] `.env.production` template created
- [ ] `deploy.sh` script updated
- [ ] `ecosystem.config.js` configured
- [ ] `nginx-safety.conf` created
- [ ] Database schema current (`schema.sql`)

### Testing (LOCAL)
- [ ] Backend tests passing (`npm test`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] No critical console warnings
- [ ] Manual form submission test passed
- [ ] PDF generation working locally
- [ ] Photo upload working locally

---

## 🏗 BUILD PHASE

### Backend Build
- [ ] Dependencies installed (`npm install --production`)
- [ ] Type checking passed (if TypeScript)
- [ ] No build errors
- [ ] Output directory created
- [ ] Config files in place
- [ ] Database migrations ready

### Frontend Build
- [ ] React app builds successfully
- [ ] `frontend/build/` directory created
- [ ] `index.html` present
- [ ] Static assets optimized
- [ ] Source maps available (optional)
- [ ] Service worker configured (optional)

### Package Creation
- [ ] Deployment folder created: `deployment_YYYYMMDD_HHMM`
- [ ] Backend copied (src, node_modules, config)
- [ ] Frontend copied (build, public)
- [ ] Database schema copied
- [ ] Deployment scripts copied
- [ ] Documentation copied

### Verification
- [ ] All required files present
- [ ] File permissions set correctly
- [ ] No symbolic links in package
- [ ] Total size reasonable (< 500MB)
- [ ] Archive integrity checked

---

## 🌐 SERVER PREPARATION

### Server Access
- [ ] SSH connection working
- [ ] Root or sudo access available
- [ ] IP address reachable: 147.93.95.151
- [ ] No firewall blocking ports 80/443
- [ ] SSH key authentication configured

### Server Environment
- [ ] Ubuntu 20.04+ installed
- [ ] Node.js 16+ installed on server
- [ ] npm 8+ installed on server
- [ ] Nginx installed and running
- [ ] SQLite3 installed
- [ ] Git installed
- [ ] PM2 installed globally
- [ ] Certbot installed (for SSL)

### Directory Structure
- [ ] `/var/www/safety/` directory exists
- [ ] `/var/www/safety/database/` directory exists
- [ ] `/var/www/safety/backend/uploads/` directory exists
- [ ] `/var/www/safety/backend/logs/` directory exists
- [ ] `/var/www/safety/backend/pdfs/` directory exists
- [ ] `/backups/safety/` directory exists
- [ ] `/var/log/safety/` directory exists
- [ ] Proper ownership set (www-data user)
- [ ] Proper permissions set (755)

### System Configuration
- [ ] Firewall rules configured
- [ ] Port 5000 (backend) available
- [ ] Port 3000 (frontend dev) not needed
- [ ] Port 80 (HTTP) redirects to 443
- [ ] Port 443 (HTTPS) ready
- [ ] DNS configured for domain
- [ ] DNS propagated (nslookup check)

---

## 📦 DEPLOYMENT

### File Upload
- [ ] Deployment package uploaded to `/var/www/safety/`
- [ ] Files transferred completely
- [ ] No corruption during transfer
- [ ] SCP/SFTP completed successfully

### File Organization
- [ ] Files extracted/moved correctly
- [ ] Deployment folder cleaned up
- [ ] Current symlink updated (if using)
- [ ] Previous version backed up

### Dependencies Installation
- [ ] `npm install --production` successful
- [ ] Node modules installed correctly
- [ ] No npm peer dependency warnings
- [ ] All critical packages present

### Database Setup
- [ ] `sqlite3 safety.db < schema.sql` executed
- [ ] Database file created at correct location
- [ ] Tables created (`users`, `forms`, `audit_logs`)
- [ ] Database permissions set correctly
- [ ] Initial data seeded (if applicable)

### Environment Configuration
- [ ] `.env` file created with production values
- [ ] `NODE_ENV=production` set
- [ ] `JWT_SECRET` generated (32+ chars)
- [ ] `DATABASE_URL` correct
- [ ] `CORS_ORIGIN` set to domain
- [ ] `API_PORT` configured (5000)
- [ ] Log paths configured
- [ ] Upload paths configured

---

## 🚀 SERVICE STARTUP

### PM2 Configuration
- [ ] `ecosystem.config.js` deployed
- [ ] PM2 ecosystem file syntax valid
- [ ] Environment variables in config
- [ ] Instance configuration (1+ instances)

### Service Start
- [ ] PM2 started: `pm2 start ecosystem.config.js`
- [ ] Backend process online: `pm2 status`
- [ ] Process shows healthy (green)
- [ ] No restart loops detected
- [ ] Log files created

### Auto-Restart Configuration
- [ ] PM2 startup created: `pm2 startup`
- [ ] PM2 configuration saved: `pm2 save`
- [ ] Services auto-start on reboot
- [ ] Verified with: `systemctl status pm2-root`

---

## 🔒 SSL & SECURITY

### SSL Certificate
- [ ] Domain added to DNS: `safety.creohub.io`
- [ ] DNS propagated completely
- [ ] Certbot configured: `certbot certonly --nginx -d safety.creohub.io`
- [ ] Certificate installed at `/etc/letsencrypt/live/`
- [ ] Certificate file permissions valid
- [ ] Auto-renewal configured with systemd timer

### Nginx Configuration
- [ ] nginx config file created: `/etc/nginx/sites-available/safety.creohub.io`
- [ ] Config syntax valid: `nginx -t`
- [ ] Site enabled: symlink created
- [ ] HTTP redirects to HTTPS
- [ ] Security headers configured
- [ ] Backend proxy configured
- [ ] Static file serving configured
- [ ] CORS headers set

### Nginx Service
- [ ] Nginx restarted: `systemctl restart nginx`
- [ ] Nginx enabled: `systemctl enable nginx`
- [ ] Nginx status healthy: `systemctl status nginx`
- [ ] No errors in error log

### Firewall
- [ ] UFW port 22 open (SSH)
- [ ] UFW port 80 open (HTTP)
- [ ] UFW port 443 open (HTTPS)
- [ ] UFW port 5000 closed (internal)
- [ ] UFW port 3000 closed (not needed)
- [ ] UFW enabled: `ufw enable`

---

## ✅ VERIFICATION & TESTING

### Service Status
- [ ] PM2 shows all processes online
- [ ] Backend listening on port 5000
- [ ] Nginx listening on port 80 and 443
- [ ] No critical errors in logs
- [ ] Memory usage acceptable (< 500MB)
- [ ] CPU usage healthy (< 30%)

### Health Checks
- [ ] Backend health endpoint responds: `curl https://127.0.0.1:5000/api/health`
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid: `openssl s_client -connect safety.creohub.io:443`
- [ ] Certificate doesn't expire soon

### Frontend Access
- [ ] Domain loads in browser: `https://safety.creohub.io`
- [ ] No mixed content warnings
- [ ] Styles loaded completely
- [ ] Icons/logos displaying
- [ ] No console errors
- [ ] Responsive design working

### API Integration
- [ ] Frontend can reach backend API
- [ ] Authentication endpoint working
- [ ] Forms list endpoint responding
- [ ] CORS headers correct
- [ ] API response times acceptable

### Database
- [ ] Database file exists and accessible
- [ ] Database tables created
- [ ] Basic queries working
- [ ] No corruption detected
- [ ] Permissions allow read/write

### Full Workflow Test
- [ ] User can login/register
- [ ] Can navigate to forms
- [ ] Can submit a form
- [ ] Form data saved to database
- [ ] PDF generated successfully
- [ ] PDF downloaded with correct name
- [ ] Photos uploaded and stored
- [ ] Success notification displayed

---

## 📊 MONITORING & LOGGING

### Log Files
- [ ] Backend log file created
- [ ] Nginx access log working
- [ ] Nginx error log checked
- [ ] PM2 logs accessible
- [ ] No critical errors
- [ ] Log rotation configured

### PM2 Monitoring
- [ ] `pm2 monit` shows healthy processes
- [ ] Memory usage stable
- [ ] CPU usage normal
- [ ] No frequent restarts
- [ ] Uptime accumulating

### Logging Best Practices
- [ ] Log level set to `info` (production)
- [ ] Sensitive data not logged
- [ ] Request/response logging enabled
- [ ] Error tracking configured
- [ ] Performance metrics logged

---

## 🔄 BACKUP & DISASTER RECOVERY

### Database Backup
- [ ] First backup created manually
- [ ] Backup script created
- [ ] Cron job configured for daily backups
- [ ] Backup location: `/backups/safety/`
- [ ] Backup retention policy set
- [ ] Backup tested for restoration

### File Backups
- [ ] Upload directory backed up
- [ ] Configuration backed up
- [ ] Database backed up
- [ ] Backup scripts in place

### Recovery Documentation
- [ ] Recovery procedures documented
- [ ] Backup restoration tested
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

---

## 📞 POST-DEPLOYMENT

### Notification
- [ ] Team notified of deployment
- [ ] Users informed of new system
- [ ] Support contacts updated
- [ ] Documentation shared
- [ ] Training scheduled (if needed)

### Monitoring Alert
- [ ] Application monitoring enabled (optional)
- [ ] Uptime monitoring configured (optional)
- [ ] Alert contacts configured
- [ ] Alert thresholds set

### Documentation
- [ ] Deployment documented
- [ ] Configuration documented
- [ ] Admin procedures documented
- [ ] Troubleshooting guide created
- [ ] User guide available

### Performance Baseline
- [ ] Response times recorded
- [ ] Load testing completed (optional)
- [ ] Page load times measured
- [ ] API latency recorded
- [ ] Database query performance checked

---

## 🎉 FINAL SIGN-OFF

- [ ] All checklist items completed
- [ ] No critical issues remaining
- [ ] System tested end-to-end
- [ ] Performance acceptable
- [ ] Security requirements met
- [ ] Documentation complete
- [ ] Team trained (if applicable)
- [ ] Support procedures in place

### Deployment Approved By
**Name**: _______________________  
**Date**: _______________________  
**Role**: _______________________  

### Deployment Completed By
**Name**: _______________________  
**Date**: _______________________  
**Timestamp**: _______________________  

---

## 📝 NOTES & ISSUES

```
[Use this section to document any issues, workarounds, or special configurations]


______________________________________________________________________________


______________________________________________________________________________


______________________________________________________________________________

```

---

## 🆘 ROLLBACK PROCEDURES

If critical issues occur:

1. **Identify issue** from logs
2. **Stop services**: `pm2 stop all`
3. **Restore backup database**: `cp /backups/safety/safety_BACKUP.db /var/www/safety/database/safety.db`
4. **Revert code** (if applicable): `git revert HEAD~1`
5. **Restart services**: `pm2 start all`
6. **Verify status**: `pm2 status`
7. **Document incident**

---

**Deployment Protocol Version**: 1.0  
**Last Updated**: February 13, 2026  
**Status**: Ready for Production
