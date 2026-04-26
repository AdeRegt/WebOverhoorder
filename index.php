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
    <div class="page-wrapper" style="display:none" id="toetsmenu">
        <custom-card icon-src="/icon.png">
            <h2 id="vragenlijstnaam">Hoofdmenu</h2>
            <script>
            window.vragen = [
                { from: "hallo", fromLang: "nl-NL", to: "hello", toLang: "en-GB" },
                { from: "auto", fromLang: "nl-NL", to: "car", toLang: "en-GB" },
                { from: "brood", fromLang: "nl-NL", to: "bread", toLang: "en-GB" }
            ];
            </script>

            <custom-taalvragen></custom-taalvragen>
        </custom-card>
    </div>
</body>
</html>