# 📚 API Backend - La Bibliothèque des Rois (LBR Academy)

Backend Next.js avec Prisma ORM et PostgreSQL.

## 🌐 Base URL
```
http://localhost:3000/api
```

## 🔐 Authentification

Les endpoints protégés nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

## 📝 Format de réponse standard

### ✅ Succès
```json
{
  "success": true,
  "message": "Message de succès (optionnel)",
  "data": { ... }
}
```

### ❌ Erreur
```json
{
  "success": false,
  "message": "Message d'erreur",
  "timestamp": "2024-01-22T12:00:00.000Z"
}
```

### 📄 Pagination
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

## 🔒 Codes HTTP
| Code | Description |
|------|-------------|
| 200  | Requête réussie |
| 201  | Ressource créée |
| 400  | Données invalides |
| 401  | Non authentifié |
| 403  | Accès refusé |
| 404  | Ressource introuvable |
| 409  | Conflit (doublon) |
| 500  | Erreur serveur |

## 🎭 Rôles disponibles
- `APPRENANT` — Utilisateur standard (par défaut)
- `CREATEUR` — Créateur de contenu
- `ENTREPRENEUR` — Entrepreneur
- `HYBRIDE` — Créateur + Entrepreneur
- `COACH` — Coach certifié
- `ADMIN` — Administrateur

## 📦 Types de contenu
`BOOK`, `ARTICLE`, `FORMATION`, `SERIES`, `AUDIO`, `VIDEO`

---

## 1. 🔑 Authentification

### Créer un compte
```
POST /api/auth/register
```
**Payload :**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```
**Réponse (201) :**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "APPRENANT",
      "fullName": "John Doe"
    }
  }
}
```

### Se connecter
```
POST /api/auth/login
```
**Payload :**
```json
{
  "emailOrUsername": "john@example.com",
  "password": "SecurePass123!"
}
```
**Réponse (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "APPRENANT",
      "fullName": "John Doe",
      "profilePicture": null
    }
  }
}
```

### Rafraîchir le token
```
POST /api/auth/refresh-token
```
**Header :** `Authorization: Bearer <refresh_token>`

**Réponse :**
```json
{
  "success": true,
  "message": "Token rafraîchi",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Profil actuel
```
GET /api/auth/me
🔒 Auth requise
```

### Vérifier le token
```
GET /api/auth/verify-token
🔒 Auth requise
```

### Vérifier l'email
```
GET /api/auth/verify-email?token=verification_token
```

### Mot de passe oublié
```
POST /api/auth/password/forgot
```
**Payload :**
```json
{ "email": "john@example.com" }
```

### Réinitialiser le mot de passe
```
POST /api/auth/password/reset
```
**Payload :**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

### Changer le mot de passe
```
POST /api/auth/password/change
🔒 Auth requise
```
**Payload :**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

## 2. 👤 Utilisateurs

### Mon profil
```
GET /api/users/profile
🔒 Auth requise
```

### Modifier mon profil
```
PUT /api/users/profile
🔒 Auth requise
```
**Payload :**
```json
{
  "fullName": "John Doe",
  "bio": "Développeur passionné",
  "website": "https://johndoe.com",
  "location": "Paris, France"
}
```

### Photo de profil
```
POST /api/users/profile/picture
🔒 Auth requise
Content-Type: multipart/form-data
```
**Form Data :** `file` (fichier image)

### Profil public
```
GET /api/users/{userId}/public
```

### Rechercher des utilisateurs
```
GET /api/users/search?query=john&page=0&size=20
```

### Liste des créateurs
```
GET /api/users/creators?page=0&size=20&sortBy=createdAt&sortDir=desc
```

### Paramètres utilisateur
```
GET /api/users/settings
🔒 Auth requise
```

### Modifier les notifications
```
PUT /api/users/settings/notifications
🔒 Auth requise
```
**Payload :**
```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "newContentNotifications": true,
  "commentNotifications": true,
  "followNotifications": false
}
```

### Modifier la confidentialité
```
PUT /api/users/settings/privacy
🔒 Auth requise
```
**Payload :**
```json
{
  "profileVisibility": "PRIVATE",
  "showEmail": false,
  "showPurchases": false
}
```

---

## 3. 📚 Contenus

### Lister / Rechercher les contenus
```
GET /api/contents?query=java&type=BOOK&categoryId=1&isFree=false&page=0&size=20&sortBy=date&sortDir=desc
```
**Paramètres query :**
| Param | Description | Valeurs |
|-------|-------------|---------|
| `query` | Recherche textuelle | string |
| `type` | Type de contenu | BOOK, ARTICLE, FORMATION, SERIES, AUDIO, VIDEO |
| `categoryId` | ID catégorie | number |
| `isFree` | Gratuit ou non | true/false |
| `page` | Page (0-indexed) | number |
| `size` | Taille de page | number (défaut: 20) |
| `sortBy` | Tri par | date, views, rating, price |
| `sortDir` | Direction | asc, desc |

**Réponse :**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Apprendre Java",
        "slug": "apprendre-java",
        "description": "Formation complète Java",
        "type": "FORMATION",
        "price": 49.99,
        "isFree": false,
        "coverImage": "...",
        "author": { "id": 2, "username": "prof_java", "fullName": "Marie Dupont" },
        "category": { "id": 1, "name": "Programmation", "slug": "programmation" },
        "rating": 4.5,
        "viewCount": 1500,
        "publishedAt": "2024-01-10T14:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

### Détails d'un contenu
```
GET /api/contents/{id}
```

### Contenu par slug
```
GET /api/contents/slug/{slug}
```

### Contenus en vedette
```
GET /api/contents/featured?limit=10
```

### Contenus populaires
```
GET /api/contents/popular?limit=10
```

### Meilleures ventes
```
GET /api/contents/bestsellers?limit=10
```

### Derniers contenus
```
GET /api/contents/latest?limit=10
```

### Mieux notés
```
GET /api/contents/top-rated?limit=10
```

### Contenus par catégorie
```
GET /api/contents/category/{categoryId}?page=0&size=20
```

### Contenus d'un auteur
```
GET /api/contents/author/{authorId}?page=0&size=20
```

### Créer un contenu
```
POST /api/contents
🔒 Rôles : CREATEUR, ENTREPRENEUR, HYBRIDE, COACH, ADMIN
```
**Payload :**
```json
{
  "title": "Maîtriser Spring Boot",
  "description": "Formation complète sur Spring Boot 3",
  "summary": "Résumé du contenu",
  "type": "FORMATION",
  "categoryId": 1,
  "price": 79.99,
  "isFree": false,
  "currency": "XAF",
  "language": "fr",
  "pageCount": 250,
  "duration": 3600,
  "tags": ["java", "spring", "backend"]
}
```

### Modifier un contenu
```
PUT /api/contents/{id}
🔒 Auteur ou ADMIN
```
Même payload que la création (champs partiels acceptés).

### Supprimer un contenu
```
DELETE /api/contents/{id}
🔒 Auteur ou ADMIN
```

### Mes contenus
```
GET /api/contents/my?status=DRAFT&page=0&size=20
🔒 Auth requise
```
**Status possibles :** `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`

### Image de couverture
```
POST /api/contents/{id}/cover
🔒 Auteur ou ADMIN
Content-Type: multipart/form-data
```
**Form Data :** `file` (fichier image)

### Fichier du contenu
```
POST /api/contents/{id}/file
🔒 Auteur ou ADMIN
Content-Type: multipart/form-data
```
**Form Data :** `file` (PDF, EPUB, MP3, MP4, etc.)

```
GET /api/contents/{id}/file
🔒 Auth requise (achat ou gratuit requis)
```

### Soumettre pour validation
```
POST /api/contents/{id}/submit
🔒 Auteur
```

### Noter un contenu
```
POST /api/contents/{id}/rate
🔒 Auth requise
```
**Payload :**
```json
{ "rating": 4.5 }
```

### Acheter un contenu
```
POST /api/contents/{id}/purchase
🔒 Auth requise
```

---

## 4. 📂 Catégories

### Lister les catégories
```
GET /api/categories
```
**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Programmation",
      "slug": "programmation",
      "description": "Cours de programmation",
      "icon": "💻",
      "active": true
    }
  ]
}
```

### Arbre des catégories
```
GET /api/categories/tree
```

### Détails d'une catégorie
```
GET /api/categories/{id}
```

### Catégorie par slug
```
GET /api/categories/slug/{slug}
```

### Créer une catégorie
```
POST /api/categories
🔒 ADMIN
```
**Payload :**
```json
{
  "name": "Intelligence Artificielle",
  "description": "Cours sur l'IA et le ML",
  "icon": "🤖",
  "parentId": null
}
```

### Modifier une catégorie
```
PUT /api/categories/{id}
🔒 ADMIN
```

### Activer/Désactiver
```
PATCH /api/categories/{id}/toggle?active=true
🔒 ADMIN
```

### Supprimer une catégorie
```
DELETE /api/categories/{id}
🔒 ADMIN
```

---

## 5. 💬 Commentaires

### Commentaires d'un contenu
```
GET /api/comments/content/{contentId}?page=0&size=20
```
**Réponse :** Paginée avec les réponses imbriquées.

### Ajouter un commentaire
```
POST /api/comments/content/{contentId}
🔒 Auth requise
```
**Payload :**
```json
{
  "text": "Super contenu !",
  "parentId": null
}
```
`parentId` permet de répondre à un commentaire existant.

### Modifier un commentaire
```
PUT /api/comments/{commentId}
🔒 Auteur du commentaire
```
**Payload :**
```json
{ "text": "Commentaire modifié" }
```

### Supprimer un commentaire
```
DELETE /api/comments/{commentId}
🔒 Auteur ou ADMIN
```

### Liker / Unliker un commentaire
```
POST /api/comments/{commentId}/like    ← Liker
DELETE /api/comments/{commentId}/like   ← Retirer le like
🔒 Auth requise
```

### Masquer un commentaire
```
PATCH /api/comments/{commentId}/hide
🔒 ADMIN
```

### Afficher un commentaire masqué
```
PATCH /api/comments/{commentId}/show
🔒 ADMIN
```

### Commentaires masqués
```
GET /api/comments/hidden?page=0&size=20
🔒 ADMIN
```

---

## 6. ⭐ Favoris

### Ajouter aux favoris
```
POST /api/favorites/{contentId}?collection=Ma liste
🔒 Auth requise
```

### Retirer des favoris
```
DELETE /api/favorites/{contentId}
🔒 Auth requise
```

### Vérifier si en favori
```
GET /api/favorites/check/{contentId}
🔒 Auth requise
```
**Réponse :**
```json
{ "success": true, "data": { "isFavorite": true } }
```

### Changer de collection
```
PATCH /api/favorites/{contentId}/collection?collection=À regarder plus tard
🔒 Auth requise
```

### Mes favoris
```
GET /api/favorites?page=0&size=20
🔒 Auth requise
```

### Favoris par collection
```
GET /api/favorites/collection/{collection}?page=0&size=20
🔒 Auth requise
```

### Mes collections
```
GET /api/favorites/collections
🔒 Auth requise
```
**Réponse :**
```json
{ "success": true, "data": ["Ma liste", "À regarder plus tard", "Favoris"] }
```

---

## 7. 👥 Follows (Abonnements)

### Suivre un utilisateur
```
POST /api/follows/{userId}
🔒 Auth requise
```

### Ne plus suivre
```
DELETE /api/follows/{userId}
🔒 Auth requise
```

### Vérifier si je suis
```
GET /api/follows/check/{userId}
🔒 Auth requise
```
**Réponse :**
```json
{ "success": true, "data": { "isFollowing": true, "notificationsEnabled": true } }
```

### Activer/Désactiver les notifications
```
PATCH /api/follows/{userId}/notifications?enabled=true
🔒 Auth requise
```

### Mes abonnés
```
GET /api/follows/followers?page=0&size=20
🔒 Auth requise
```

### Mes abonnements
```
GET /api/follows/following?page=0&size=20
🔒 Auth requise
```

### Abonnés d'un utilisateur
```
GET /api/follows/{userId}/followers?page=0&size=20
```

### Abonnements d'un utilisateur
```
GET /api/follows/{userId}/following?page=0&size=20
```

---

## 8. 🔔 Notifications

### Mes notifications
```
GET /api/notifications?page=0&size=20
🔒 Auth requise
```

### Notifications non lues
```
GET /api/notifications/unread?page=0&size=20
🔒 Auth requise
```

### Dernières notifications
```
GET /api/notifications/latest
🔒 Auth requise
```

### Compteur non lues
```
GET /api/notifications/count
🔒 Auth requise
```
**Réponse :**
```json
{ "success": true, "data": { "unreadCount": 5 } }
```

### Marquer comme lue
```
PATCH /api/notifications/{notificationId}/read
🔒 Auth requise
```

### Tout marquer comme lu
```
PATCH /api/notifications/read-all
🔒 Auth requise
```

### Supprimer les lues
```
DELETE /api/notifications/read
🔒 Auth requise
```

---

## 9. 💳 Achats

### Créer un achat
```
POST /api/purchases
🔒 Auth requise
```
**Payload :**
```json
{
  "contentId": 1,
  "paymentMethod": "CARD"
}
```
**Réponse (201) :**
```json
{
  "success": true,
  "message": "Achat initié",
  "data": {
    "id": 10,
    "amount": 49.99,
    "platformFee": 7.50,
    "authorEarnings": 42.49,
    "status": "PENDING",
    "createdAt": "2024-01-22T11:00:00"
  }
}
```
> La commission plateforme est de 15% (configurable via `PLATFORM_COMMISSION_RATE`).

### Confirmer l'achat
```
POST /api/purchases/{purchaseId}/complete?paymentReference=PAY_123456
🔒 Auth requise
```

### Mes achats
```
GET /api/purchases?page=0&size=20
🔒 Auth requise
```

### Vérifier si acheté
```
GET /api/purchases/check/{contentId}
🔒 Auth requise
```
**Réponse :**
```json
{ "success": true, "data": { "purchased": true } }
```

---

## 10. 📋 Abonnements (Subscriptions)

### Plans disponibles
```
GET /api/subscriptions/plans
```
**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium",
      "description": "Accès illimité",
      "price": 19.99,
      "duration": 30,
      "features": ["Accès illimité", "Téléchargements", "Support prioritaire"],
      "active": true
    }
  ]
}
```

### S'abonner
```
POST /api/subscriptions
🔒 Auth requise
```
**Payload :**
```json
{
  "planId": 1,
  "paymentMethod": "CARD"
}
```

### S'abonner (simplifié)
```
POST /api/subscriptions/{planId}
🔒 Auth requise
```

### Activer l'abonnement
```
POST /api/subscriptions/{subscriptionId}/activate
🔒 Auth requise
```

### Annuler l'abonnement
```
POST /api/subscriptions/{subscriptionId}/cancel
🔒 Auth requise
```

### Annuler l'abonnement actuel
```
POST /api/subscriptions/current/cancel
🔒 Auth requise
```

### Abonnement actuel
```
GET /api/subscriptions/current
🔒 Auth requise
```

### Historique
```
GET /api/subscriptions/history?page=0&size=20
🔒 Auth requise
```

### Vérifier l'abonnement
```
GET /api/subscriptions/check
🔒 Auth requise
```

### Créer un plan (Admin)
```
POST /api/subscriptions/plans
🔒 ADMIN
```
**Payload :**
```json
{
  "name": "Premium Plus",
  "description": "Tous les avantages Premium + coaching",
  "price": 39.99,
  "duration": 30,
  "features": ["Accès illimité", "Coaching personnalisé", "Certificats"]
}
```

### Modifier un plan (Admin)
```
PUT /api/subscriptions/plans/{planId}
🔒 ADMIN
```

### Activer/Désactiver un plan (Admin)
```
PATCH /api/subscriptions/plans/{planId}/toggle?active=true
🔒 ADMIN
```

### Supprimer un plan (Admin)
```
DELETE /api/subscriptions/plans/{planId}
🔒 ADMIN
```

---

## 11. 🎓 Demandes de rôle

### Demander un changement de rôle
```
POST /api/role-upgrades
🔒 Auth requise
```
**Payload :**
```json
{
  "requestedRole": "CREATEUR",
  "motivation": "Je souhaite partager mes connaissances",
  "experience": "5 ans d'expérience en développement",
  "portfolio": "https://monportfolio.com"
}
```
**Réponse (201) :**
```json
{
  "success": true,
  "message": "Demande soumise avec succès",
  "data": {
    "id": 3,
    "requestedRole": "CREATEUR",
    "status": "PENDING",
    "createdAt": "2024-01-22T12:00:00"
  }
}
```

### Mes demandes
```
GET /api/role-upgrades/my?page=0&size=20
🔒 Auth requise
```

### Annuler une demande
```
DELETE /api/role-upgrades/{requestId}
🔒 Auth requise
```

### Demandes en attente (Admin)
```
GET /api/role-upgrades/pending?page=0&size=20
🔒 ADMIN
```

### Toutes les demandes (Admin)
```
GET /api/role-upgrades?status=PENDING&page=0&size=20
🔒 ADMIN
```
**Status :** `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`

### Approuver (Admin)
```
POST /api/role-upgrades/{requestId}/approve?notes=Profil excellent
🔒 ADMIN
```

### Rejeter (Admin)
```
POST /api/role-upgrades/{requestId}/reject?reason=Expérience insuffisante
🔒 ADMIN
```

### Marquer en revue (Admin)
```
PATCH /api/role-upgrades/{requestId}/review
🔒 ADMIN
```

---

## 12. 🛡️ Administration

### Tableau de bord
```
GET /api/admin/dashboard
🔒 ADMIN
```
**Réponse :**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "newUsersThisMonth": 85,
    "activeCreators": 120,
    "certifiedCoaches": 15,
    "totalContents": 450,
    "publishedContents": 380,
    "pendingContents": 25,
    "newContentsThisMonth": 42,
    "totalRevenue": 125000.00,
    "revenueThisMonth": 15000.00,
    "totalPurchases": 3500,
    "activeSubscriptions": 450,
    "newSubscriptionsThisMonth": 65,
    "pendingRoleUpgrades": 12,
    "pendingContentApprovals": 25
  }
}
```

### Gestion des utilisateurs
```
GET /api/admin/users?role=CREATEUR&status=active&search=john&page=0&size=20
🔒 ADMIN
```

### Suspendre un utilisateur
```
PATCH /api/admin/users/{userId}/suspend
🔒 ADMIN
```

### Activer un utilisateur
```
PATCH /api/admin/users/{userId}/activate
🔒 ADMIN
```

### Changer le rôle
```
PATCH /api/admin/users/{userId}/role?role=CREATEUR
🔒 ADMIN
```

### Gestion des contenus
```
GET /api/admin/contents?status=PENDING_REVIEW&type=FORMATION&search=java&page=0&size=20
🔒 ADMIN
```

### Contenus en attente
```
GET /api/admin/contents/pending?page=0&size=20
🔒 ADMIN
```

### Approuver un contenu
```
POST /api/admin/contents/{contentId}/approve
🔒 ADMIN
```

### Rejeter un contenu
```
POST /api/admin/contents/{contentId}/reject
🔒 ADMIN
```
**Payload :**
```json
{ "reason": "Le contenu ne respecte pas les standards de qualité" }
```

### Mettre en avant
```
PATCH /api/admin/contents/{contentId}/feature?featured=true
🔒 ADMIN
```

### Supprimer un contenu (Admin)
```
DELETE /api/admin/contents/{contentId}
🔒 ADMIN
```

---

## 13. ⚙️ Paramètres de l'application (Admin)

### Récupérer tous les paramètres
```
GET /api/admin/settings
🔒 ADMIN
```

### Paramètres généraux
```
PUT /api/admin/settings/general
🔒 ADMIN
```
**Payload :**
```json
{
  "siteName": "LBR Academy",
  "siteDescription": "Plateforme d'apprentissage",
  "contactEmail": "contact@lbracademy.com",
  "maintenanceMode": false
}
```

### Paramètres de contenu
```
PUT /api/admin/settings/content
🔒 ADMIN
```
**Payload :**
```json
{
  "requireContentApproval": true,
  "maxFileSize": 100,
  "allowedFileTypes": ["pdf", "epub", "mp4", "mp3"]
}
```

### Paramètres de notifications
```
PUT /api/admin/settings/notifications
🔒 ADMIN
```
**Payload :**
```json
{
  "enableEmailNotifications": true,
  "enablePushNotifications": true,
  "notificationRetentionDays": 30
}
```

### Paramètres de paiement
```
PUT /api/admin/settings/payment
🔒 ADMIN
```
**Payload :**
```json
{
  "currency": "XAF",
  "platformCommission": 15.0,
  "minWithdrawal": 50.0,
  "paymentMethods": ["CARD", "PAYPAL"]
}
```

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer le `.env`
Copier `.env.example` en `.env` et renseigner les valeurs (base de données, JWT, etc.)

### 3. Initialiser la base de données
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Lancer le serveur
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

---

## 💡 Notes

- **Pagination** : `page` (0-indexed) et `size` sur tous les endpoints paginés
- **Tri** : `sortBy` et `sortDir` (asc/desc) quand disponible
- **Monnaie** : XAF par défaut (configurable)
- **Commission** : 15% sur les achats (configurable via `.env`)
- **Fichiers** : Upload via `multipart/form-data`, max 50MB
- **JWT** : Token valide 24h, refresh token valide 7 jours
