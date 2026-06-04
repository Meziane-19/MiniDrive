# 🚗 Projet : MiniDrive

### 🏛️ Le Cadre Académique

Ce projet a été conçu et développé dans le cadre du module **Développement d'Applications Web**.

* **Institution :** Université Mouloud Mammeri de Tizi Ouzou (UMMTO)
* **Année universitaire :** 2025 / 2026
* **Enseignante :** Madame Bousnina

---

### 🤔 Pourquoi MiniDrive ?

**MiniDrive** est une boutique/vitrine e-commerce premium dédiée aux voitures miniatures de
collection. L'objectif : concevoir une application web moderne, fluide et interactive
en technologies natives (HTML/CSS/JS), couplée à un **back-end PHP + base de données MySQL**
pour la persistance des données.

---

### ✨ Fonctionnalités Principales

* **Vitrine interactive :** catalogue de 50 modèles avec photos, filtres et tri.
* **Panier dynamique (JavaScript) :** ajout, quantités, suppression en temps réel, sans rechargement.
* **Système de filtrage :** par marque, échelle, type et prix.
* **Commandes enregistrées en base :** chaque commande validée est stockée dans MySQL.
* **Avis clients en base :** les avis postés sont enregistrés dans MySQL et affichés.
* **E-mail de confirmation :** un e-mail récapitulatif est envoyé au client via EmailJS.

---

### 🛠️ Technologies Utilisées

| Couche | Technologie |
|---|---|
| **Front-end** | HTML5, CSS3 (Flexbox, Grid, variables), Vanilla JavaScript (ES6+) |
| **Back-end** | PHP 8 (API REST simple, PDO) |
| **Base de données** | MySQL 8 |
| **E-mail** | EmailJS (envoi côté client) |

---

### 📐 Architecture du Projet

```text
MiniDrive/
├── index.html          # Page d'accueil
├── catalogue.html      # Catalogue + filtres
├── admin.html          # Tableau de bord (commandes + avis)
├── avis.html           # Avis clients + formulaire
├── app.js              # Logique : catalogue (en dur), panier, appels API
├── style.css           # Charte graphique, animations, responsive
├── vodm.mp4            # Vidéo de la page d'accueil
├── database.sql        # Script de création de la base MySQL
├── images/             # Photos des modèles réduits
└── api/                # Back-end PHP
    ├── config.php      # Connexion MySQL (PDO)
    ├── commandes.php   # Enregistrer / lister les commandes
    └── avis.php        # Enregistrer / lister les avis
```

> **À noter :** les 50 voitures du catalogue sont définies **directement dans `app.js`**
> (elles s'affichent donc toujours). Seules les **commandes** et les **avis** passent par
> MySQL via l'API PHP.

---

## ▶️ Comment lancer le projet

> 🆕 **Installation sur un nouvel ordinateur (depuis zéro) ?**
> Suivez le guide détaillé : **[INSTALLATION.md](INSTALLATION.md)** (logiciels à installer, base de données, configuration…).
> La section ci-dessous est un rappel rapide pour une machine déjà configurée.

Le site utilise PHP : il ne suffit **pas** d'ouvrir `index.html` en double-cliquant
(et **pas** non plus via Live Server). Il faut un serveur PHP qui exécute l'API.

### Pré-requis

1. **MySQL** installé et démarré (le projet a été testé avec MySQL Server 8.0).
2. **PHP 8** (version *Thread Safe*). Dans ce projet, PHP est situé dans :
   `C:\Users\icomb\Downloads\php-8.5.7-Win32-vs17-x64\`

### Étape 1 — Créer la base de données (à faire une seule fois)

Exécute le script `database.sql` dans MySQL. En ligne de commande :

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database.sql
```

(ou via MySQL Workbench : ouvrir `database.sql` puis l'exécuter ⚡)

Cela crée la base **`minidrive`** avec les tables `commandes`, `avis` et `voitures`.

### Étape 2 — Vérifier la configuration

Ouvre `api/config.php` et vérifie que les identifiants MySQL correspondent aux tiens :

```php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'minidrive';
$DB_USER = 'root';
$DB_PASS = '...';   // ton mot de passe MySQL
```

### Étape 3 — Démarrer le serveur PHP

Dans un terminal (PowerShell), lance :

```powershell
& "C:\Users\icomb\Downloads\php-8.5.7-Win32-vs17-x64\php.exe" -S localhost:8000 -t "c:\Users\icomb\OneDrive\Bureau\kebli\MiniDrive"
```

Laisse ce terminal **ouvert**. Tu dois voir :
`... Development Server (http://localhost:8000) started`

### Étape 4 — Ouvrir le site

Dans le navigateur :

```
http://localhost:8000/index.html
```

---

## ⚠️ Erreurs fréquentes

| Symptôme | Cause | Solution |
|---|---|---|
| Les commandes n'arrivent pas dans MySQL | Site ouvert via Live Server (`:5500`) ou `file://` | Ouvrir via **`http://localhost:8000`** |
| Page d'API affiche du `<?php ...` | Le PHP n'est pas exécuté (mauvais serveur) | Utiliser le serveur PHP (Étape 3) |
| « Connexion MySQL échouée » | Mauvais mot de passe / MySQL éteint | Vérifier `api/config.php` et démarrer MySQL |
| Les voitures ne s'affichent pas | Cache du navigateur | Recharger avec **Ctrl + Shift + R** |

---

## 🔌 Détail de l'API

| Méthode | URL | Rôle |
|---|---|---|
| `GET`  | `/api/commandes.php` | Liste toutes les commandes |
| `POST` | `/api/commandes.php` | Enregistre une commande (JSON) |
| `GET`  | `/api/avis.php` | Liste tous les avis |
| `POST` | `/api/avis.php` | Enregistre un avis (JSON) |

---

### 📱 Expérience Responsive

Pensé en *Mobile-First* : grilles adaptatives (4 colonnes → 1 colonne), menu mobile épuré,
zones de clic dimensionnées pour le tactile.