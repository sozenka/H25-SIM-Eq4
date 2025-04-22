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
  let buffer: ArrayBuffer | null = null;

  if (!recording.audioData) {
    alert("No audio data available for this recording.");
    return;
  }

  if (recording.audioData instanceof ArrayBuffer) {
    buffer = recording.audioData;
  } else if (typeof recording.audioData === "string") {
    try {
      buffer = base64ToBuffer(recording.audioData);
    } catch (error) {
      console.error("Error decoding base64 audio data:", error);
      alert("Failed to decode audio data.");
      return;
    }
  }

  if (!buffer) {
    alert("Audio data format not recognized.");
    return;
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${recording.name}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}; 