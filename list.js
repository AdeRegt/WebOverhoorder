class CustomList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this._onKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.render();
    // We wachten tot de DOM stabiel is
    setTimeout(() => {
      this.initItems();
    }, 50);

    // Luister globaal zodat we toetsen vangen ongeacht waar de focus precies ligt
    window.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._onKeyDown);
  }

  initItems() {
    const listItems = this.querySelectorAll('li');
    listItems.forEach((item, index) => {
      item.setAttribute('tabindex', '-1'); // Voorkom dat je met 'Tab' door de hele lijst moet
      item.classList.remove('selected');
      
      item.addEventListener('click', () => {
        this.updateSelection(index);
      });
    });

    if (listItems.length > 0) {
      this.updateSelection(0);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
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
        }
      </style>
      <ul id="list-container">
        <slot id="main-slot"></slot>
      </ul>
    `;
  }

  handleKeyDown(e) {
    // Alleen reageren als dit element (of een kind ervan) in beeld is/actief is
    // Dit voorkomt dat andere lijsten op de pagina ook reageren
    const listItems = Array.from(this.querySelectorAll('li'));
    if (listItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.updateSelection(this.currentIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.updateSelection(this.currentIndex - 1);
    } else if (e.key === 'Enter') {
      const selectedItem = listItems[this.currentIndex];
      if (selectedItem) {
        this.dispatchEvent(new CustomEvent('item-select', {
          detail: { text: selectedItem.textContent, index: this.currentIndex },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  updateSelection(newIndex) {
    const listItems = Array.from(this.querySelectorAll('li'));
    if (listItems.length === 0) return;

    // Verwijder oude selectie
    listItems.forEach(item => item.classList.remove('selected'));

    // Update index
    this.currentIndex = (newIndex + listItems.length) % listItems.length;

    // Activeer nieuwe item
    const nextItem = listItems[this.currentIndex];
    nextItem.classList.add('selected');
    
    // Zorg dat het item in beeld scrollt als de lijst lang is
    nextItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

customElements.define('custom-list', CustomList);