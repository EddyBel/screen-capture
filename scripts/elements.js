import { $, $$ } from './utils.js';

export const $ButtonStartCapture = $('#button-start-capture');
export const $PreviewVideo = $('#preview-video');
export const $DownloadLink = $('#button-download');
export const $InputNameVideo = $('#input-name-video');
export const $ButtonStopCapture = $('#button-stop-capture');
export const $SelectResolution = $('#select-resolution');
export const $SelectFrameRate = $('#select-frame-rate');
export const $CheckboxCaptureAudio = $('#checkbox-capture-audio');
export const $SelectAudioSource = $('#select-audio-source');
export const $VideoFormatSelect = $('#videoFormatSelect');

/**
 * Devuelve true si el checkbox de audio está marcado
 * @returns {boolean}
 */
export function getCheckboxCaptureAudio() {
  return $CheckboxCaptureAudio ? $CheckboxCaptureAudio.checked : false;
}

/**
 * Obtiene los FPS seleccionados y los convierte a número
 * @returns {number|undefined}
 */
export function getFrameRate() {
  if (!$SelectFrameRate) return undefined;
  const value = $SelectFrameRate.value;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Obtiene el audio source seleccionado
 * @returns {string}
 */
export function getAudioSource() {
  return $SelectAudioSource ? $SelectAudioSource.value : 'system';
}

/**
 * Obtiene la resolución seleccionada: 'highest' o { width, height }
 * @returns {'highest'|{width:number,height:number}|undefined}
 */
export function getResolution() {
  if (!$SelectResolution) return undefined;
  const value = $SelectResolution.value;
  if (value === 'Default' || value === 'highest') return 'highest';
  const [w, h] = value.split('x').map((n) => parseInt(n, 10));
  return !Number.isNaN(w) && !Number.isNaN(h) ? { width: w, height: h } : undefined;
}

/**
 * Obtiene el formato de video seleccionado
 * @returns {string}
 */
export function getVideoFormat() {
  return $VideoFormatSelect ? $VideoFormatSelect.value : 'webm';
}

/**
 * Establece la resolución en el select
 * @param {'highest'|{width:number,height:number}} res
 */
export function setResolution(res) {
  if (!$SelectResolution) return;
  if (res === 'highest') {
    $SelectResolution.value = 'highest';
  } else {
    $SelectResolution.value = `${res.width}x${res.height}`;
  }
}

/**
 * Establece FPS en el select
 * @param {number} fps
 */
export function setFrameRate(fps) {
  if (!$SelectFrameRate) return;
  $SelectFrameRate.value = `${fps}`;
}

/**
 * Establece estado del checkbox de audio
 * @param {boolean} captureAudio
 */
export function setCheckboxCaptureAudio(captureAudio) {
  if (!$CheckboxCaptureAudio) return;
  $CheckboxCaptureAudio.checked = captureAudio;
}

/**
 * Obtiene el nombre de video ingresado
 * @returns {string}
 */
export function getInputNameVideo() {
  return $InputNameVideo ? $InputNameVideo.value.trim() : '';
}

/**
 * Establece el nombre del video
 * @param {string} name
 */
export function setInputNameVideo(name) {
  if (!$InputNameVideo) return;
  $InputNameVideo.value = name;
}

/**
 * Devuelve el botón de iniciar captura
 */
export function getButtonStartCapture() {
  return $ButtonStartCapture;
}

/**
 * Devuelve el botón de detener captura
 */
export function getButtonStopCapture() {
  return $ButtonStopCapture;
}
