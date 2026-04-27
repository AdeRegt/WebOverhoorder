class CustomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Haal de src en de achtergrondkleur op uit de attributen
    const imgSrc = this.getAttribute('icon-src') || '/icon.png';
    const bgColor = this.getAttribute('color') || '#faf9f4';
    const gitver = window.githubversion || 'development';

    const sheet = new CSSStyleSheet();
  sheet.replaceSync(`:host {
          /* Zorgt dat de tag zelf zich gedraagt als een inline-block */
          display: inline-block; 
          width: 100%; /* Zodat de max-width van de kaart werkt */
          z-index: 100;
        }
        
        .main-card {
          display: flex;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          overflow: hidden;
          
          /* Dit zorgt ervoor dat de kaart niet het hele scherm vult */
          width: 90%;
          max-width: 800px; 
          margin: 0 auto; /* Centreert de kaart binnen het component zelf */
          
          min-height: 200px;
        }

        .side-panel {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: ${bgColor};
          width: calc(100%/4);
          flex-shrink: 0;
          background-image: url("${imgSrc}");
          background-size: contain;
          background-repeat: no-repeat;
          background-position-y: calc(100%/2);
        }

        .content-panel {
          padding: 30px;
          flex-grow: 1;
          text-align: left; /* Zorgt dat tekst gewoon links begint */
          padding-bottom: 20px;
        }

        ::slotted(*) {
          font-family: sans-serif;
          margin: 0 0 10px 0;
        }
        .footer-text {
          margin-top: auto; /* Duwt de tekst naar de bodem */
          text-align: right; /* Zet de tekst rechts */
          color: #e1e0e0;       /* Grijs */
          font-style: italic; /* Cursief */
          font-size: 0.9rem;
          font-family: sans-serif;
        }
         `); // Je CSS hier
  this.shadowRoot.adoptedStyleSheets = [sheet];

    this.shadowRoot.innerHTML = `
      <div class="main-card">
        <div class="side-panel">
        </div>
        <div class="content-panel">
          <slot></slot>
          <div class="footer-text">${gitver}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('custom-card', CustomCard);