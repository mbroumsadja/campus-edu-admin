# campus-edu — Frontend Next.js

Interface web de la plateforme universitaire.  
Connectée à l'API `campus-edu-api` (Node.js / Express / Sequelize).

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# → NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 3. Lancer le serveur de dev
npm run dev   # → http://localhost:3001
```

> Le backend doit tourner sur le port 3000. Lancer `npm run db:seed` côté backend d'abord.

---

## Comptes de test

| Rôle        | Matricule  | Mot de passe |
|-------------|------------|--------------|
| Admin       | ADM-0001   | Admin@1234   |
| Enseignant  | ENS-0001   | Ens@1234     |
| Étudiant    | 22FS0001    | 22FS0001      |

---

## Pages

| Route                   | Accès              | Description                        |
|-------------------------|--------------------|------------------------------------|
| `/auth/login`           | Public             | Connexion par matricule            |
| `/dashboard`            | Tous               | Tableau de bord personnalisé       |
| `/cours`                | Tous               | Liste des cours avec filtres       |
| `/sujets`               | Tous               | Anciens sujets + corrigés          |
| `/profil`               | Tous               | Profil + changement de mot de passe|
| `/admin/users`          | Admin              | Gestion des comptes                |
| `/admin/filieres`       | Admin              | Gestion filières & UEs             |

---

## Architecture

```
src/
├── app/                        ← Pages Next.js (App Router)
│   ├── auth/login/             ← Connexion
│   ├── dashboard/              ← Tableau de bord
│   ├── cours/                  ← Liste des cours
│   ├── sujets/                 ← Anciens sujets
│   ├── profil/                 ← Profil utilisateur
│   └── admin/
│       ├── users/              ← Gestion utilisateurs
│       └── filieres/           ← Gestion filières & UEs
│
├── components/
│   ├── layout/
│   │   └── AppShell.tsx        ← Sidebar + topbar responsive
│   ├── modals/
│   │   ├── Modal.tsx           ← Composant modal générique
│   │   ├── UploadCoursModal.tsx
│   │   ├── UploadSujetModal.tsx
│   │   └── CreateUserModal.tsx
│   ├── shared/
│   │   └── FormField.tsx       ← Input, Select, Textarea, FileInput
│   └── ui/
│       └── index.tsx           ← Card, Badge, Skeleton, Pagination...
│
├── hooks/
│   └── useQuery.ts             ← useQuery + usePaginatedQuery
│
├── lib/
│   ├── api.ts                  ← Axios + intercepteurs JWT + refresh
│   └── auth-context.tsx        ← Contexte auth global (useAuth)
│
├── middleware.ts               ← Guard de routes (Next.js Edge)
├── types/index.ts              ← Types TypeScript centralisés
└── styles/globals.css          ← Design tokens + Tailwind
```

---

## Fonctionnalités

### Sécurité
- **Middleware** (`middleware.ts`) : protection de toutes les routes, redirection vers `/auth/login` si non connecté
- **Refresh automatique** : le token JWT expire après 4h, renouvellement transparent via intercepteur Axios
- **Rôles** : Admin → toutes les pages, Enseignant → dépôt de contenu, Étudiant → consultation

### UX
- Sidebar responsive (collapsible sur mobile)
- Skeletons de chargement sur toutes les listes
- Pagination côté serveur
- Filtres avec reset
- Téléchargement direct des cours/sujets
- Indicateur de force du mot de passe

### Extensibilité
Pour ajouter une nouvelle page :
1. Créer `src/app/ma-page/page.tsx`
2. Ajouter le lien dans `NAV_ITEMS` dans `AppShell.tsx`
3. Ajouter la route dans `ADMIN_ROUTES` ou `TEACHER_ROUTES` dans `middleware.ts` si nécessaire
4. Créer le service dans `src/lib/api.ts`

---

## Stack technique

| Technologie       | Rôle                          |
|-------------------|-------------------------------|
| Next.js 14        | Framework React (App Router)  |
| TypeScript        | Typage statique               |
| Tailwind CSS      | Styles utilitaires            |
| Axios             | Client HTTP + intercepteurs   |
| js-cookie         | Gestion des tokens JWT        |
| lucide-react      | Icônes                        |
| Sora + IBM Plex   | Typographie                   |
