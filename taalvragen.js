class CustomTaalvragen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.vragenlijst = window.vragen || [];
    this.huidigeIndex = -1;
  }

  connectedCallback() {
    this.render();
    this.volgendeVraag();
  }

  volgendeVraag() {
    if (this.vragenlijst.length === 0) return;

    // Kies een willekeurige index die niet de huidige is (indien mogelijk)
    let nieuweIndex;
    do {
      nieuweIndex = Math.floor(Math.random() * this.vragenlijst.length);
    } while (nieuweIndex === this.huidigeIndex && this.vragenlijst.length > 1);

    this.huidigeIndex = nieuweIndex;
    const vraag = this.vragenlijst[this.huidigeIndex];

    // Update de container met een vers exercise-block
    const container = this.shadowRoot.getElementById('exercise-wrapper');
    container.innerHTML = ''; // Reset

    const exercise = document.createElement('exercise-block');
    exercise.setAttribute('from', vraag.from);
    exercise.setAttribute('from-lang', vraag.fromLang);
    exercise.setAttribute('to', vraag.to);
    exercise.setAttribute('to-lang', vraag.toLang);

    // Luister naar het succes-event van het kind-component
    exercise.addEventListener('right-answer-given', () => {
      this.shadowRoot.getElementById('next-btn').classList.add('ready');
    });

    container.appendChild(exercise);
    this.shadowRoot.getElementById('next-btn').classList.remove('ready');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Segoe UI', sans-serif;
          max-width: 650px;
          margin: 20px auto;
        }

        #next-btn {
          display: block;
          width: 100%;
          margin-top: 20px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #ddd;
          color: #777;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        #next-btn.ready {
          background: #007bff;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        #next-btn.ready:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }

      </style>

      <div id="exercise-wrapper"></div>
      
      <button id="next-btn">Volgende vraag ➔</button>
    `;

    this.shadowRoot.getElementById('next-btn').onclick = () => this.volgendeVraag();
  }
}

customElements.define('custom-taalvragen', CustomTaalvragen);