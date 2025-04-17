2. Installer les dépendances
bash
Copy
Edit
npm install
3. Lancer le frontend (serveur Vite)
bash
Copy
Edit
npm run dev
Accessible sur :

arduino
Copy
Edit
http://localhost:5173
4. Lancer le backend (serveur Express en TypeScript)
bash
Copy
Edit
npx ts-node server.ts
Accessible sur :

arduino
Copy
Edit
http://localhost:5000
Le proxy /api est déjà configuré dans vite.config.ts pour rediriger automatiquement les requêtes vers le backend.

🌐 Points de terminaison (API)

Méthode	Endpoint	Description
POST	/api/auth/signup	Créer un compte
POST	/api/auth/login	Se connecter et obtenir un JWT
Toutes les routes acceptent des données JSON (application/json).