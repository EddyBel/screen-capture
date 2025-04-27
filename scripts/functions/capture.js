import {
  $ButtonStartCapture,
  $DownloadLink,
  $PreviewVideo,
  getCheckboxCaptureAudio,
  getFrameRate,
  getResolution,
  getInputNameVideo,
  getAudioSource,
  $InputNameVideo,
} from '../elements.js';

/**
 * Default capture configuration object.
 * Specifies the default settings for audio capture, audio source, frame rate, and resolution.
 * @type {{ audio: boolean; audioSource: 'microphone'|'system'; fps: number; resolution: 'highest'|{width:number,height:number} }}
 */
const defaultConfig = {
  audio: true,
  audioSource: 'system', // 'system' or 'microphone'
  fps: 60,
  resolution: 'highest', // 'highest' or { width, height }
};

/**
 * Retrieves the current capture configuration from the user interface controls.
 * This function reads values from UI elements like checkboxes and input fields to configure
 * the screen and audio capture.
 *
 * @returns {{ audio: boolean; audioSource: 'microphone'|'system'; fps: number; resolution: 'highest'|{width:number,height:number} }}
 * The capture configuration with values from the UI.
 */
function getConfig() {
  const audio = getCheckboxCaptureAudio();
  const audioSource = getAudioSource();
  const fps = getFrameRate();
  const resolution = getResolution() || 'highest';

  console.log(audio, audioSource, fps, resolution);

  return { audio, audioSource, fps, resolution };
}

/**
 * Verifies the necessary permissions for audio capture, including microphone access.
 * If microphone audio capture is selected, it asks for permission to access the microphone.
 *
 * @param {Object} config - The capture configuration object.
 * @param {boolean} config.audio - Indicates if audio capture is enabled.
 * @param {string} config.audioSource - The selected audio source ('microphone' or 'system').
 * @throws {Error} Throws an error if permission is not granted for microphone access.
 */
async function verifyPermissions(config) {
  try {
    // If microphone capture is selected, request permission for audio
    if (config.audio && config.audioSource === 'microphone') {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch (err) {
    throw new Error('No se pudo obtener permiso para el micrófono.');
  }
}

/**
 * Starts the screen capture process when the user clicks the capture button.
 * This function checks user settings, verifies permissions, and initiates the capture of
 * the screen and microphone (if applicable), then handles the recording and saving of the video.
 *
 * @listens {click} $ButtonStartCapture - Starts the screen capture process when clicked.
 */
$ButtonStartCapture.addEventListener('click', async () => {
  const userConfig = getConfig();
  const config = { ...defaultConfig, ...userConfig };

  try {
    // Verify permissions for capturing audio if necessary
    await verifyPermissions(config);

    const displayOpts = {
      video: {
        frameRate: { ideal: config.fps },
        ...(config.resolution !== 'highest'
          ? { width: config.resolution.width, height: config.resolution.height }
          : {}),
      },
      audio: config.audio && config.audioSource === 'system',
    };

    // Get the screen media stream
    const displayStream = await navigator.mediaDevices.getDisplayMedia(displayOpts);
    let micStream = null;
    let combinedStream = displayStream;

    // If microphone audio is enabled, get the microphone stream and combine with screen stream
    if (config.audio && config.audioSource === 'microphone') {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      combinedStream = new MediaStream([...displayStream.getVideoTracks(), ...micStream.getAudioTracks()]);
    } else {
      // Warn the user if the system audio is not captured
      const hasAudio = displayStream.getAudioTracks().length > 0;
      if (config.audio && config.audioSource === 'system' && !hasAudio) {
        alert(
          'Atención: No se capturó el audio del sistema. Asegúrate de seleccionar "Compartir audio" al compartir pantalla.',
        );
      }
    }

    // Create a MediaRecorder instance to record the stream
    const recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    const chunks = [];
    recorder.addEventListener('dataavailable', (e) => chunks.push(e.data));

    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Set the preview video source and autoplay
      $PreviewVideo.src = url;
      $PreviewVideo.autoplay = true;

      // Assign a default video name if not specified
      let name = getInputNameVideo() || 'captura';

      // Update the download link with the recorded video URL and file name
      $DownloadLink.href = url;
      $DownloadLink.download = `${name}.webm`;

      // Stop the media tracks to release resources
      displayStream.getTracks().forEach((track) => track.stop());
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
    });

    // Start the recording process
    recorder.start();

    // Stop recording when the user stops sharing the screen
    const [videoTrack] = displayStream.getVideoTracks();
    videoTrack.addEventListener('ended', () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    });
  } catch (err) {
    console.error('Error al iniciar la captura:', err);
    alert(err.message);
  }
});

/**
 * Allows the user to change the name of the video file during recording.
 * This function updates the download link with the new name whenever the user
 * modifies the input field for the video name.
 *
 * @listens {input} $InputNameVideo - Changes the video file name when the user types in the input field.
 */
$InputNameVideo.addEventListener('input', (event) => {
  const newName = event.target.value.trim();
  const currentUrl = $DownloadLink.href; // Keep the download link intact

  if (newName) {
    $DownloadLink.download = `${newName}.webm`; // Update the file name
  } else {
    $DownloadLink.download = 'captura.webm'; // Default name if empty
  }
});
