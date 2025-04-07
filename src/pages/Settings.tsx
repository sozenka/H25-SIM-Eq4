
import { useState } from "react";

const Settings = () => {
  const currentUsername = "Jeremy Chheang"; 
  const currentPassword = "2243711";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
  
    alert("Paramètres enregistrés !");
  };

  return (
    <div className="settings-container">

        <div className="mb-6 text-2xl font-semibold text-gray-700">
         <span className="text-white">{currentUsername}</span>
      </div>

      <h2 className="settings-title">Paramètres du compte</h2>

      <div className="settings-grid">
        <section className="section">
          <h3 className="section-title">Nom d'utilisateur</h3>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nouveau nom d'utilisateur"
          />
        </section>

        <section className="section">
          <h3 className="section-title">Changer le mot de passe</h3>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
          />
          <input
            type="password"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
          />
        </section>

        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full text-lg transition-colors" onClick={handleSave}>
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default Settings;