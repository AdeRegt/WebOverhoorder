class QuestionnaireSetup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:host {
          display: block;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 550px;
          margin: 20px auto;
          padding: 25px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 600;
          color: #444;
        }

        /* Styling voor het vinkje-gedeelte */
        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;
        }

        .checkbox-group input {
          margin-top: 4px;
          cursor: pointer;
        }

        .checkbox-group label {
          font-weight: normal;
          font-size: 0.95rem;
          cursor: pointer;
        }

        /* AI Waarschuwing */
        .ai-warning {
          display: flex;
          gap: 12px;
          background-color: #fff3cd;
          color: #856404;
          padding: 12px;
          border-radius: 6px;
          border-left: 5px solid #ffeeba;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .ai-warning-icon {
          font-size: 1.2rem;
        }

        /* Button & Status */
        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: background 0.2s ease;
        }

        button:hover {
          background-color: #0056b3;
        }

        button:disabled {
          background-color: #a0a0a0;
          cursor: wait;
        }

        #status-message {
          text-align: center;
          font-size: 0.9rem;
          min-height: 1.2rem;
          font-weight: 500;
        }

        .error { color: #d93025; }
        .success { color: #188038; }
        .processing { color: #5f6368; }`); // Je CSS hier
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = `

      <div class="container">
        <h2>Nieuwe Vragenlijst</h2>
        
        <div class="input-group">
          <label for="topic-input">Waarover moet de vragenlijst gaan?</label>
          <multi-keyboard 
            id="topic-input" 
            placeholder="Bijv. 100 Engelse woordjes voor 1e jaars VMBO KB studenten..."
          ></multi-keyboard>
        </div>

        <div class="checkbox-group" id="cbg">
          <input type="checkbox" id="save-data">
          <label for="save-data">
            Sla deze vragenlijst op zodat deze voor iedereen beschikbaar is in de bibliotheek.
          </label>
        </div>

        <div class="ai-warning">
          <span class="ai-warning-icon">🤖</span>
          <span>
            <strong>Belangrijke informatie:</strong> De door jou ingevoerde tekst wordt verwerkt door kunstmatige intelligentie (AI) om de vragen te genereren.
          </span>
        </div>

        <button id="submit-btn">Vragenlijst Genereren</button>
        <div id="status-message"></div>
      </div>
    `;

    this.shadowRoot.querySelector('#submit-btn').addEventListener('click', () => this.handleSubmit());
    this.shadowRoot.querySelector('#cbg').addEventListener('click', () => this.shadowRoot.querySelector('#save-data').click());
  }

  async handleSubmit() {
    const btn = this.shadowRoot.querySelector('#submit-btn');
    const statusDiv = this.shadowRoot.querySelector('#status-message');
    const topicInput = this.shadowRoot.querySelector('#topic-input');
    const saveCheckbox = this.shadowRoot.querySelector('#save-data');

    const topic = topicInput.value;
    const save = saveCheckbox.checked;

    // Validatie
    if (!topic || topic.trim() === "") {
      statusDiv.className = 'error';
      statusDiv.textContent = 'Vul a.u.b. een onderwerp in voor de vragenlijst.';
      return;
    }

    // Update UI naar 'bezig'
    btn.disabled = true;
    btn.textContent = 'Bezig met genereren...';
    statusDiv.className = 'processing';
    statusDiv.textContent = 'De AI stelt de vragen samen, moment geduld...';

    // Data voorbereiden
    const formData = new FormData();
    formData.append('onderwerp', topic);
    formData.append('opslaan', save ? '1' : '0');

    try {
      const response = await fetch('oefeningen.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server reageert met status: ${response.status}`);
      }

      const resultData = await response.json();

      // Succes in UI
      statusDiv.className = 'success';
      statusDiv.textContent = 'Gelukt! De vragenlijst is klaar.';

      // Custom Event versturen met het JSON resultaat
      this.dispatchEvent(new CustomEvent('vragenlijst-gegenereerd', {
        detail: resultData,
        bubbles: true,
        composed: true
      }));

    } catch (error) {
      statusDiv.className = 'error';
      statusDiv.textContent = 'Er is iets misgegaan bij het maken van de vragenlijst.';
      console.error('Submit Error:', error);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Vragenlijst Genereren';
    }
  }
}

// Registratie van het component
customElements.define('questionnaire-setup', QuestionnaireSetup);