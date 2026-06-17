# BankaApp 🏦

Application mobile de simulation bancaire — TP React Native / Expo  
Université Abdelmalek Essaâdi, Tanger · Prof. Zili · Cycle Ingénieur 2025-2026

---

## 📋 Description

BankaApp permet à un utilisateur de :
- Consulter **3 comptes bancaires** avec leurs soldes
- Effectuer des **débits** et **crédits** sur chaque compte
- Réaliser des **virements** entre comptes
- Consulter l'**historique** de toutes les opérations

Toutes les données sont gérées **en mémoire** (pas de backend).

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js ≥ 18
- Application **Expo Go** sur votre smartphone (iOS ou Android)
- Compte sur [expo.dev](https://expo.dev/)

### Étapes

```bash
# 1. Cloner / télécharger le projet
cd banka-app

# 2. Installer les dépendances
npm install --legacy-peer-deps

# 3. Lancer le serveur de développement
npx expo start
```

Scannez le **QR code** affiché dans le terminal avec Expo Go.

---

## 🗂️ Structure du projet

```
banka-app/
├── App.js                          ← Point d'entrée + navigation + état global
├── src/
│   ├── data/
│   │   └── accounts.js             ← Données initiales des 3 comptes
│   ├── screens/
│   │   ├── DashboardScreen.js      ← Liste des comptes + solde total
│   │   ├── AccountDetailScreen.js  ← Détail d'un compte + débit/crédit
│   │   ├── TransferScreen.js       ← Formulaire de virement (Tâche 2)
│   │   └── HistoryScreen.js        ← Historique trié chronologiquement
│   ├── components/
│   │   ├── AccountCard.js          ← Carte de compte réutilisable
│   │   └── TransactionItem.js      ← Ligne d'historique réutilisable
│   └── theme/
│       └── colors.js               ← Constantes de couleurs
└── assets/
```

---

## ✅ Tâches réalisées

### Tâche 1 — Correction du bug `handleDebit` ✔️
**Problème :** Le code original utilisait `.filter(Boolean)` après avoir retourné `null` en cas de solde insuffisant, ce qui **supprimait le compte** de la liste.

**Correction dans `App.js` :**
```js
// AVANT (bugué)
if (acc.balance < amount) return null;
// ...
.filter(Boolean) // ← supprimait le compte !

// APRÈS (corrigé)
if (acc.balance < amount) {
  operationSuccess = false;
  return acc; // ← compte conservé inchangé
}
// Pas de .filter(Boolean)
```
La fonction retourne maintenant un booléen (`true`/`false`) que l'écran utilise pour afficher un message d'erreur.

---

### Tâche 2 — `TransferScreen` ✔️
- Compte source **pré-sélectionné** via `route.params.fromAccountId`
- Sélection du compte destinataire par **boutons radio** (tous les autres comptes)
- Saisie du montant via `TextInput` (clavier numérique)
- **Rejet automatique** si solde insuffisant
- **2 transactions** créées en cas de succès :
  - `virement_sortant` sur le compte source
  - `virement_entrant` sur le compte destinataire
- `handleTransfer` implémenté dans `App.js`

---

### Tâche 3 — Améliorations UX ✔️
- **Indicateur visuel** si solde < 1 000 MAD :
  - Badge ⚠️ sur la `AccountCard`
  - Bandeau orange dans `AccountDetailScreen`
  - Message "Solde faible" affiché
- **Bouton "Débit" désactivé** si solde = 0 MAD
- **Messages de confirmation différents** :
  - Débit : style `destructive`, message explicite sur le retrait
  - Crédit : style `default`, message positif sur l'ajout

---

### Tâche 4 — Tri chronologique réel ✔️
La fonction `parseDate()` dans `HistoryScreen.js` parse les dates `DD/MM/YYYY` en timestamps :
```js
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
}

// Tri décroissant (plus récent en premier)
.sort((a, b) => parseDate(b.date) - parseDate(a.date))
```

---

### Tâche 5 (Bonus) — Réinitialisation ✔️
Bouton **"🔄 Réinitialiser la session"** dans `DashboardScreen` :
- Confirmation via `Alert.alert` avant exécution
- Remet tous les comptes à `initialAccounts` (deep copy via `JSON.parse/stringify`)

---

## ❓ Réponses aux Questions de Réflexion

### 1. Props drilling
Passer `accounts`, `onDebit`, `onCredit`, `onTransfer` de `App.js` jusqu'à `AccountDetailScreen` via `AccountsStack` crée du **props drilling** : chaque composant intermédiaire reçoit des props qu'il ne consomme pas lui-même mais transmet vers le bas. Cela rend le code verbeux, difficile à maintenir et fragile (ajouter un niveau = modifier tous les niveaux). La solution standard est **React Context** (`createContext` + `useContext`) ou un gestionnaire d'état global comme **Redux** ou **Zustand**, qui permettent à n'importe quel composant d'accéder à l'état sans le faire transiter par tous les parents.

### 2. État dans `App.js`
Le `useState(accounts)` est dans `App.js` parce que **plusieurs écrans partagent la même donnée** : `DashboardScreen` affiche les soldes, `AccountDetailScreen` les modifie, `HistoryScreen` agrège toutes les transactions. Si l'état était dans `DashboardScreen`, les autres écrans n'y auraient pas accès. En le remontant au plus haut niveau commun (App.js), on garantit que tous les enfants voient toujours la version à jour des comptes — c'est le principe de **"lifting state up"** de React.

### 3. Récupération du compte par `find` plutôt que via `params`
Passer l'objet `account` complet dans les `params` de navigation serait une **copie figée** au moment du `navigate()`. Si une opération modifie le solde depuis `App.js`, la copie dans les params ne serait pas mise à jour — l'écran afficherait un solde obsolète. En utilisant `accounts.find(a => a.id === accountId)`, on puise toujours dans la prop `accounts` qui reflète l'état courant du `useState` de `App.js`, garantissant ainsi la **réactivité** de l'interface.

### 4. `KeyboardAvoidingView`
Ce composant résout un problème typique du mobile : lorsque le clavier virtuel s'ouvre, il peut masquer les `TextInput` ou le bouton "Valider" situés en bas de l'écran. `KeyboardAvoidingView` compense automatiquement en ajustant la hauteur ou le padding du contenu (`behavior="padding"` sur iOS, `behavior="height"` sur Android, car les deux systèmes gèrent le clavier différemment via `Platform.OS`). Sans lui, l'utilisateur ne peut pas voir ni taper dans les champs recouverts par le clavier.

---

## 📱 Captures d'écran

*(À ajouter après test sur Expo Go)*

---

## 👤 Auteur

TP réalisé par : **[Votre Nom]**  
Module : React Native / Expo  
Université Abdelmalek Essaâdi — Tanger
