// DOM Elements
const startBtn = document.getElementById('start-record');
const stopBtn = document.getElementById('stop-record');
const statusDiv = document.getElementById('status');
const transcriptionsList = document.getElementById('transcriptions');

let mediaRecorder;
let audioChunks = [];

// API Key and URLs
const API_KEY = '4JXuZq6cpFRZRpUNg7ZGkpn5ikWnxarDrI0T4P5lbs6rcuhX7LRTUumzS9pEZF-zW7I51_EIupOLtOzp';
const TRANSCRIPTION_URL = 'https://api.infomaniak.com/1/ai/272/openai/audio/transcriptions';
const RESULTS_URL = 'https://api.infomaniak.com/1/ai/272/results';

// Start recording
startBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      audioChunks = [];
      statusDiv.textContent = 'Recording...';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    };

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      statusDiv.textContent = 'Uploading...';
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      sendAudioToAPI(audioBlob);
    };

    mediaRecorder.start();
  } catch (error) {
    console.error('Error accessing microphone:', error);
    statusDiv.textContent = 'Microphone access denied!';
  }
});

// Stop recording
stopBtn.addEventListener('click', () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    stopBtn.disabled = true;
    startBtn.disabled = false;
  }
});

// Send audio to API
async function sendAudioToAPI(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper');

  try {
    const response = await fetch(TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    const { batch_id } = await response.json();
    statusDiv.textContent = 'Processing...';
    pollForResult(batch_id);
  } catch (error) {
    console.error('Error sending audio to API:', error);
    statusDiv.textContent = 'Error uploading audio!';
  }
}

// Poll for transcription result
async function pollForResult(batchId) {
  try {
    const response = await fetch(`${RESULTS_URL}/${batchId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = await response.json();

    if (result.status === 'success') {
      const transcription = await fetch(result.url).then((res) => res.text());
      displayTranscription(transcription);
    } else if (result.status === 'processing') {
      setTimeout(() => pollForResult(batchId), 2000);
    } else {
      statusDiv.textContent = 'Error processing transcription!';
    }
  } catch (error) {
    console.error('Error polling transcription result:', error);
    statusDiv.textContent = 'Error retrieving transcription!';
  }
}

// Display transcription
function displayTranscription(transcription) {
  const listItem = document.createElement('li');
  listItem.textContent = transcription;
  transcriptionsList.appendChild(listItem);
  statusDiv.textContent = 'Ready to record';
}
