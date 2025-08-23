# 🏁 Course de Followers

Projet qui permet de suivre en direct l’évolution des abonnés sur **Instagram** (et autres plateformes possibles), et de créer une **vidéo animée** qui montre la course entre plusieurs comptes.

---

## 🚀 Principe
- Ajouter un.  
- Récupération automatique du **nombre d’abonnés** via API ou scrap.  
- Stockage en base de données pour suivre l’évolution.  
- Génération d’une **animation/vidéo** qui illustre la course des followers comme une compétition.

---

## 🔧 Technologies utilisées
- **Next.js** → interface web et API.  
- **MysqlL** → base de données (comptes & historique).  
- **Tailwind CSS** → design rapide et moderne.  
- **MatterJs** → Moteur Physique.  
- **ffmpeg** → génération de la vidéo finale.  

---

## 🖼️ Exemple
 

https://github.com/user-attachments/assets/9c89c75b-ae97-402e-8249-84b2d5ac3045



---

## ⚙️ Installation
```bash
npm i
npm dev
```

## 🔐 Variables d’environnement
créer un .env
```bash
IG_EMAIL='';
IG_PASSWORD='';
```

## 📦 Déploiement

- Vps
- Cron job pour mettre à jour régulièrement les followers et generer une course.



