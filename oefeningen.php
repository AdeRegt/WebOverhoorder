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
        vraag_tekst TEXT NOT NULL,
        antwoord_tekst TEXT NOT NULL,
        type ENUM('taal', 'topografie') NOT NULL,
        CONSTRAINT fk_oefening
            FOREIGN KEY (oefening_id) 
            REFERENCES oefening(id)
            ON DELETE CASCADE
    ) ENGINE=InnoDB";

    if (!($conn->query($sql_vraag) === TRUE)) {
        echo "Fout bij aanmaken tabel vraag: " . $conn->error;
    }

    $result = $conn->query('SELECT * FROM oefening');
    $list = $result->fetch_all(MYSQLI_ASSOC);
    foreach($list as &$l) {
        $result = $conn->prepare('SELECT * FROM vraag WHERE oefening_id=? ');
        $result->bind_param("s",$l["id"]);
        $result->execute();
        $result = $result->get_result();
        $l["vragen"] = $result->fetch_all(MYSQLI_ASSOC);
    }

    // Verbinding sluiten
    $conn->close();

    header("Content-Type: application/json");
    echo json_encode($list);
    exit;
?>