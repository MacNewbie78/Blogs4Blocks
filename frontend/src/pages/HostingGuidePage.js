import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Server, Terminal, Shield, Globe, Database, CheckCircle } from 'lucide-react';

const steps = [
  {
    title: "Access Your VPS",
    icon: <Terminal className="w-5 h-5" />,
    code: "ssh root@your-vps-ip",
    description: "Connect to your Hostinger VPS via SSH."
  },
  {
    title: "Install System Dependencies",
    icon: <Server className="w-5 h-5" />,
    code: `apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs python3 python3-pip python3-venv nginx certbot python3-certbot-nginx`,
    description: "Install Node.js, Python 3, Nginx, and Certbot for SSL."
  },
  {
    title: "Clone & Setup Backend",
    icon: <Database className="w-5 h-5" />,
    code: `mkdir -p /var/www/blogs4blocks && cd /var/www/blogs4blocks
git clone <your-repo-url> .
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=blogs4blocks
JWT_SECRET=your-super-secret-jwt-key-change-this
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com
ADMIN_SETUP_KEY=your-secure-admin-key
EOF`,
    description: "Clone your code, create a virtual environment, install dependencies, and configure environment variables."
  },
  {
    title: "Build Frontend",
    icon: <Globe className="w-5 h-5" />,
    code: `cd /var/www/blogs4blocks/frontend
echo 'REACT_APP_BACKEND_URL=https://yourdomain.com' > .env
yarn install && yarn build`,
    description: "Install frontend dependencies and create a production build."
  },
  {
    title: "Configure Nginx",
    icon: <Shield className="w-5 h-5" />,
    code: `cat > /etc/nginx/sites-available/blogs4blocks << 'NGINX'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/blogs4blocks/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }

    location /api/ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/blogs4blocks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx`,
    description: "Set up Nginx as reverse proxy for the backend API and serve the React build."
  },
  {
    title: "SSL & Systemd Service",
    icon: <CheckCircle className="w-5 h-5" />,
    code: `certbot --nginx -d yourdomain.com -d www.yourdomain.com

cat > /etc/systemd/system/blogs4blocks.service << 'SERVICE'
[Unit]
Description=Blogs 4 Blocks Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/blogs4blocks/backend
Environment=PATH=/var/www/blogs4blocks/backend/venv/bin:/usr/bin
ExecStart=/var/www/blogs4blocks/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload && systemctl enable blogs4blocks && systemctl start blogs4blocks`,
    description: "Enable HTTPS with Let's Encrypt and create a systemd service for auto-restart."
  },
];

export default function HostingGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" data-testid="hosting-guide-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-brand-grey hover:text-[#1A1A1A]" data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#1A1A1A]">Hostinger VPS Deployment Guide</h1>
          <p className="text-brand-grey mt-2">Step-by-step instructions to deploy Blogs 4 Blocks on a Hostinger VPS.</p>
        </div>

        <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-none p-4 mb-8">
          <p className="text-sm text-[#92400E] font-medium">Prerequisites</p>
          <ul className="text-sm text-[#92400E]/80 mt-1 space-y-1 list-disc ml-4">
            <li>Hostinger <strong>VPS</strong> or <strong>Cloud</strong> hosting plan (shared hosting will NOT work)</li>
            <li>A domain name pointed to your VPS IP</li>
            <li>SSH access to your server</li>
            <li>MongoDB installed locally or a MongoDB Atlas connection string</li>
          </ul>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-none border border-[#E5E5E5] overflow-hidden" data-testid={`deployment-step-${i + 1}`}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F4F4F5]">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <div className="flex items-center gap-2 text-[#1A1A1A] font-heading font-bold">{step.icon} {step.title}</div>
              </div>
              <div className="p-6">
                <p className="text-sm text-brand-grey mb-4">{step.description}</p>
                <pre className="bg-[#1A1A1A] text-[#E5E5E5] rounded-none p-4 text-sm overflow-x-auto leading-relaxed">
                  <code>{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-none border border-[#E5E5E5] p-6 mt-8">
          <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-3">After Deployment</h3>
          <ol className="space-y-2 text-sm text-brand-grey list-decimal ml-4">
            <li>Visit <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">https://yourdomain.com</code> to verify the site loads</li>
            <li>Register your account and navigate to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin-setup</code> to become admin</li>
            <li>Check backend logs: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">journalctl -u blogs4blocks -f</code></li>
          </ol>
        </div>

        <div className="bg-white rounded-none border border-[#E5E5E5] p-6 mt-4">
          <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-3">Troubleshooting</h3>
          <ul className="space-y-2 text-sm text-brand-grey list-disc ml-4">
            <li><strong>502 Bad Gateway:</strong> Backend isn't running — check <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">systemctl status blogs4blocks</code></li>
            <li><strong>WebSocket errors:</strong> Ensure Nginx config includes WebSocket headers</li>
            <li><strong>CORS errors:</strong> Update CORS_ORIGINS in backend .env with your domain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
