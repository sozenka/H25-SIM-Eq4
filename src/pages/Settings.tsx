
const Settings = () => (
    <div className="settings-container">
      <h2 className="settings-title">Paramètres</h2>
      <div className="settings-grid">
        {/* Personalization Section */}
        <section className="section">
          <h3 className="section-title">Thème</h3>
          <div className="option-group">
            <div className="button-group" id="theme">
              <button className="theme-button">Clair</button>
              <button className="theme-button">Sombre</button>
            </div>
          </div>
        </section>
  
        {/* AI Configuration Section */}
        <section className="section">
          <h3 className="section-title">Configuration de l'intelligence artificielle</h3>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
        </section>
      </div>
    </div>
  )
  
  export default Settings;