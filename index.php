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
</body>
</html>