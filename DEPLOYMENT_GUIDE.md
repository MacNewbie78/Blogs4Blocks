# Blogs 4 Blocks - Hostinger VPS Deployment Guide

## Prerequisites
- Hostinger **VPS** or **Cloud** hosting plan (shared hosting will NOT work)
- A domain name (e.g., blogs4blocks.com)
- SSH access to your VPS

---

## Step 1: Access Your VPS
```bash
ssh root@your-vps-ip
```

## Step 2: Install System Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python 3.11+
apt install -y python3 python3-pip python3-venv

# Install MongoDB
# Follow: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
# OR use MongoDB Atlas (cloud) - recommended for easier management

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

## Step 3: Clone Your Code
```bash
# Create app directory
mkdir -p /var/www/blogs4blocks
cd /var/www/blogs4blocks

# Upload your code (via git or scp)
# Option 1: Git
git clone <your-repo-url> .

# Option 2: SCP from your machine
# scp -r /path/to/your/app root@your-vps-ip:/var/www/blogs4blocks/
```

## Step 4: Setup Backend
```bash
cd /var/www/blogs4blocks/backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=blogs4blocks
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com
ADMIN_SETUP_KEY=your-secure-admin-key
EOF

# Test backend starts
uvicorn server:app --host 0.0.0.0 --port 8001
# If it works, Ctrl+C to stop
```

## Step 5: Build Frontend
```bash
cd /var/www/blogs4blocks/frontend

# Create .env for production
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Install dependencies and build
npm install --legacy-peer-deps
# OR: yarn install
npm run build
# OR: yarn build
# This creates a 'build' folder with static files
```

## Step 6: Configure Nginx
```bash
cat > /etc/nginx/sites-available/blogs4blocks << 'NGINX'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React static files)
    root /var/www/blogs4blocks/frontend/build;
    index index.html;

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Uploaded files
    location /api/uploads/ {
        proxy_pass http://127.0.0.1:8001;
    }

    # WebSocket support
    location /api/ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

# Enable the site
ln -sf /etc/nginx/sites-available/blogs4blocks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t && systemctl restart nginx
```

## Step 7: Setup SSL (HTTPS)
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow the prompts. Certbot auto-renews.
```

## Step 8: Create Systemd Service for Backend
```bash
cat > /etc/systemd/system/blogs4blocks.service << 'SERVICE'
[Unit]
Description=Blogs 4 Blocks Backend
After=network.target mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/blogs4blocks/backend
Environment=PATH=/var/www/blogs4blocks/backend/venv/bin:/usr/bin
ExecStart=/var/www/blogs4blocks/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

# Enable and start the service
systemctl daemon-reload
systemctl enable blogs4blocks
systemctl start blogs4blocks

# Check status
systemctl status blogs4blocks
```

## Step 9: Verify Everything Works
1. Visit `https://yourdomain.com` - should see the homepage
2. Visit `https://yourdomain.com/api/stats` - should see JSON stats
3. Try registering a new account
4. Navigate to `/admin-setup` and create your admin account using your ADMIN_SETUP_KEY

## Step 10: Setup Admin Account
1. Go to `https://yourdomain.com/auth` and register your account
2. Go to `https://yourdomain.com/admin-setup`
3. Enter your `ADMIN_SETUP_KEY` from the backend .env file
4. You're now an admin!

---

## Maintenance Commands
```bash
# View backend logs
journalctl -u blogs4blocks -f

# Restart backend
systemctl restart blogs4blocks

# Restart Nginx
systemctl restart nginx

# Update code
cd /var/www/blogs4blocks
git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt
systemctl restart blogs4blocks
cd ../frontend && npm run build
# Frontend updates are instant (static files)
```

## Optional: MongoDB Atlas (Cloud Database)
Instead of running MongoDB locally, use MongoDB Atlas:
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGO_URL` in backend/.env:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=blogs4blocks
   ```

## Optional: Setup Weekly Digest Cron
```bash
# Add a cron job to send weekly digest every Monday at 9 AM
crontab -e
# Add this line:
0 9 * * 1 curl -X POST http://127.0.0.1:8001/api/admin/send-digest -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting
- **502 Bad Gateway**: Backend isn't running. Check `systemctl status blogs4blocks`
- **WebSocket errors**: Make sure Nginx proxy config includes WebSocket headers
- **CORS errors**: Update CORS_ORIGINS in backend/.env with your domain
- **Images not loading**: Check Nginx is proxying /api/uploads/ correctly
