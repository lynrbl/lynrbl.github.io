const boutonDemarrer = document.getElementById('start-record');
const boutonArreter = document.getElementById('stop-record');
const divStatut = document.getElementById('status');
const listeTranscriptions = document.getElementById('transcriptions');

let enregistreurMedia;
let morceauxAudio = [];

const CLE_API = '4JXuZq6cpFRZRpUNg7ZGkpn5ikWnxarDrI0T4P5lbs6rcuhX7LRTUumzS9pEZF-zW7I51_EIupOLtOzp';
const URL_TRANSCRIPTION = 'https://api.infomaniak.com/1/ai/272/openai/audio/transcriptions';
const URL_RESULTATS = 'https://api.infomaniak.com/1/ai/272/results';

boutonDemarrer.addEventListener('click', async () => {
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true });

    enregistreurMedia = new MediaRecorder(flux);


    enregistreurMedia.onstart = () => {
      morceauxAudio = [];
      divStatut.textContent = 'Enregistrement en cours...';
      boutonDemarrer.disabled = true;
      boutonArreter.disabled = false;
    };

    enregistreurMedia.ondataavailable = (evenement) => {
      morceauxAudio.push(evenement.data);
    };

    enregistreurMedia.onstop = () => {
      divStatut.textContent = 'Téléchargement du fichier audio...';
      const audioBlob = new Blob(morceauxAudio, { type: 'audio/wav' });
      envoyerAudioVersAPI(audioBlob);
    };

    enregistreurMedia.start();
  } catch (erreur) {
    console.error('Erreur d\'accès au microphone :', erreur);
    divStatut.textContent = 'Erreur : Microphone inaccessible.';
  }
});

boutonArreter.addEventListener('click', () => {
  if (enregistreurMedia) {
    enregistreurMedia.stop();
    boutonArreter.disabled = true;
    boutonDemarrer.disabled = false;
  }
});

async function envoyerAudioVersAPI(audioBlob) {

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper');

  try {
    const reponse = await fetch(URL_TRANSCRIPTION, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLE_API}`, 
      },
      body: formData,
    });

    const { batch_id } = await reponse.json(); 
    divStatut.textContent = 'Traitement de l\'audio...';
    verifierResultat(batch_id); 
  } catch (erreur) {
    console.error('Erreur lors de l\'envoi de l\'audio :', erreur);
    divStatut.textContent = 'Erreur : Impossible d\'envoyer l\'audio.';
  }
}

async function verifierResultat(batchId) {
  try {
    const reponse = await fetch(`${URL_RESULTATS}/${batchId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CLE_API}`,
      },
    });

    const resultat = await reponse.json();

    if (resultat.status === 'success') {
      const transcription = await fetch(resultat.url).then((res) => res.text());
      afficherTranscription(transcription);
    } else if (resultat.status === 'processing') {

      setTimeout(() => verifierResultat(batchId), 2000);
    } else {
      divStatut.textContent = 'Erreur : Impossible de traiter la transcription.';
    }
  } catch (erreur) {
    console.error('Erreur lors de la vérification :', erreur);
    divStatut.textContent = 'Erreur : Problème de récupération des résultats.';
  }
}


function afficherTranscription(transcription) {
  const itemListe = document.createElement('li');
  itemListe.textContent = transcription;
  listeTranscriptions.appendChild(itemListe);
  divStatut.textContent = 'Prêt à enregistrer'; 
}
