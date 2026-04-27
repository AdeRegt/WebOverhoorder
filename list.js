class CustomList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this._onKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.render();
    setTimeout(() => {
      this.initItems();
    }, 50);

    window.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._onKeyDown);
  }

  initItems() {
    const listItems = this.querySelectorAll('li');
    listItems.forEach((item, index) => {
      item.setAttribute('tabindex', '-1');
      item.classList.remove('selected');
      
      item.addEventListener('click', () => {
        this.updateSelection(index);
        this.emitSelection(); // Roep het event aan bij een klik
      });
    });

    if (listItems.length > 0) {
      this.updateSelection(0);
    }
  }

  // Nieuwe methode om het event centraal te versturen
  emitSelection() {
    const listItems = Array.from(this.querySelectorAll('li'));
    const selectedItem = listItems[this.currentIndex];
    
    if (selectedItem) {
      this.dispatchEvent(new CustomEvent('item-select', {
        detail: { 
          text: selectedItem.textContent.trim(), 
          index: this.currentIndex ,
          item: selectedItem
        },
        bubbles: true,
        composed: true
      }));
      console.log('Event verstuurd voor:', selectedItem.textContent.trim());
    }
  }

  render() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:host {
          display: block;
          outline: none;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        ::slotted(li) {
          display: block !important;
          padding: 15px 15px 15px 45px !important;
          margin: 10px 0 !important;
          border: 5px solid transparent !important;
          border-radius: 8px !important;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          outline: none !important;
          background-color: #f9f9f9 !important;
          font-family: sans-serif;
          color: #333;
        }
        ::slotted(li.selected) {
          border-color: #3498db !important;
          background-color: #f0f7ff !important;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233498db"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>') !important;
          background-repeat: no-repeat !important;
          background-position: 15px center !important;
          background-size: 20px !important;
        }`); // Je CSS hier
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = `
      <ul id="list-container">
        <slot></slot>
      </ul>
    `;
  }

  handleKeyDown(e) {
    if(this.offsetParent === null) return;
    const listItems = Array.from(this.querySelectorAll('li'));
    if (listItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.updateSelection(this.currentIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.updateSelection(this.currentIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.emitSelection(); // Roep het event aan bij Enter
    }
  }

  updateSelection(newIndex) {
    const listItems = Array.from(this.querySelectorAll('li'));
    if (listItems.length === 0) return;

    listItems.forEach(item => item.classList.remove('selected'));
    this.currentIndex = (newIndex + listItems.length) % listItems.length;
    
    const nextItem = listItems[this.currentIndex];
    nextItem.classList.add('selected');
    nextItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

customElements.define('custom-list', CustomList);