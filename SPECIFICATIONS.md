# Money Saver - Spécifications & Vision Produit

Ce document récapitule les choix d'architecture, les spécifications fonctionnelles et la feuille de route validés avec l'utilisateur.

---

## 🎯 1. Philosophie & Design
- **Esthétique** : Minimalisme strict, mode clair uniquement (palette monochrome blanc cassé/noir chaud, typographie soignée, zéro surcharge, micro-accents pastels très discrets).
- **Plateformes cibles** : Android et iOS (100% multiplateforme React Native / Expo).
- **Stockage** : 100% local sur l'appareil (via SQLite natif, aucune dépendance externe obligatoire).
- **Sensations** : Retours haptiques subtils au toucher (`expo-haptics`).

---

## 🧾 2. Scanner de Tickets de Caisse
- **Traitement** : Traitement local / hors-ligne privilégié.
- **Workflow de validation** :
  1. Prise de vue / sélection de photo de reçu.
  2. Analyse et extraction des articles individuels (désignation + montant).
  3. **Prévisualisation interactive** :
     - Liste des articles détectés avec **cases à cocher** (toutes cochées par défaut).
     - Possibilité de **décocher un article** pour ne pas l'imputer aux dépenses.
     - Bouton **crayon discret** pour corriger manuellement un libellé ou un montant erroné.
     - Validation finale et insertion instantanée dans la base locale.

---

## 🔁 3. Transactions Récurrentes & Flux Prévisionnel
- Possibilité d'activer l'option **"Paiement récurrent"** sur une dépense ou un revenu (ex: loyer, salaire, abonnements Netflix/Spotify).
- **Visualisation prévisionnelle** : calendrier / aperçu des prochains paiements prévus dans le mois pour anticiper le solde restant.

---

## 📊 4. Budgets & Plafonds
- Plafonds par catégorie **optionnels** (désactivés par défaut, activables selon le souhait de l'utilisateur).
- Jauges de suivi fines et élégantes.

---

## 🔒 5. Sécurité, Sauvegarde & Évolution Future
- **Code PIN / Biométrie** : Pas pour le moment.
- **Export de données (CSV/PDF)** : À proposer dans une phase ultérieure.
- **Sauvegarde / Restauration** : Prévu pour plus tard.
- **Devise** : Euro (€) unique.

---

## 🚀 6. Répertoire GitHub
- Dépôt officiel : `https://github.com/Smith9411/money-saver.git` (Branche `main`).
