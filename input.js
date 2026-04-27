class MultiKeyboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.layouts = {
      lat: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      gr:  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split(''),
      cyr: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')
    };
    
    this.currentLayout = 'lat';
    this.isShifted = false;
  }

  // Hiermee kun je in JS doen: const tekst = myComponent.value;
  get value() {
    return this.shadowRoot.getElementById('output').value;
  }

  // Hiermee kun je in JS doen: myComponent.value = "Hallo";
  set value(newValue) {
    const input = this.shadowRoot.getElementById('output');
    if (input) {
      input.value = newValue;
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }
  }

  connectedCallback() {
    this.render();
  }

  setLayout(lang) {
    this.currentLayout = lang;
    this.render();
    this.shadowRoot.getElementById('keyboard').showPopover();
  }

  toggleShift() {
    this.isShifted = !this.isShifted;
    this.render();
    this.shadowRoot.getElementById('keyboard').showPopover();
  }

  // Interne helper om waarde bij te werken en event te vuren
  _updateValue(char) {
    const input = this.shadowRoot.getElementById('output');
    input.value += char;
    // Vuur een event zodat de buitenwereld weet dat er iets getypt is
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  render() {
    const placeholder = this.getAttribute('placeholder') || 'Typ iets...';
    const currentVal = this.shadowRoot.getElementById('output')?.value || '';

    let currentKeys = this.layouts[this.currentLayout];
    if (this.isShifted) {
      currentKeys = currentKeys.map(char => char.toLowerCase());
    }

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:host { display: block; width: 100%; font-family: 'Segoe UI', sans-serif; }
        .wrapper { position: relative; width: 100%; }
        input {
          width: 100%; padding: 12px 45px 12px 12px;
          font-size: 16px; border: 2px solid #ddd;
          border-radius: 8px; box-sizing: border-box; outline: none;
        }
        .toggle-btn {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #666;
        }
        #keyboard {
          margin: 0; padding: 15px; background: #222;
          border-radius: 12px; border: 1px solid #444;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          width: 350px;
        }
        #keyboard:popover-open {
          position: absolute; inset: unset;
          top: calc(var(--input-bottom) + 8px);
          left: var(--input-left);
        }
        .tabs { display: flex; gap: 4px; margin-bottom: 10px; }
        .tabs button { 
          flex: 1; background: #444; color: white; border: none; 
          padding: 8px 4px; border-radius: 6px; cursor: pointer; font-size: 12px;
        }
        .tabs button.active { background: #007bff; }
        .keys { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
        .key {
          padding: 10px; background: #f0f0f0; border: none;
          border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px;
        }
        .special-keys { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
        .shift-btn { background: ${this.isShifted ? '#28a745' : '#666'}; color: white; padding: 10px; border-radius: 6px; border: none; cursor: pointer; }
        .clear-btn { background: #dc3545; color: white; padding: 10px; border-radius: 6px; border: none; cursor: pointer; }`); // Je CSS hier
    this.shadowRoot.adoptedStyleSheets = [sheet];

    this.shadowRoot.innerHTML = `
      <div class="wrapper">
        <input type="text" id="output" placeholder="${placeholder}" value="${currentVal}">
        <button class="toggle-btn" popovertarget="keyboard" id="trigger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 17h8"></path>
          </svg>
        </button>

        <div id="keyboard" popover>
          <div class="tabs">
            <button class="${this.currentLayout === 'lat' ? 'active' : ''}" data-lang="lat">Latijn</button>
            <button class="${this.currentLayout === 'gr' ? 'active' : ''}" data-lang="gr">Grieks</button>
            <button class="${this.currentLayout === 'cyr' ? 'active' : ''}" data-lang="cyr">Cyrillisch</button>
          </div>
          <div class="keys">
            ${currentKeys.map(char => `<button class="char-key key">${char}</button>`).join('')}
          </div>
          <div class="special-keys">
            <button class="shift-btn">${this.isShifted ? 'abc' : 'ABC'}</button>
            <button class="clear-btn">Wissen</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const kb = this.shadowRoot.getElementById('keyboard');
    const input = this.shadowRoot.getElementById('output');

    this.shadowRoot.getElementById('trigger').onclick = () => {
      const rect = input.getBoundingClientRect();
      kb.style.setProperty('--input-bottom', `${rect.bottom + window.scrollY}px`);
      kb.style.setProperty('--input-left', `${rect.left + window.scrollX}px`);
    };

    this.shadowRoot.querySelectorAll('.tabs button').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.setLayout(btn.dataset.lang);
      };
    });

    this.shadowRoot.querySelectorAll('.char-key').forEach(btn => {
      btn.onclick = () => this._updateValue(btn.innerText);
    });

    this.shadowRoot.querySelector('.shift-btn').onclick = () => this.toggleShift();
    this.shadowRoot.querySelector('.clear-btn').onclick = () => {
        input.value = '';
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    };

    // Zorg dat handmatig typen ook de value bijwerkt (als readonly uit staat)
    input.oninput = () => {
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    };
  }
}

customElements.define('multi-keyboard', MultiKeyboard);