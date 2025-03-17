import React from 'react'

const Settings = () => (
    <div className="settings-container">
      <h2 className="settings-title">Paramètres</h2>
      <div className="settings-grid">
        {/* Personalization Section */}
        <section className="section">
          <h3 className="section-title">Personnalisation</h3>
          <div className="option-group">
            <label className="option-label" htmlFor="theme">Thème</label>
            <div className="button-group" id="theme">
              <button className="theme-button">Mode Clair</button>
              <button className="theme-button">Mode Sombre</button>
            </div>
          </div>
        </section>
  
        {/* AI Configuration Section */}
        <section className="section">
          <h3 className="section-title">Configuration de l'intelligence artificielle</h3>
          <div className="option-group">
            <label className="toggle-label" htmlFor="ai-toggle">Activer l'IA</label>
            <input type="checkbox" id="ai-toggle" className="toggle-input" defaultChecked />
          </div>
        </section>
      </div>
    </div>
  )
  
  export default Settings;