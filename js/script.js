
document.getElementById('save-names').addEventListener('click', saveNames);
function saveNames() {
    const nameRouge = document.getElementById('name-rouge').value || 'Joueur 1';
    const nameBleu = document.getElementById('name-bleu').value || 'Joueur 2';

    localStorage.setItem('nameRouge', nameRouge);
    localStorage.setItem('nameBleu', nameBleu);

    if (!localStorage.getItem('scoreRouge')) localStorage.setItem('scoreRouge', '0');
    if (!localStorage.getItem('scoreBleu')) localStorage.setItem('scoreBleu', '0');

    updateScores();
}

function updateScores() {
    document.getElementById('score-rouge').textContent = localStorage.getItem('scoreRouge') || '0';
    document.getElementById('score-bleu').textContent = localStorage.getItem('scoreBleu') || '0';
}

window.onload = updateScores;