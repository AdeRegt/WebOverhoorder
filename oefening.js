class ExerciseBlock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.mode = 'keyboard';
    
    // Browser support checks
    this.hasSpeechRec = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    this.hasSpeechSynth = !!window.speechSynthesis;
    
    this.questionText = "";
    this.targetAnswer = "";
    this.recognitionLang = "";
    this.synthesisLang = "";
    this.alreadyFinished = false;
    this.worker = null;
  }

  connectedCallback() {
    this.determineDirection();
    this.render();
  }

  determineDirection() {
    const from = this.getAttribute('from');
    const fromLang = this.getAttribute('from-lang') || 'nl-NL';
    const to = this.getAttribute('to');
    const toLang = this.getAttribute('to-lang') || 'en-GB';

    if (Math.random() < 0.5) {
      this.questionText = `Hoe zeg je "${from}" in het ${this.getLanguageName(toLang)}?`;
      this.targetAnswer = to;
      this.synthesisLang = fromLang;
      this.recognitionLang = toLang;
    } else {
      this.questionText = `Hoe zeg je "${to}" in het ${this.getLanguageName(fromLang)}?`;
      this.targetAnswer = from;
      this.synthesisLang = toLang;
      this.recognitionLang = fromLang;
    }
  }

  getLanguageName(langCode) {
    const names = {
      'nl-NL': 'Nederlands', 'en-GB': 'Engels', 'en-US': 'Engels',
      'fr-FR': 'Frans', 'de-DE': 'Duits', 'gr': 'Grieks', 'cyr': 'Russisch'
    };
    return names[langCode] || langCode;
  }

  setMode(newMode) {
    this.mode = newMode;
    this.render();
    this.setupValidation();
    if (newMode === 'write') this.initCanvas();
  }

  // --- VALIDATIE METHODE ---
  setupValidation() {
    if (this.mode === 'keyboard') {
      const kb = this.shadowRoot.getElementById('kb-input');
      if (kb) {
        const handler = () => {
          const input = kb.shadowRoot.getElementById('output');
          if (input) this.checkFinalAnswer(input.value, input);
        };
        kb.shadowRoot.addEventListener('input', handler);
        kb.shadowRoot.addEventListener('click', (e) => {
          // Check of er op een toets van het multi-keyboard is geklikt
          if (e.target.tagName === 'BUTTON' || e.composedPath().some(el => el.tagName === 'BUTTON')) {
             setTimeout(handler, 10); // Kleine vertraging zodat de waarde geüpdatet is
          }
        });
      }
    }
  }

  // --- OCR HANDSCHRIFT ---
  async initTesseract() {
    if (this.worker) return;
    if (!window.Tesseract) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    const lang = this.recognitionLang.startsWith('nl') ? 'nld' : 'eng';
    this.worker = await Tesseract.createWorker(lang);
  }

  async checkHandwriting() {
    const canvas = this.shadowRoot.getElementById('write-canvas');
    const status = this.shadowRoot.getElementById('write-status');
    status.innerText = "Bezig met herkennen...";
    
    try {
      await this.initTesseract();
      const { data: { text } } = await this.worker.recognize(canvas);
      const cleanedText = text.trim().replace(/\n/g, "");
      status.innerText = `Gezien: "${cleanedText}"`;
      this.checkFinalAnswer(cleanedText);
    } catch (err) {
      status.innerText = "Fout bij herkenning.";
      console.error(err);
    }
  }

  // --- SPRAAK ---
  startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = this.recognitionLang;
    const micBtn = this.shadowRoot.getElementById('mic-btn');
    const resultDiv = this.shadowRoot.getElementById('speech-result');

    recognition.onstart = () => {
      micBtn.classList.add('recording');
      resultDiv.innerText = "Ik luister...";
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resultDiv.innerText = `Gehoord: "${transcript}"`;
      this.checkFinalAnswer(transcript);
    };
    recognition.onend = () => micBtn.classList.remove('recording');
    recognition.start();
  }

  // --- CORE LOGICA ---
  checkFinalAnswer(value, element = null) {
    const cleanInput = value.toLowerCase().trim().replace(/[.,!?]/g, "");
    const cleanTarget = this.targetAnswer.toLowerCase().trim();
    const isCorrect = cleanInput === cleanTarget;

    if (element) {
      element.style.backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
      element.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
    }

    if (isCorrect) this.fireSuccessEvent(this.mode);
  }

  fireSuccessEvent(method) {
    if (this.alreadyFinished) return;
    this.alreadyFinished = true;
    this.dispatchEvent(new CustomEvent('right-answer-given', {
      bubbles: true, composed: true, detail: { answer: this.targetAnswer, method }
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Segoe UI', sans-serif; max-width: 600px; }
        .text-row { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        h3 { margin: 0; font-size: 1.1rem; }
        .mode-selector { display: flex; gap: 5px; background: #eee; padding: 4px; border-radius: 8px; margin-bottom: 15px; }
        .mode-btn { 
          flex: 1; border: none; padding: 10px 5px; border-radius: 6px; 
          cursor: pointer; background: transparent; font-weight: bold; 
          color: #555; display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 0.9rem;
        }
        .mode-btn.active { background: white; color: #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .mode-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        #canvas-container { border: 2px dashed #ccc; border-radius: 8px; background: white; margin-bottom: 10px; overflow: hidden; }
        canvas { width: 100%; height: 200px; touch-action: none; display: block; }
        
        .hidden { display: none; }
        .btn-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .action-btn { padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc; background: white; cursor: pointer; font-weight: 500; }
        .success-btn { background: #28a745; color: white; border: none; }
        
        .mic-area { text-align: center; padding: 30px; background: #fafafa; border-radius: 10px; border: 1px solid #eee; }
        .mic-btn { width: 64px; height: 64px; border-radius: 50%; border: none; background: #dc3545; color: white; cursor: pointer; font-size: 24px; transition: 0.2s; }
        .recording { animation: pulse 1.5s infinite; background: #ff0000; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); } 70% { box-shadow: 0 0 0 12px rgba(220, 53, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); } }
      </style>

      <div class="text-row">
        <h3>${this.questionText}</h3>
        <button id="tts-btn" style="border:none; background:none; cursor:pointer; font-size:1.2rem;" title="Voorlezen">🔊</button>
      </div>

      <div class="mode-selector">
        <button class="mode-btn ${this.mode === 'keyboard' ? 'active' : ''}" data-mode="keyboard">
          <span>⌨️</span> Typen
        </button>
        <button class="mode-btn ${this.mode === 'write' ? 'active' : ''}" data-mode="write">
          <span>✍️</span> Schrijven
        </button>
        <button class="mode-btn ${this.mode === 'speak' ? 'active' : ''}" data-mode="speak" ${!this.hasSpeechRec ? 'disabled' : ''}>
          <span>🎤</span> Spreken
        </button>
      </div>

      <div id="content-area">
        <div class="${this.mode !== 'keyboard' ? 'hidden' : ''}">
          <multi-keyboard id="kb-input" placeholder="Typ het antwoord..."></multi-keyboard>
        </div>

        <div class="${this.mode !== 'write' ? 'hidden' : ''}">
          <div id="canvas-container"><canvas id="write-canvas"></canvas></div>
          <div class="btn-row">
            <button id="clear-canvas" class="action-btn">Wissen</button>
            <button id="check-write" class="action-btn success-btn">Check Handschrift</button>
          </div>
          <div id="write-status" style="font-size:0.85rem; color:#666;">Schrijf je antwoord duidelijk op het vlak.</div>
        </div>

        <div class="${this.mode !== 'speak' ? 'hidden' : ''}">
          <div class="mic-area">
            <button id="mic-btn" class="mic-btn">🎙️</button>
            <p style="margin-top:15px; color:#666;"><small>Klik op de microfoon om te antwoorden</small></p>
            <div id="speech-result" style="margin-top:10px; font-weight:bold; color:#007bff; min-height:1.2em;"></div>
          </div>
        </div>
      </div>
    `;
    this.setupEventListeners();
    this.setupValidation();
  }

  setupEventListeners() {
    // Mode switcher
    this.shadowRoot.querySelectorAll('.mode-btn:not([disabled])').forEach(btn => {
      btn.onclick = () => this.setMode(btn.dataset.mode);
    });

    // Voorlees-functie
    const ttsBtn = this.shadowRoot.getElementById('tts-btn');
    if (ttsBtn) ttsBtn.onclick = () => {
      const u = new SpeechSynthesisUtterance(this.questionText);
      u.lang = this.synthesisLang;
      window.speechSynthesis.speak(u);
    };

    // Specifieke modus listeners
    if (this.mode === 'write') {
      this.shadowRoot.getElementById('check-write').onclick = () => this.checkHandwriting();
    }
    if (this.mode === 'speak' && this.hasSpeechRec) {
      this.shadowRoot.getElementById('mic-btn').onclick = () => this.startSpeechRecognition();
    }
  }

  initCanvas() {
    const canvas = this.shadowRoot.getElementById('write-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Reset canvas grootte en witte achtergrond (belangrijk voor OCR)
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    ctx.fillStyle = "white"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 5; 
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      return { x, y };
    };

    const start = (e) => { 
      drawing = true; 
      ctx.beginPath(); 
      const p = getPos(e); 
      ctx.moveTo(p.x, p.y); 
      if(e.type === 'touchstart') e.preventDefault(); 
    };
    
    const move = (e) => { 
      if(!drawing) return; 
      const p = getPos(e); 
      ctx.lineTo(p.x, p.y); 
      ctx.stroke(); 
      if(e.type === 'touchmove') e.preventDefault();
    };
    
    const stop = () => { drawing = false; };

    canvas.onmousedown = canvas.ontouchstart = start;
    canvas.onmousemove = canvas.ontouchmove = move;
    window.onmouseup = window.ontouchend = stop;

    this.shadowRoot.getElementById('clear-canvas').onclick = () => { 
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height); 
      this.shadowRoot.getElementById('write-status').innerText = "Vlak gewist.";
    };
  }
}

customElements.define('exercise-block', ExerciseBlock);