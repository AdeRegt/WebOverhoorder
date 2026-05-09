<?php 
    header("Strict-Transport-Security: max-age=63072000; includeSubDomains");
    header("Content-Security-Policy: default-src 'self' script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js https://cdn.jsdelivr.net/npm/tesseract.js@v5.1.1/dist/worker.min.js https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.1.1/tesseract-core-simd-lstm.wasm.js worker-src blob: connect-src data: https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz https://cdn.jsdelivr.net/npm/@tesseract.js-data/nld/4.0.0_best_int/nld.traineddata.gz ");
    header("X-Frame-Options: DENY");
    header("X-Content-Type-Options: nosniff");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#2d3748">
    <meta name="description" content="Een interactief platform voor het maken en oefenen van taalvragen met OCR-ondersteuning">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Overhoorder">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icon.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <title>Welkom | Overhoorder</title>
    <link rel="stylesheet" href="host.css">
    <script src="/aurora.js"></script>
    <script src="/card.js"></script>
    <script src="/list.js"></script>
    <script src="/input.js"></script>
    <script src="/oefening.js"></script>
    <script src="/taalvragen.js"></script>
    <script src="/newtest.js"></script>
    <script src="/getghver.php"></script>
    <script src="/runtime.js"></script>
</head>
<body>
    <aurora-sky></aurora-sky>
    <div class="page-wrapper" id="hoofdmenu">
        <custom-card icon-src="/icon.png">
            <h2>Hoofdmenu</h2>
            <p>Waarmee kan ik je helpen?</p>
            <custom-list id="opgavenlijst">
                <li>Opgaven aanmaken</li>
            </custom-list>
        </custom-card>
    </div>
    <div class="page-wrapper hide" id="toetsmenu">
        <custom-card icon-src="/icon.png">
            <custom-taalvragen></custom-taalvragen>
        </custom-card>
    </div>
    <div class="page-wrapper hide" id="createmenu">
        <custom-card icon-src="/icon.png">
            <questionnaire-setup></questionnaire-setup>
        </custom-card>
    </div>
    <script>
        // Service Worker registratie
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('[PWA] Service Worker geregistreerd:', registration);
                        
                        // Check voor updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA] Nieuwe versie beschikbaar');
                                    // Je kan hier een notificatie tonen aan de gebruiker
                                }
                            });
                        });
                    })
                    .catch(error => console.error('[PWA] Service Worker registratie mislukt:', error));
            });
        }
    </script>
</body>
</html>