export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};
import type { Recording } from '../store/musicStore';

export const downloadRecording = async (recording: Recording) => {
  const { name, audioData, audioUrl } = recording;
  const filename = `${name || 'recording'}.wav`;

  try {
    if (audioData) {
      // If raw audio data is present, use it
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else if (audioUrl) {
      // Fallback to downloading from the URL
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error('No audio URL or data available');
    }
  } catch (err) {
    console.error('Error downloading audio:', err);
    alert('Download failed. Please try again.');
  }
};
