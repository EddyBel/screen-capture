import { $ButtonStartCapture, $DownloadLink, $PreviewVideo, $PreviewVideoBlur, $InputNameVideo } from '../elements.js';

$ButtonStartCapture.addEventListener('click', async () => {
  // Iniciar la captura de pantalla
  const media = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30 } },
  });

  // Crear un MediaRecorder para grabar la captura
  const mediarecorder = new MediaRecorder(media, {
    mimeType: 'video/webm;codecs=vp8,opus',
  });

  // Crear un array para almacenar los fragmentos del video
  const chunks = [];

  // Cuando haya datos disponibles (fragmentos de video), se añaden a chunks
  mediarecorder.addEventListener('dataavailable', (e) => {
    chunks.push(e.data);
  });

  // Cuando se detenga la grabación, se crea un blob del video y se muestra la vista previa
  mediarecorder.addEventListener('stop', () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);

    // Asignar el src de los videos
    $PreviewVideo.src = videoURL;
    $PreviewVideoBlur.src = videoURL;

    // Configurar controles y autoplay
    $PreviewVideo.controls = false;
    $PreviewVideo.autoplay = true;
    $PreviewVideoBlur.controls = true;
    $PreviewVideoBlur.autoplay = true;

    // // Crear un enlace para descargar el video
    // const nameVideo = $InputNameVideo.value || "captura"
    // const extension = "webm"
    // const videoURLDownload = `${nameVideo}.${extension}`
    $DownloadLink.href = videoURL;
    $DownloadLink.download = 'captura.webm';
  });

  // Iniciar la grabación
  mediarecorder.start();

  // Detener la grabación cuando el usuario deje de compartir pantalla
  const [video] = media.getVideoTracks();
  video.addEventListener('ended', () => {
    mediarecorder.stop();
  });
});

// Sincronizar los videos
syncVideos($PreviewVideoBlur, $PreviewVideo);

function syncVideos(video1, video2) {
  const sync = (src, target) => {
    target.currentTime = src.currentTime;
    if (src.paused && !target.paused) target.pause();
    if (!src.paused && target.paused) target.play();
    if (src.playbackRate !== target.playbackRate) {
      target.playbackRate = src.playbackRate;
    }
  };

  video1.addEventListener('timeupdate', () => sync(video1, video2));
  video1.addEventListener('play', () => video2.play());
  video1.addEventListener('pause', () => video2.pause());
  video1.addEventListener('seeked', () => (video2.currentTime = video1.currentTime));
  video1.addEventListener('ratechange', () => (video2.playbackRate = video1.playbackRate));
}
