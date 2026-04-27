<?php 
    $setup = include __DIR__ . DIRECTORY_SEPARATOR . "cgi-bin" . DIRECTORY_SEPARATOR . "db.php";
    $servername = $setup["servername"];
    $username   = $setup["username"];
    $password   = $setup["password"]; // Vul hier je wachtwoord in
    $dbname     = $setup["dbname"];

    // 1. Verbinding maken met de server
    $conn = new mysqli($servername, $username, $password);

    // Check verbinding
    if ($conn->connect_error) {
        die("Verbinding mislukt: " . $conn->connect_error);
    }

    // 2. Database aanmaken als deze niet bestaat
    $sql_db = "CREATE DATABASE IF NOT EXISTS $dbname";
    if (!($conn->query($sql_db) === TRUE)) {
        die("Fout bij aanmaken database: " . $conn->error);
    }

    // 3. De database selecteren
    $conn->select_db($dbname);

    // 4. Tabel 'oefening' aanmaken
    $sql_oefening = "CREATE TABLE IF NOT EXISTS oefening (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        naam VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB";

    if (!($conn->query($sql_oefening) === TRUE)) {
        echo "Fout bij aanmaken tabel oefening: " . $conn->error;
    }

    // 5. Tabel 'vraag' aanmaken (met Foreign Key naar oefening)
    $sql_vraag = "CREATE TABLE IF NOT EXISTS vraag (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        oefening_id INT(11) UNSIGNED NOT NULL,
        type ENUM('taal', 'topografie') NOT NULL,
        CONSTRAINT fk_oefening
            FOREIGN KEY (oefening_id) 
            REFERENCES oefening(id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB";

    if (!($conn->query($sql_vraag) === TRUE)) {
        echo "Fout bij aanmaken tabel vraag: " . $conn->error;
    }

    // 6. Tabel 'vraag_taal' aanmaken (met Foreign Key naar oefening)
    $sql_vraag = "CREATE TABLE IF NOT EXISTS vraag_taal (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        vraag_id INT(11) UNSIGNED NOT NULL,
        richting ENUM('vraag', 'antwoord') NOT NULL,
        taal VARCHAR(5) NOT NULL,
        tekst TEXT NOT NULL,
        CONSTRAINT fk_vraag
            FOREIGN KEY (vraag_id) 
            REFERENCES vraag(id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB";

    if (!($conn->query($sql_vraag) === TRUE)) {
        echo "Fout bij aanmaken tabel vraag_taal: " . $conn->error;
    }

    // Verbinding sluiten
    $conn->close();


    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    if($_SERVER['REQUEST_METHOD']=="POST"){
        $apiKey = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . "cgi-bin" . DIRECTORY_SEPARATOR . "aikey.txt");
        // We gebruiken v1beta omdat deze het meest flexibel is voor JSON-output
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" . $apiKey;

        $onderwerp = $_POST["onderwerp"];

        $data = [
            "contents" => [
                [
                    "parts" => [
                        [
                            "text" => "Genereer een vragenlijst over $onderwerp in JSON. Schema: [{\"id\": 1,\"naam\": \"Mijn vragenlijst\",\"vragen\":[{\"from\": \"hallo\",\"fromLang\": \"nl-NL\",\"to\": \"hello\",\"toLang\": \"en-GB\"}]}]"
                        ]
                    ]
                ]
            ],
            "generationConfig" => [
                // In v1beta werkt deze schrijfwijze (snake_case) meestal het beste
                "response_mime_type" => "application/json",
                "temperature" => 0.2
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Soms essentieel op lokale servers zoals XAMPP/WAMP:
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200) {
            // Als dit weer 404 geeft, probeer dan in de URL: gemini-pro (zonder 1.5)
            die("Foutcode: $httpCode | Response: $response");
        }

        $result = json_decode($response, true);
        $jsonOutput = $result['candidates'][0]['content']['parts'][0]['text'];

        if($_POST["opslaan"]=='1'){
            $op = json_decode($jsonOutput, true);
            foreach($op as $subject){
                $sql = "INSERT INTO oefening (naam) VALUES (?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$subject["naam"]]);
                $vragenlijst_id = $pdo->lastInsertId();
                foreach($subject["vragen"] as $vraag){
                    $sql = "INSERT INTO vraag (oefening_id,type) VALUES (?,?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$vragenlijst_id,"taal"]);
                    $vragen_id = $pdo->lastInsertId();

                    $sql = "INSERT INTO vraag_taal (vraag_id,richting,taal,tekst) VALUES (?,?,?,?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$vragen_id,'vraag',$vraag["fromLang"],$vraag["from"]]);

                    $sql = "INSERT INTO vraag_taal (vraag_id,richting,taal,tekst) VALUES (?,?,?,?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$vragen_id,'antwoord',$vraag["toLang"],$vraag["to"]]);
                }
            }
        }

        // Print het resultaat
        header('Content-Type: application/json');
        echo $jsonOutput;
        exit;
    }else{
        $stmt = $pdo->query('SELECT * FROM oefening');
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach($list as &$l) {
            $stmt = $pdo->prepare('SELECT * FROM vraag WHERE oefening_id = ?');
            $stmt->execute([$l["id"]]);
            $l["vragen"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach($l["vragen"] as &$b){
                $stmt = $pdo->prepare('SELECT * FROM vraag_taal WHERE vraag_id = ?');
                $stmt->execute([$b["id"]]);
                $b["talen"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach($b["talen"] as $tl){
                    if($tl["richting"]=="vraag"){
                        $b["from"] = $tl["tekst"];
                        $b["fromLang"] = $tl["taal"];
                    }else{
                        $b["to"] = $tl["tekst"];
                        $b["toLang"] = $tl["taal"];
                    }
                }
            }
        }


        header("Content-Type: application/json");
        echo json_encode($list);
        exit;
    }
?>