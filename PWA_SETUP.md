# PWA Setup - Overhoorder

Je website is nu omgezet naar een **Progressive Web App (PWA)**! Dit betekent dat gebruikers de app kunnen installeren en offline kunnen werken.

## 🎯 Wat is er veranderd?

### 1. **manifest.json** 
Het manifest definieert hoe de app verschijnt als geïnstalleerde app:
- Naam en iconen
- Start URL en display mode
- Thema kleuren
- Shortcuts voor snelle toegang

### 2. **service-worker.js**
De service worker stelt de app in staat om:
- ✅ Offline te werken (assets worden gecached)
- ✅ Sneller te laden (cached content wordt eerst getoond)
- ✅ Updates in de achtergrond te laden
- ✅ Fallback pagina te tonen wanneer content niet beschikbaar is

### 3. **index.php - Updates**
- Meta tags voor iOS-ondersteuning
- Viewport instellingen voor responsieve design
- Service worker registratie script

### 4. **offline.html**
Een vriendelijke offlinepagina die getoond wordt als gebruiker offline is.

## 📱 Installatie voor gebruikers

### Desktop (Chrome, Edge, Opera)
1. Open de website in een ondersteunde browser
2. Klik op het installatie-icoon in de adresbalk (installerpictogram)
3. Klik "Installeren"
4. De app verschijnt nu in je startmenu/applications

### Mobiel (Android)
1. Open de website in Chrome
2. Tik op de 3 punten (menu) in de rechter bovenhoek
3. Selecteer "App installeren" of "Aan startscherm toevoegen"
4. De app verschijnt nu op je home screen

### iOS (Apple)
1. Open de website in Safari
2. Tik op het share-icoon (uitvoerpijl)
3. Selecteer "Aan startscherm toevoegen"
4. Kies een naam en tik "Toevoegen"

## 🔧 Vereisten voor PWA

Voor een volledig werkende PWA moet je:

### ✅ HTTPS gebruiken
PWAs vereisen HTTPS (behalve localhost voor testing). Controleer:
- Je server: `header("Strict-Transport-Security: max-age=63072000");` ✓ al aanwezig

### ✅ Manifest.json
- Status: ✓ Aanwezig

### ✅ Service Worker
- Status: ✓ Aanwezig en geregistreerd

### ✅ Icons
De volgende formaten moeten beschikbaar zijn:
- `icon.png` (192x192 en 512x512) - ✓ Aanwezig
- `favicon.ico` - ✓ Aanwezig

## 🚀 Deployment checklist

Voor productie-omgeving:

- [ ] HTTPS ingeschakeld op je server
- [ ] Icons zijn beschikbaar (zie eisen boven)
- [ ] Service worker werkt correct (test offline in DevTools)
- [ ] Manifest.json is geldig (test in DevTools)
- [ ] Meta tags zijn correct ingesteld
- [ ] Test installatie op desktop en mobiel

## 🧪 Testen van PWA functies

### Chrome/Edge DevTools
1. Open DevTools (F12)
2. Ga naar "Application" tab
3. Bekijk:
   - **Manifest**: Check of manifest.json correct wordt geladen
   - **Service Workers**: Check of service worker is geregistreerd
   - **Storage**: Bekijk wat gecached is

### Offline testen
1. DevTools openen
2. Network tab → Checkbox "Offline" aanvinken
3. Vernieuwen en controleren of de app nog werkt

## 📊 Caching strategie

De service worker implementeert:

- **Assets (CSS, JS, images)**: Cache-first
  - Laadt eerst uit cache, dan fallback naar network
  - Minder serverbelasting, sneller laden

- **HTML/API**: Network-first  
  - Probeert eerst van server op te halen
  - Fallback naar cache voor offline support

## 🎨 Customization

Je kunt aanpassingen doen in:

1. **manifest.json**: Naam, thema, shortcuts aanpassen
2. **service-worker.js**: Caching-strategie aanpassen
3. **offline.html**: Offline pagina design aanpassen
4. **index.php**: Manifest-link en meta tags (al gegaan)

## ⚠️ Handige tips

- Service worker updates kunnen tot 24 uur duren (browser cache)
- Je kunt de caches handmatig clearen via DevTools
- Test op verschillende browsers (Chrome, Firefox, Edge, Safari)
- Gebruik mobile DevTools voor device emulation testen

## 📚 Meer informatie

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa/)
- [Web.dev - Service Workers](https://web.dev/service-workers-cache-storage/)

---

**Veel succes met je PWA! 🚀**
