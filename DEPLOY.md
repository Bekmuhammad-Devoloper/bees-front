# 🚀 Frontend Deploy Qo'llanmasi

## Domen: app.bekmuhammad.uz (yoki boshqa domen)

---

## 1-qadam: Serverga Termius orqali ulanish

Termius ilovasini oching va serveringizga SSH orqali ulaning:
- Host: sizning_server_ip
- Username: root (yoki sizning username)
- Password/SSH Key

---

## 2-qadam: Server tayyorlash

### Nginx o'rnatish (agar o'rnatilmagan bo'lsa)
```bash
sudo apt update
sudo apt install nginx -y
```

### Frontend uchun papka yaratish
```bash
sudo mkdir -p /var/www/bees-frontend
sudo chown -R $USER:$USER /var/www/bees-frontend
```

---

## 3-qadam: Build fayllarni serverga yuklash

### Variant A: SCP orqali (Termius yoki terminal)
Lokal kompyuterdan dist papkasini yuklash:
```bash
scp -r C:\Users\Onyx_PC\Desktop\bees\webapp\dist\* root@SERVER_IP:/var/www/bees-frontend/
```

### Variant B: GitHub orqali
Serverda:
```bash
cd /var/www
git clone https://github.com/Bekmuhammad-Devoloper/bees-front.git bees-frontend-repo
cd bees-frontend-repo
npm install
npm run build
cp -r dist/* /var/www/bees-frontend/
```

---

## 4-qadam: Nginx konfiguratsiyasi

### Konfiguratsiya faylini yaratish
```bash
sudo nano /etc/nginx/sites-available/bees-frontend
```

Quyidagini qo'shing:
```nginx
server {
    listen 80;
    server_name app.bekmuhammad.uz;  # O'zingizning domeningizni yozing
    root /var/www/bees-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # SPA uchun - barcha routelarni index.html ga yo'naltirish
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (agar kerak bo'lsa)
    location /api {
        proxy_pass https://bees.bekmuhammad.uz/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Konfiguratsiyani yoqish
```bash
sudo ln -s /etc/nginx/sites-available/bees-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5-qadam: SSL Sertifikat (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.bekmuhammad.uz
```

Certbot sizdan email so'raydi va avtomatik SSL o'rnatadi.

---

## 6-qadam: DNS sozlash

Domeningiz DNS panelida:
- Type: A
- Name: app (yoki @)
- Value: SERVER_IP
- TTL: 300

---

## 7-qadam: Yangilash (har safar)

Har safar yangi kod deploy qilganda:

### Lokal kompyuterda:
```bash
cd c:\Users\Onyx_PC\Desktop\bees\webapp
npm run build
```

### Serverda:
```bash
# Eski fayllarni tozalash
sudo rm -rf /var/www/bees-frontend/*

# Yangi fayllarni yuklash (SCP orqali lokal kompyuterdan)
# scp -r dist/* root@SERVER_IP:/var/www/bees-frontend/

# Nginx restart
sudo systemctl reload nginx
```

---

## Foydali buyruqlar

```bash
# Nginx statusini tekshirish
sudo systemctl status nginx

# Nginx loglarni ko'rish
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Nginx konfiguratsiyani tekshirish
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

---

## Eslatma

- Backend API: https://bees.bekmuhammad.uz/api
- Frontend: https://app.bekmuhammad.uz (yoki sizning domeningiz)
- `.env` faylida API URL ni to'g'ri ko'rsating
