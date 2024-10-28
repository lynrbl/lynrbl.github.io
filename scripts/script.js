"use strict";

const map = L.map('map').setView([46.2044, 6.1432], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);


map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const marker = L.marker([lat, lng]).addTo(map);

    marker.on('click', () => {
        showMarkerDetails(marker);
    });
});

function showMarkerDetails(marker) {
    const details = `
        <div class="w3-container">
            <h3>Détails de l'Objet Caché</h3>
            <p>Coordonnées : ${marker.getLatLng().toString()}</p>
            <button onclick="backToMap()" class="w3-button w3-green">Retour à la carte</button>
        </div>
    `;
    document.body.innerHTML = details;
}

function backToMap() {
    location.reload();
}
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
