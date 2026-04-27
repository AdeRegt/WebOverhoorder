class AuroraSky extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.waves = [];
        this.animationFrame = null;
    }

    connectedCallback() {

        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`:host {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                #sky {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }
                #canvas {
                    position: absolute;
                    inset: 0;
                    filter: blur(35px);
                    z-index: 2;
                    pointer-events: none;
                }
                .stars {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                }
                .star {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                }`); // Je CSS hier
        this.shadowRoot.adoptedStyleSheets = [sheet];

        this.shadowRoot.innerHTML = `
            <div id="sky"></div>
            <div class="stars" id="stars"></div>
            <canvas id="canvas"></canvas>
        `;

        this.canvas = this.shadowRoot.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sky = this.shadowRoot.getElementById('sky');
        this.starsContainer = this.shadowRoot.getElementById('stars');

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.generateStars();
        this.initAurora();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    generateStars() {
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2;
            star.style.cssText = `
                width: ${size}px; height: ${size}px;
                top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
                opacity: ${Math.random()};
            `;
            this.starsContainer.appendChild(star);
        }
    }

    interpolateColor(color1, color2, factor) {
        const hex = (x) => x.toString(16).padStart(2, '0');
        const parse = (c) => [parseInt(c.slice(1,3), 16), parseInt(c.slice(3,5), 16), parseInt(c.slice(5,7), 16)];
        const [r1, g1, b1] = parse(color1);
        const [r2, g2, b2] = parse(color2);
        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));
        return `#${hex(r)}${hex(g)}${hex(b)}`;
    }

    updateCycle() {
        const now = new Date();
        const progress = (now.getMinutes() + now.getSeconds() / 60) / 60;
        const lightFactor = Math.abs(Math.sin(progress * Math.PI));

        this.sky.style.backgroundColor = this.interpolateColor('#050b1a', '#8ecae6', lightFactor);
        this.canvas.style.opacity = 1 - lightFactor;
        this.starsContainer.style.opacity = 1 - (lightFactor * 1.5);
    }

    initAurora() {
        for (let i = 0; i < 12; i++) {
            this.waves.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.5,
                len: Math.random() * 400 + 300,
                speed: Math.random() * 0.3 + 0.1,
                color: ['rgba(0, 255, 130,', 'rgba(0, 180, 255,', 'rgba(180, 100, 255,'][Math.floor(Math.random()*3)],
                offset: Math.random() * 100
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.updateCycle();

        this.waves.forEach(w => {
            w.offset += 0.005;
            const waveX = w.x + Math.sin(w.offset) * 40;
            const grad = this.ctx.createLinearGradient(waveX, w.y, waveX, w.y + w.len);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.5, w.color + '0.3)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(waveX, w.y, 70, w.len);
            w.x += w.speed;
            if (w.x > this.width) w.x = -70;
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    disconnectedCallback() {
        cancelAnimationFrame(this.animationFrame);
    }
}

customElements.define('aurora-sky', AuroraSky);