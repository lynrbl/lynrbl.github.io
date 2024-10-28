"use strict";

const map = L.map('map').setView([46.2044, 6.1432], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);


const markers = [
    L.marker([43.2044, 6.432]).addTo(map),
    L.marker([42.2044, 7.432]).addTo(map),
    L.marker([47.2044, 6.132]).addTo(map),
    L.marker([41.2044, 6.142]).addTo(map),
    L.marker([46.2044, 6.143]).addTo(map),
    L.marker([43.2044, 5.32]).addTo(map),
    L.marker([49.2044, 6.2]).addTo(map),
];

map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const newMarker = L.marker([lat, lng]).addTo(map);

    newMarker.on('click', () => {
        showMarkerDetails(newMarker);
    });
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
