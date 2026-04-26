
const DB_NAME = 'MijnApiCache';
const DB_VERSION = 1;
const STORE_NAME = 'producten';
const API_URL = '/oefeningen.php';

async function getCachedData() {
    return new Promise((resolve, reject) => {
        // 1. Open de database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Maak de store aan als deze nog niet bestaat (wordt alleen uitgevoerd bij versie-verhoging)
        request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        };

        request.onsuccess = async (event) => {
        const db = event.target.result;
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        // 2. Check of er al data in de store staat
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
            const result = getAllRequest.result;

            if (result && result.length > 0) {
            console.log("Data geladen uit IndexedDB cache.");
            resolve(result);
            } else {
            // 3. Geen data gevonden? Ophalen via API
            console.log("Cache is leeg. API aanroepen...");
            try {
                const data = await fetchDataFromApi();
                saveDataToIndexedDB(db, data);
                resolve(data);
            } catch (error) {
                reject("API fout: " + error);
            }
            }
        };
        };

        request.onerror = (event) => reject("DB Fout: " + event.target.errorCode);
    });
}

// Hulpserie: Data ophalen van API
async function fetchDataFromApi() {
    const response = await fetch(API_URL);
    return await response.json();
}

// Hulpserie: Data opslaan in de DB
function saveDataToIndexedDB(db, data) {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    data.forEach(item => {
        store.put(item);
    });
    
    transaction.oncomplete = () => console.log("Data succesvol gecached.");
}

// Gebruik:
getCachedData().then(data => {
    data.every(function(element){
        var idiot = document.createElement("li");
        idiot.innerHTML = element.naam;
        idiot.setAttribute("oefening_id",element.id);
        document.getElementById("opgavenlijst").appendChild(idiot);
    });

    document.getElementById("opgavenlijst").addEventListener("item-select",function(a){
        document.getElementById("vragenlijstnaam").innerText = a.detail.text;
        document.getElementById("hoofdmenu").style.display = "none";
        document.getElementById("toetsmenu").style.display = "flex";
    });
});