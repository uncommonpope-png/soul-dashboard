import { useState, useRef, useCallback } from 'react';
import { screenRecorder, type RecordingQuality, type RecordingFPS } from '@/lib/screenRecord';
import { useDashboardStore } from '@/store/useDashboardStore';

type RecorderState = 'idle' | 'recording' | 'preview';

export default function ScreenRecorder() {
  const { isRecording, setIsRecording } = useDashboardStore();
  const [state, setState] = useState<RecorderState>('idle');
  const [quality, setQuality] = useState<RecordingQuality>('1080p');
  const [fps, setFps] = useState<RecordingFPS>(30);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const start = useCallback(async () => {
    const target = document.querySelector('canvas')?.parentElement as HTMLElement;
    if (!target) return;

    try {
      await screenRecorder.start(target, { quality, fps });
      setState('recording');
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [quality, fps, setIsRecording]);

  const stop = useCallback(async () => {
    const recordedBlob = await screenRecorder.stop();
    setBlob(recordedBlob);
    setState('preview');
    setIsRecording(false);
    setDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [setIsRecording]);

  const download = useCallback(() => {
    if (!blob) return;
    screenRecorder.download(blob);
  }, [blob]);

  const reset = useCallback(() => {
    setBlob(null);
    setState('idle');
    setDuration(0);
  }, []);

  const formatDuration = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between flex-shrink-0'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          Recorder
        </h2>
        {state === 'recording' && (
          <div className='flex items-center gap-1'>
            <span className='w-2 h-2 rounded-full bg-plasma-red animate-pulse' />
            <span className='text-[9px] font-space text-plasma-red'>
              {formatDuration(duration)}
            </span>
          </div>
        )}
      </div>

      <div className='flex-1 flex items-center justify-center'>
        {state === 'idle' && (
          <div className='text-center space-y-3'>
            <div className='flex gap-2 justify-center'>
              <div className='flex flex-col gap-1'>
                <label className='text-[8px] text-text-muted font-jetbrains'>Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as RecordingQuality)}
                  className='bg-black/40 border border-plasma-cyan/20 rounded px-1 py-0.5 text-[8px] text-text-primary font-jetbrains'
                >
                  <option value='720p'>720p</option>
                  <option value='1080p'>1080p</option>
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-[8px] text-text-muted font-jetbrains'>FPS</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value) as RecordingFPS)}
                  className='bg-black/40 border border-plasma-cyan/20 rounded px-1 py-0.5 text-[8px] text-text-primary font-jetbrains'
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>
            <button
              onClick={start}
              className='px-4 py-2 bg-plasma-red/20 border border-plasma-red/40 rounded text-[10px] font-jetbrains text-plasma-red hover:bg-plasma-red/30 transition-colors'
            >
              ● Record
            </button>
          </div>
        )}

        {state === 'recording' && (
          <button
            onClick={stop}
            className='px-6 py-3 bg-plasma-red/20 border border-plasma-red/40 rounded-lg text-[10px] font-jetbrains text-plasma-red hover:bg-plasma-red/30 transition-colors animate-pulse'
          >
            ■ Stop Recording
          </button>
        )}

        {state === 'preview' && blob && (
          <div className='text-center space-y-2'>
            <p className='text-[9px] text-text-muted font-jetbrains'>
              {formatDuration(duration)} recorded
            </p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={download}
                className='px-3 py-1.5 bg-plasma-green/20 border border-plasma-green/40 rounded text-[9px] font-jetbrains text-plasma-green hover:bg-plasma-green/30'
              >
                Download
              </button>
              <button
                onClick={reset}
                className='px-3 py-1.5 bg-white/5 border border-white/20 rounded text-[9px] font-jetbrains text-text-muted hover:bg-white/10'
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}