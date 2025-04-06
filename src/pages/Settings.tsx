
import { useState } from "react";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    // Handle save logic here (e.g., send to API)
    alert("Paramètres enregistrés !");
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Paramètres du compte</h2>
      <div className="settings-grid">
        <section className="section">
          <h3 className="bg-white hover: bg-gray-300 text black font-bold ">Nom d'utilisateur</h3>
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

        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-full text-lg transition-colors" onClick={handleSave}>
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default Settings;