# Panduan Deployment MBTracker

Panduan lengkap untuk deploy aplikasi MBTracker ke production.

## Pilihan Platform Deployment

MBTracker dapat di-deploy ke berbagai platform:

1. **Vercel** (Recommended) - Gratis, mudah, auto-deploy dari GitHub
2. **Netlify** - Gratis, mudah, support form handling
3. **Railway** - Gratis tier tersedia
4. **Self-hosted** - VPS/Cloud server

## 1. Deploy ke Vercel (Recommended)

### Keuntungan
- ✅ Gratis untuk personal projects
- ✅ Auto-deploy dari GitHub
- ✅ Global CDN
- ✅ Custom domain gratis
- ✅ SSL otomatis
- ✅ Serverless functions support

### Langkah-langkah

#### 1.1 Push ke GitHub (Sudah dilakukan)
```bash
git push origin main
```

#### 1.2 Import ke Vercel

1. Buka [Vercel](https://vercel.com)
2. Login dengan GitHub
3. Klik "Add New" → "Project"
4. Pilih repository `budagbogor/psd`
5. Klik "Import"

#### 1.3 Konfigurasi Project

**Framework Preset**: Vite
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `dist`

#### 1.4 Environment Variables

Klik "Environment Variables" dan tambahkan:

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **⚠️ PENTING**: Jangan expose `service_role` key di frontend!

#### 1.5 Deploy

1. Klik "Deploy"
2. Tunggu ~2-3 menit
3. Aplikasi akan tersedia di `https://your-project.vercel.app`

#### 1.6 Update Supabase Redirect URLs

1. Buka Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Tambahkan di **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   ```
4. Tambahkan di **Site URL**:
   ```
   https://your-project.vercel.app
   ```

#### 1.7 Custom Domain (Opsional)

1. Di Vercel Dashboard, buka project
2. **Settings** → **Domains**
3. Klik "Add"
4. Masukkan domain Anda (contoh: `mbtracker.com`)
5. Ikuti instruksi untuk update DNS records

## 2. Deploy ke Netlify

### Langkah-langkah

#### 2.1 Build Production

```bash
npm run build
```

Folder `dist/` akan berisi production build.

#### 2.2 Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### 2.3 Deploy via Netlify UI

1. Buka [Netlify](https://netlify.com)
2. Klik "Add new site" → "Import an existing project"
3. Pilih GitHub dan repository `budagbogor/psd`
4. **Build command**: `npm run build`
5. **Publish directory**: `dist`
6. Tambahkan Environment Variables
7. Klik "Deploy"

#### 2.4 Konfigurasi Redirects

Buat file `netlify.toml` di root:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 3. Deploy ke Railway

### Langkah-langkah

1. Buka [Railway](https://railway.app)
2. Login dengan GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Pilih repository
5. Tambahkan Environment Variables
6. Railway akan auto-detect Vite dan deploy

## 4. Self-Hosted (VPS/Cloud)

### Prasyarat
- VPS dengan Ubuntu 20.04+ atau Debian 11+
- Domain (opsional)
- SSL certificate (Let's Encrypt)

### 4.1 Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install certbot untuk SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Clone dan Build

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/budagbogor/psd.git mbtracker
cd mbtracker

# Install dependencies
sudo npm install

# Create .env
sudo nano .env
# Isi dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

# Build
sudo npm run build
```

### 4.3 Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/mbtracker
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/mbtracker/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mbtracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Setup SSL

```bash
sudo certbot --nginx -d your-domain.com
```

### 4.5 Auto-deploy dengan GitHub Webhook (Opsional)

Buat script `deploy.sh`:
```bash
#!/bin/bash
cd /var/www/mbtracker
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

Setup webhook di GitHub → Settings → Webhooks.

## Optimasi Production

### 1. Environment Variables

Pastikan menggunakan production values:
```env
VITE_SUPABASE_URL=https://production.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
```

### 2. Build Optimization

Di `vite.config.ts`, tambahkan:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 3. Caching Headers

Untuk Vercel, buat `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Analytics (Opsional)

Tambahkan Google Analytics atau Vercel Analytics:
```bash
npm install @vercel/analytics
```

## Monitoring & Maintenance

### 1. Error Tracking

Gunakan Sentry untuk error tracking:
```bash
npm install @sentry/react
```

### 2. Performance Monitoring

- Vercel Analytics (built-in)
- Google PageSpeed Insights
- Lighthouse CI

### 3. Backup Database

Setup automatic backup di Supabase:
- Dashboard → Database → Backups
- Enable Point-in-Time Recovery (PITR)

### 4. Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update
npm update

# Test
npm run build
npm run preview
```

## Checklist Pre-Launch

- [ ] Environment variables sudah benar
- [ ] Database migrations sudah running
- [ ] Storage buckets sudah dibuat
- [ ] Authentication sudah dikonfigurasi
- [ ] Redirect URLs sudah diupdate
- [ ] SSL certificate aktif
- [ ] Custom domain sudah pointing
- [ ] Error tracking sudah setup
- [ ] Backup database sudah aktif
- [ ] Testing di production environment
- [ ] Documentation sudah lengkap

## Rollback Strategy

Jika terjadi masalah di production:

### Vercel
1. Dashboard → Deployments
2. Pilih deployment sebelumnya yang stabil
3. Klik "Promote to Production"

### Netlify
1. Dashboard → Deploys
2. Pilih deploy sebelumnya
3. Klik "Publish deploy"

### Self-hosted
```bash
cd /var/www/mbtracker
git log --oneline
git reset --hard <commit-hash>
npm install
npm run build
sudo systemctl reload nginx
```

## Troubleshooting Production

### Build Failed
- Cek error logs
- Pastikan semua dependencies terinstall
- Cek environment variables

### 404 on Refresh
- Tambahkan redirect rules (lihat section Netlify/Vercel)
- Untuk nginx, pastikan `try_files` sudah benar

### Slow Performance
- Enable gzip compression
- Optimize images
- Use CDN
- Enable caching

## Support

Jika mengalami masalah saat deployment:
- 📧 Email: support@mbtracker.com
- 💬 GitHub Issues: [https://github.com/budagbogor/psd/issues](https://github.com/budagbogor/psd/issues)
