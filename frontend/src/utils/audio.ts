export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};

export const downloadRecording = (recording: {
  name: string;
  audioData?: ArrayBuffer | string;
}) => {
  if (!recording.audioData) {
    alert("No audio data available for this recording.");
    return;
  }

  try {
    const audioData = typeof recording.audioData === 'string'
      ? base64ToBuffer(recording.audioData)
      : recording.audioData;

    const blob = new Blob([audioData], { type: 'audio/webm;codecs=opus' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading recording:', error);
    alert('Failed to download recording. Please try again.');
  }
};