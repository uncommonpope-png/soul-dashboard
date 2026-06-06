export type RecordingQuality = '720p' | '1080p';
export type RecordingFPS = 15 | 30;

interface RecordingOptions {
  quality: RecordingQuality;
  fps: RecordingFPS;
}

const QUALITY_SIZES = {
  '720p': [1280, 720],
  '1080p': [1920, 1080],
} as const;

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;

  async start(
    targetElement: HTMLElement,
    options: RecordingOptions = { quality: '1080p', fps: 30 }
  ): Promise<void> {
    const [width, height] = QUALITY_SIZES[options.quality];

    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width, height, frameRate: { ideal: options.fps } },
      audio: false,
    });

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000,
    });

    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start(100);
    this.startTime = Date.now();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([], { type: 'video/webm' }));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;
        this.mediaRecorder = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  download(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `soul-dashboard-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getDuration(): number {
    return this.startTime > 0 ? (Date.now() - this.startTime) / 1000 : 0;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export const screenRecorder = new ScreenRecorder();