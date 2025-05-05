export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};
// use this in audio.ts or wherever it's imported from
import type { Recording } from '../store/musicStore'; // if it's in another file

export const downloadRecording = async (recording: Recording) => {
  if (!recording.audioUrl) {
    alert("No audio URL found for this recording.");
    return;
  }

  try {
    const response = await fetch(recording.audioUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name || 'recording'}.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading audio:', err);
    alert('Download failed.');
  }
};
