"use strict";

const map = L.map('map').setView([46.2044, 6.1432], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

const markers = [
    L.marker([46.236853, 6.126938]).addTo(map),
    L.marker([46.19017, 6.114063]).addTo(map),
    L.marker([46.190764, 6.151485]).addTo(map),
    L.marker([46.181257, 6.102905]).addTo(map),
    L.marker([46.2044, 6.143]).addTo(map),
    L.marker([43.2044, 5.32]).addTo(map),
    L.marker([49.2044, 6.2]).addTo(map)
];

markers.forEach(marker => {
    marker.on('click', () => {
        marker.bindPopup(
            <div class="w3-container">
                <h3>Détails de l'Objet Caché</h3>
                <p>Coordonnées : ${marker.getLatLng().toString()}</p>
                <a href="index.html"><button class="w3-button w3-green">Retour à la carte</button></a>
            </div>
        );
        marker.openPopup();
    });
});


let currentStream;
let usingFrontCamera = true;

const videoElement = document.getElementById('video');
const capturedImage = document.getElementById('captured-image');

async function startCamera(facingMode = 'user') {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode }
        });
        videoElement.srcObject = currentStream;
        videoElement.style.display = 'block';
    } catch (error) {
        console.error("Erreur d'accès à la caméra", error);
        alert("Impossible d'accéder à la caméra.");
    }
}

document.getElementById('cameraButton').addEventListener('click', () => {
    startCamera(usingFrontCamera ? 'user' : 'environment');
});

document.getElementById('flip-button').addEventListener('click', () => {
    usingFrontCamera = !usingFrontCamera;
    startCamera(usingFrontCamera ? 'user' : 'environment');
});

document.getElementById('capture-button').addEventListener('click', () => {
    captureImage();
});

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    localStorage.setItem("imagePhoto", imageDataUrl);
    capturedImage.src = imageDataUrl;
    capturedImage.style.display = 'block';
}

startCamera();
