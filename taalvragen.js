class CustomTaalvragen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._vragenlijst = [];
    this.huidigeIndex = -1;

    // We maken van window.vragen een Proxy als dat nog niet is gebeurd
    this.observeVragen();
  }

  observeVragen() {
    const zelf = this;
    
    // Functie om de lijst te verwerken
    const handleUpdate = (lijst) => {
      zelf._vragenlijst = lijst;
      // Als we nog geen vraag hadden, start er nu een
      if (zelf.huidigeIndex === -1 && lijst.length > 0) {
        zelf.volgendeVraag();
      }
    };

    // Als window.vragen al bestaat, neem de data over
    if (window.vragen) {
      handleUpdate(window.vragen);
    }

    // We overschrijven de property op window met een setter/getter
    // Zo vangen we het op als iemand zegt: window.vragen = [...]
    let tempVragen = window.vragen || [];
    
    Object.defineProperty(window, 'vragen', {
      get() { return tempVragen; },
      set(nieuweLijst) {
        tempVragen = nieuweLijst;
        handleUpdate(nieuweLijst);
      },
      configurable: true
    });
  }

  connectedCallback() {
    this.render();
    if (this._vragenlijst.length > 0) {
      this.volgendeVraag();
    }
  }

  volgendeVraag() {
    if (!this._vragenlijst || this._vragenlijst.length === 0) return;

    let nieuweIndex;
    do {
      nieuweIndex = Math.floor(Math.random() * this._vragenlijst.length);
    } while (nieuweIndex === this.huidigeIndex && this._vragenlijst.length > 1);

    this.huidigeIndex = nieuweIndex;
    const vraag = this._vragenlijst[this.huidigeIndex];

    const container = this.shadowRoot.getElementById('exercise-wrapper');
    if (!container) return; // Guard voor als render nog niet klaar is
    
    container.innerHTML = '';
    const exercise = document.createElement('exercise-block');
    exercise.setAttribute('from', vraag.from);
    exercise.setAttribute('from-lang', vraag.fromLang);
    exercise.setAttribute('to', vraag.to);
    exercise.setAttribute('to-lang', vraag.toLang);

    exercise.addEventListener('right-answer-given', () => {
      this.shadowRoot.getElementById('next-btn').classList.add('ready');
    });

    container.appendChild(exercise);
    this.shadowRoot.getElementById('next-btn').classList.remove('ready');
  }

  render() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:host { display: block; font-family: sans-serif; max-width: 650px; margin: 20px auto; }
        #next-btn {
          display: block; width: 100%; margin-top: 20px; padding: 12px;
          border: none; border-radius: 8px; background: #ddd; color: #777;
          font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s;
        }
        #next-btn.ready { background: #007bff; color: white; }
        .empty-state { text-align: center; color: #999; padding: 20px; border: 2px dashed #eee; border-radius: 8px; }`); // Je CSS hier
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = `
      <div id="exercise-wrapper">
        <div class="empty-state">Wachten op vragen...</div>
      </div>
      <button id="next-btn">Volgende vraag ➔</button>
    `;

    this.shadowRoot.getElementById('next-btn').onclick = () => this.volgendeVraag();
  }
}

customElements.define('custom-taalvragen', CustomTaalvragen);