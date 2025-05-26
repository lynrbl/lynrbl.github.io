/*
Nom: Robel
Prenom: Lyn
Date: 26.05.2025
Projet: LedRaicer
*/
document.getElementById('save-names').addEventListener('click', saveNames);

// Fonction pour sauvegarder les noms des joueurs dans le localStorage et initialiser le tableau des scores
function saveNames() {
    const nameRouge = document.getElementById('name-rouge').value || 'Joueur 1';
    const nameBleu = document.getElementById('name-bleu').value || 'Joueur 2';

    localStorage.setItem('nameRouge', nameRouge);
    localStorage.setItem('nameBleu', nameBleu);

    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    if (!scores[nameRouge]) scores[nameRouge] = 0;
    if (!scores[nameBleu]) scores[nameBleu] = 0;
    localStorage.setItem('scores', JSON.stringify(scores));

    renderTopScores();
}

// Fonction pour afficher le tableau des scores
function renderTopScores() {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const tableBody = document.querySelector('#score-table tbody');
    tableBody.innerHTML = '';

    for (const [name, score] of sorted) {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = name;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = score;

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        tableBody.appendChild(row);
    }
}

// Affiche le classement au chargement de la page
window.addEventListener('DOMContentLoaded', renderTopScores);

