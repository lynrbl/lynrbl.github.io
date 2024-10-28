"use strict";

const map = L.map('map').setView([46.2044, 6.1432], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);



const marker1 = L.marker([46.236853, 6.126938]).addTo(map);
const marker2 = L.marker([46.19017, 6.114063]).addTo(map);
const marker3 = L.marker([46.190764, 6.151485]).addTo(map);
const marker4 = L.marker([46.181257, 6.102905]).addTo(map);
    marker1.on('click', () => {
        showMarkerDetails(marker1);
    });
    marker2.on('click', () => {
        showMarkerDetails(marker2);
    });
    marker3.on('click', () => {
        showMarkerDetails(marker3);
    });
    marker4.on('click', () => {
        showMarkerDetails(marker4);
    });
function showMarkerDetails(marker) {
    const details = `
        <div class="w3-container">
            <h3>Détails de l'Objet Caché</h3>
            <p>Coordonnées : ${marker.getLatLng().toString()}</p>
            <a href="index.html"><button class="w3-button w3-green">Retour à la carte</button></a>
        </div>
    `;
    document.body.innerHTML = details;
}

function backToMap() {
    location.reload();
}

document.getElementById('cameraButton').addEventListener('click', openCamera);
async function openCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
    } catch (err) {
        console.error("Erreur d'accès à la caméra", err);
    }
}
