// Sélection des éléments HTML
const boutonDemarrer = document.getElementById('start-record');
const boutonArreter = document.getElementById('stop-record');
const divStatut = document.getElementById('status');
const listeTranscriptions = document.getElementById('transcriptions');

// Variables globales pour gérer l'enregistrement audio
let enregistreurMedia; // Permet d'enregistrer l'audio
let morceauxAudio = []; // Stocke les morceaux d'audio enregistrés

// Clé API et URLs de l'API Infomaniak
const CLE_API = '4JXuZq6cpFRZRpUNg7ZGkpn5ikWnxarDrI0T4P5lbs6rcuhX7LRTUumzS9pEZF-zW7I51_EIupOLtOzp';
const URL_TRANSCRIPTION = 'https://api.infomaniak.com/1/ai/272/openai/audio/transcriptions';
const URL_RESULTATS = 'https://api.infomaniak.com/1/ai/272/results';

// Quand l'utilisateur clique sur "Démarrer l'enregistrement"
boutonDemarrer.addEventListener('click', async () => {
  try {
    // Demande d'accès au microphone
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Création d'un enregistreur à partir du flux audio
    enregistreurMedia = new MediaRecorder(flux);

    // Quand l'enregistrement commence
    enregistreurMedia.onstart = () => {
      morceauxAudio = []; // Réinitialiser les morceaux d'audio
      divStatut.textContent = 'Enregistrement en cours...'; // Met à jour le statut
      boutonDemarrer.disabled = true; // Désactive le bouton "Démarrer"
      boutonArreter.disabled = false; // Active le bouton "Arrêter"
    };

    // Quand des données audio sont disponibles
    enregistreurMedia.ondataavailable = (evenement) => {
      morceauxAudio.push(evenement.data); // Ajoute les morceaux audio
    };

    // Quand l'enregistrement s'arrête
    enregistreurMedia.onstop = () => {
      divStatut.textContent = 'Téléchargement du fichier audio...'; // Met à jour le statut
      const audioBlob = new Blob(morceauxAudio, { type: 'audio/wav' }); // Crée un fichier audio
      envoyerAudioVersAPI(audioBlob); // Envoie l'audio à l'API
    };

    enregistreurMedia.start(); // Démarre l'enregistrement
  } catch (erreur) {
    // En cas d'erreur, afficher un message
    console.error('Erreur d\'accès au microphone :', erreur);
    divStatut.textContent = 'Erreur : Microphone inaccessible.';
  }
});

// Quand l'utilisateur clique sur "Arrêter l'enregistrement"
boutonArreter.addEventListener('click', () => {
  if (enregistreurMedia) {
    enregistreurMedia.stop(); // Arrête l'enregistrement
    boutonArreter.disabled = true; // Désactive le bouton "Arrêter"
    boutonDemarrer.disabled = false; // Active le bouton "Démarrer"
  }
});

// Fonction pour envoyer l'audio à l'API Infomaniak
async function envoyerAudioVersAPI(audioBlob) {
  // Préparer les données pour l'API
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper'); // Modèle utilisé pour la transcription

  try {
    // Envoyer une requête POST à l'API
    const reponse = await fetch(URL_TRANSCRIPTION, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLE_API}`, // Ajoute la clé API
      },
      body: formData,
    });

    const { batch_id } = await reponse.json(); // Récupère l'identifiant de traitement
    divStatut.textContent = 'Traitement de l\'audio...'; // Met à jour le statut
    verifierResultat(batch_id); // Vérifie le statut de la transcription
  } catch (erreur) {
    console.error('Erreur lors de l\'envoi de l\'audio :', erreur);
    divStatut.textContent = 'Erreur : Impossible d\'envoyer l\'audio.';
  }
}

// Fonction pour vérifier si la transcription est terminée
async function verifierResultat(batchId) {
  try {
    // Envoyer une requête GET pour vérifier le statut
    const reponse = await fetch(`${URL_RESULTATS}/${batchId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CLE_API}`, // Ajoute la clé API
      },
    });

    const resultat = await reponse.json();

    if (resultat.status === 'success') {
      // Si la transcription est prête
      const transcription = await fetch(resultat.url).then((res) => res.text());
      afficherTranscription(transcription); // Affiche la transcription
    } else if (resultat.status === 'processing') {
      // Si la transcription est encore en cours, réessayer après 2 secondes
      setTimeout(() => verifierResultat(batchId), 2000);
    } else {
      divStatut.textContent = 'Erreur : Impossible de traiter la transcription.';
    }
  } catch (erreur) {
    console.error('Erreur lors de la vérification :', erreur);
    divStatut.textContent = 'Erreur : Problème de récupération des résultats.';
  }
}

// Fonction pour afficher la transcription dans la liste
function afficherTranscription(transcription) {
  const itemListe = document.createElement('li'); // Crée un élément de liste
  itemListe.textContent = transcription; // Ajoute la transcription au texte
  listeTranscriptions.appendChild(itemListe); // Ajoute l'élément à la liste
  divStatut.textContent = 'Prêt à enregistrer'; // Met à jour le statut
}
