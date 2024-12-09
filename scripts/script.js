"use strict";

const map = L.map('map').setView([46.2044, 6.1432], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const newMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup(`<div class="w3-container"><h3>Détails de l'Objet Caché</h3> <p>nduwabudbwaobd</p> </div>`)
    .openPopup();
    
});

let currentStream;
let usingFrontCamera = true;
const videoElement = document.getElementById('video');
const capturedImage = document.getElementById('captured-image');

async function startCamera(facingMode = 'user') {
    console.log("camera");
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
    console.log("capture une image");
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
