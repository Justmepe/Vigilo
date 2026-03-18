# Deployment Guide - Safety Forms Application

**Application**: Safety Manager - Seafood Safety Forms  
**Environment**: Production (Linux/Ubuntu)  
**Server**: 147.93.95.151  
**Domain**: safety.creohub.io

---

## 📋 Pre-Deployment Checklist

### Server Requirements
- [ ] Ubuntu 20.04+ or Debian 10+
- [ ] Node.js 16+ installed
- [ ] npm or yarn installed
- [ ] Nginx installed and configured
- [ ] SQLite3 or PostgreSQL installed
- [ ] Git installed
- [ ] SSL certificate (Let's Encrypt compatible)
- [ ] 2GB+ RAM
- [ ] 10GB+ disk space

### Application Prerequisites
- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] API endpoints tested
- [ ] Frontend build successful
- [ ] Backend starts without errors

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Connect to Server
```bash
ssh root@147.93.95.151
```

### Step 2: Create Application Directory
```bash
mkdir -p /var/www/safety
cd /var/www/safety
```

### Step 3: Clone Your Repository
```bash
# Option A: If using GitHub
git clone https://github.com/YOUR_USERNAME/safety-forms.git .

# Option B: If uploading locally (copy files)
# Use SCP or your preferred method to upload files
scp -r ~/Projects/Safety/* root@147.93.95.151:/var/www/safety/
```

### Step 4: Install Dependencies
```bash
# Backend dependencies
cd /var/www/safety/backend
npm install --production

# Frontend dependencies
cd /var/www/safety/frontend
npm install --production
```

### Step 5: Build Frontend
```bash
cd /var/www/safety/frontend
npm run build
```

### Step 6: Setup Environment Variables
```bash
# Create backend environment file
cat > /var/www/safety/backend/.env <<'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:///var/www/safety/database/safety.db
JWT_SECRET=your-secret-key-change-this-in-production
UPLOAD_DIR=/var/www/safety/backend/uploads
LOG_LEVEL=info
CORS_ORIGIN=https://safety.creohub.io
EOF
```

### Step 7: Initialize Database
```bash
cd /var/www/safety/backend
npm run init-db
```

### Step 8: Set Permissions
```bash
chown -R www-data:www-data /var/www/safety
chmod -R 755 /var/www/safety
chmod -R 775 /var/www/safety/backend/uploads
chmod -R 775 /var/www/safety/database
```

### Step 9: Configure Nginx
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/safety.creohub.io <<'EOF'
upstream node_backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name safety.creohub.io;
    client_max_body_size 10M;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name safety.creohub.io;
    client_max_body_size 10M;

    # SSL Certificates (install Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/safety.creohub.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/safety.creohub.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (React build)
    root /var/www/safety/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://node_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/safety/backend/uploads/;
        expires 7d;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
```

### Step 10: Enable Nginx Configuration
```bash
ln -s /etc/nginx/sites-available/safety.creohub.io /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

### Step 11: Setup SSL Certificate (Let's Encrypt)
```bash
# Install Certbot if not already installed
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d safety.creohub.io

# Auto-renewal (should be automatic with certbot)
systemctl enable certbot.timer
```

### Step 12: Setup Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > /var/www/safety/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'safety-backend',
    script: './backend/server.js',
    cwd: '/var/www/safety',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/safety-backend-error.log',
    out_file: '/var/log/safety-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js

# Configure PM2 startup
pm2 startup
pm2 save
```

### Step 13: Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check Nginx
systemctl status nginx

# Test backend
curl http://localhost:5000/api/health

# Check logs
pm2 logs safety-backend
```

### Step 14: Configure Firewall
```bash
ufw enable
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw status
```

---

## 🔒 Security Configuration

### Nginx Security Headers (Already in config)
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'";
```

### File Permissions
```bash
# Restrict sensitive files
chmod 600 /var/www/safety/backend/.env
chmod 700 /var/www/safety/database
```

### Rate Limiting (Backend configured)
- Login: 10 attempts per 15 minutes
- API: 100 requests per minute

---

## 📊 Monitoring & Logs

### View Application Logs
```bash
# Real-time logs
pm2 logs safety-backend

# View specific date
tail -f /var/log/safety-backend-out.log

# View errors
tail -f /var/log/safety-backend-error.log
```

### Monitor System Resources
```bash
# Install monitoring
pm2 install pm2-auto-pull

# Check CPU/Memory
pm2 monit

# See all processes
pm2 status
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

---

## 🔄 Updating the Application

### Pull Latest Changes
```bash
cd /var/www/safety
git pull origin main
```

### Update Dependencies
```bash
cd backend && npm install --production
cd ../frontend && npm install --production
```

### Rebuild Frontend
```bash
cd frontend
npm run build
```

### Restart Backend
```bash
pm2 restart safety-backend
```

### Reload Nginx
```bash
systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Database Connection Error
```bash
# Check database file exists
ls -la /var/www/safety/database/

# Check permissions
chmod 755 /var/www/safety/database
chmod 644 /var/www/safety/database/safety.db
```

### Nginx Configuration Error
```bash
# Test configuration
nginx -t

# View error
journalctl -u nginx -n 50
```

### PM2 Not Starting
```bash
# Clear PM2 cache
pm2 kill
pm2 start ecosystem.config.js

# Check logs
pm2 logs
```

### CORS Issues
```bash
# Update backend .env
CORS_ORIGIN=https://safety.creohub.io

# Restart backend
pm2 restart safety-backend
```

### File Upload Issues
```bash
# Check permissions
ls -la /var/www/safety/backend/uploads/

# Fix permissions
chmod 775 /var/www/safety/backend/uploads/
chown www-data:www-data /var/www/safety/backend/uploads/
```

---

## 📈 Performance Optimization

### Enable Gzip Compression
```nginx
# In /etc/nginx/nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Add Caching Headers
```nginx
# Static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization
```bash
# Run database maintenance
sqlite3 /var/www/safety/database/safety.db "VACUUM; ANALYZE;"
```

### PM2 Cluster Mode
```bash
# Already configured in ecosystem.config.js
# Uses all available CPU cores
instances: 'max'
exec_mode: 'cluster'
```

---

## 🔐 Backup & Recovery

### Daily Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/safety

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/safety/database/safety.db $BACKUP_DIR/safety_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/safety/backend/uploads/

# Keep only last 30 days
find $BACKUP_DIR -name "safety_*.db" -mtime +30 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Restore from Backup
```bash
# Restore database
cp /backups/safety/safety_YYYYMMDD_HHMMSS.db /var/www/safety/database/safety.db

# Restore uploads
tar -xzf /backups/safety/uploads_YYYYMMDD_HHMMSS.tar.gz -C /

# Fix permissions
chown -R www-data:www-data /var/www/safety

# Restart
pm2 restart safety-backend
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at https://safety.creohub.io
- [ ] Login page displays correctly
- [ ] Can login with test credentials
- [ ] Can fill out safety forms
- [ ] Can capture photos
- [ ] Can generate PDFs
- [ ] Can submit forms
- [ ] Uploads save correctly
- [ ] Database operations working
- [ ] No JavaScript errors in browser console
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Logs are being written
- [ ] Backups are running
- [ ] Monitoring is active

---

## 📞 Support & Documentation

**Common Commands Reference**:
```bash
# View logs
pm2 logs

# Restart backend
pm2 restart safety-backend

# Restart all services
systemctl restart nginx
pm2 restart all

# Check status
pm2 status
systemctl status nginx

# Update from Git
cd /var/www/safety && git pull && npm install
```

**Useful Links**:
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Reverse Proxy Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/)

---

## 🚨 Emergency Procedures

### Application Crash
```bash
# Check status
pm2 status

# View logs
pm2 logs safety-backend

# Restart
pm2 restart safety-backend

# If restart fails
pm2 kill
pm2 start ecosystem.config.js
```

### Database Corruption
```bash
# Restore from backup
cp /backups/safety/safety_RECENT.db /var/www/safety/database/safety.db

# Restart
pm2 restart safety-backend
```

### Disk Full
```bash
# Check space
df -h

# Clear old logs
find /var/log -mtime +30 -delete

# Clear backups if needed
find /backups -mtime +60 -delete
```

### High CPU/Memory Usage
```bash
# Check processes
pm2 monit

# View detailed logs
pm2 logs --lines 100 --err

# Restart if needed
pm2 restart safety-backend
```

---

**Deployment Date**: [Current Date]  
**Deployed By**: [Your Name]  
**Version**: 1.0.0  
**Last Updated**: February 11, 2026
