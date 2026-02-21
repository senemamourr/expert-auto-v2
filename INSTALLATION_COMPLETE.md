# 🚀 INSTALLATION EXPERTISE AUTO - PROJET COMPLET

## 📦 CONTENU

Ce projet contient 3 dossiers :
1. **backend/** - API Express + PostgreSQL
2. **frontend/** - React + TypeScript
3. Ce fichier d'installation

---

## ⏱️ TEMPS D'INSTALLATION

- Backend Railway : 10 minutes
- Frontend Vercel : 5 minutes  
- **TOTAL : 15 minutes**

---

## 🎯 ÉTAPE 1 : DÉPLOYER LE BACKEND SUR RAILWAY

### 1.1 Créer un nouveau projet Railway

```bash
# Option A : Via Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up

# Option B : Via GitHub
# 1. Push le dossier backend sur GitHub
# 2. Sur Railway.app → New Project → Deploy from GitHub
```

### 1.2 Ajouter PostgreSQL

Sur Railway :
1. Click "New" → "Database" → "PostgreSQL"
2. Railway créera automatiquement la variable `DATABASE_URL`

### 1.3 Configurer les variables

Dans Railway, onglet "Variables" :
```
JWT_SECRET=votre-secret-super-securise-changez-moi-en-prod
NODE_ENV=production
FRONTEND_URL=https://votre-app.vercel.app
```

### 1.4 Créer l'admin initial

```bash
# Via Railway CLI
railway run npm run seed

# OU via Railway Dashboard
# Service → Deploy → Command: npm run seed
```

**✅ Credentials admin créés :**
- Email : `admin@expertise-auto.com`
- Password : `admin123`

**🔗 URL Backend :** `https://votre-backend.up.railway.app`

---

## 🎯 ÉTAPE 2 : DÉPLOYER LE FRONTEND SUR VERCEL

### 2.1 Préparer le frontend

```bash
cd frontend

# Créer .env
cat > .env << ENVFILE
VITE_API_URL=https://votre-backend.up.railway.app/api
ENVFILE
```

### 2.2 Déployer sur Vercel

```bash
# Option A : Via Vercel CLI
npm install -g vercel
vercel

# Option B : Via GitHub
# 1. Push le dossier frontend sur GitHub
# 2. Sur vercel.com → New Project → Import from GitHub
```

### 2.3 Configurer les variables

Sur Vercel, Project Settings → Environment Variables :
```
VITE_API_URL=https://votre-backend.up.railway.app/api
```

**🔗 URL Frontend :** `https://votre-app.vercel.app`

---

## ✅ ÉTAPE 3 : TESTER

1. Ouvrir `https://votre-app.vercel.app`
2. Se connecter avec :
   - Email : `admin@expertise-auto.com`
   - Password : `admin123`
3. ✅ Vous devriez voir le dashboard !

---

## 🛠️ DÉVELOPPEMENT LOCAL

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec votre DATABASE_URL local
npm run dev
# → http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Éditer .env avec VITE_API_URL=http://localhost:3000/api
npm run dev
# → http://localhost:5173
```

---

## 📋 STRUCTURE DU PROJET

```
expertise-auto-v2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.ts
│   │   └── seed.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── INSTALLATION_COMPLETE.md (ce fichier)
```

---

## 🔐 SÉCURITÉ

**⚠️ IMPORTANT :**

1. **Changez JWT_SECRET** en production
2. **Changez le mot de passe admin** après première connexion
3. **Activez HTTPS** (Railway et Vercel le font automatiquement)

---

## 🆘 DÉPANNAGE

### Backend ne démarre pas

```bash
railway logs
# Vérifiez les erreurs
```

### Frontend ne se connecte pas

1. Vérifiez `VITE_API_URL` dans Vercel
2. Vérifiez `FRONTEND_URL` dans Railway (CORS)
3. Ouvrez la console browser (F12) pour voir les erreurs

### Database connection error

1. Vérifiez que PostgreSQL est bien ajouté sur Railway
2. Vérifiez la variable `DATABASE_URL`

---

## 📞 SUPPORT

- Consultez les logs Railway
- Consultez les logs Vercel
- Vérifiez la console navigateur (F12)

---

## 🎊 PROCHAINES ÉTAPES

Une fois le projet déployé et fonctionnel :

1. ✅ Connexion fonctionne
2. ➡️ Ajout module Bureaux
3. ➡️ Ajout module Rapports
4. ➡️ Ajout calculs (MO, vétusté, etc.)
5. ➡️ Interface complète selon cahier des charges

---

**TOUT EST PRÊT ! BON DÉPLOIEMENT ! 🚀**
