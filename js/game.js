/*
Nom: Robel
Prenom: Lyn
Date: 26.05.2025
Projet: LedRaicer
*/
let clickCountRouge = 0;
let clickCountBleu = 0;
const WIN_CLICKS = 120;
var rx = null;
var tx = null;
let device = null;
const serviceUuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

// Quand le bouton est appuyé, vérifie s'il est arrivé à la fin
document.getElementById('btn-rouge').addEventListener('touchstart', () => {
    clickCountRouge++;
    sendCmd('rouge');
    console.log('Rouge : ' + clickCountRouge);
    if (clickCountRouge >= WIN_CLICKS) {
        declareWinner('rouge');
    }
});

// Quand le bouton est appuyé, vérifie s'il est arrivé à la fin
document.getElementById('btn-bleu').addEventListener('touchstart', () => {
    clickCountBleu++;
    sendCmd('bleu');
    console.log('Bleu : ' + clickCountBleu);
    if (clickCountBleu >= WIN_CLICKS) {
        declareWinner('bleu');
    }
});

// Reset la course
document.getElementById('reset').addEventListener('click', () => {
    clickCountRouge = 0;
    clickCountBleu = 0;
    sendCmd('reset');
});

// Quand le bouton est appuyé, lance une page pour choisir le bluetooth a connecter et ce connecte après avoir choisi le bluetooth
document.getElementById('connexion').addEventListener('click', init);
async function init() {
    if (!('bluetooth' in navigator)) {
        alert("Bluetooth non disponible !");
        return;
    }

    try {
        device = await navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUuid] }] });
        await connect();
        document.getElementById('player-buttons').style.display = 'flex';
    } catch (err) {
        alert("Connexion échouée : " + err);
    }
}

// Fonction pour se connecter au périphérique Bluetooth et configurer les notifications
async function connect() {
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(serviceUuid);
    tx = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
    rx = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

    await rx.startNotifications();

    rx.addEventListener('characteristicvaluechanged', event => {
        const receivedValue = event.target.value;
        const message = new TextDecoder().decode(receivedValue);
        console.log('Received message:', message);
        document.getElementById("status").innerText = message;
    });
    document.getElementById("status").innerText = "Connexion RX/TX effectuée";
}

// Fonction pour envoyer une commande au périphérique Bluetooth
async function sendCmd(cmd) {
    if (!tx) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(cmd);
    await tx.writeValue(data);
}

// Fonction pour mettre à jour le score du gagnant dans le localStorage
function updateScore(winner) {
    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    const playerName = localStorage.getItem(winner === 'rouge' ? 'nameRouge' : 'nameBleu') || 'Inconnu';

    if (!scores[playerName]) scores[playerName] = 0;
    scores[playerName]++;
    localStorage.setItem('scores', JSON.stringify(scores));

    localStorage.setItem('lastWinner', playerName);
}

// Fonction pour déclarer le gagnant et mettre à jour le score
function declareWinner(color) {
    updateScore(color);
    const name = localStorage.getItem(color === 'rouge' ? 'nameRouge' : 'nameBleu') || (color === 'rouge' ? 'Joueur 1' : 'Joueur 2');
    alert(name + ' a gagné !');
    sendCmd('reset');
    location.href = 'index.html';
}

// Fonction pour mettre à jour les labels des boutons avec les noms des joueurs
function updateButtonLabels() {
    document.getElementById('btn-rouge').textContent = localStorage.getItem('nameRouge') || 'Joueur 1';
    document.getElementById('btn-bleu').textContent = localStorage.getItem('nameBleu') || 'Joueur 2';
}

window.onload = updateButtonLabels;