import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceDetectionOptions {
  minDuration?: number; // Minimum duration in ms to count as valid speech
  volumeThreshold?: number; // 0-1, minimum volume to detect
  maxDuration?: number; // Maximum recording duration in ms
  silenceTimeout?: number; // Time in ms of silence before auto-stop
}

interface VoiceDetectionResult {
  isRecording: boolean;
  isDetected: boolean;
  volume: number;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  recordingDuration: number; // Duration of active speech in ms
  averageVolume: number; // Average volume during speech
}

export function useVoiceDetection(options: VoiceDetectionOptions = {}): VoiceDetectionResult {
  const {
    minDuration = 400,
    volumeThreshold = 0.05,
    maxDuration = 6000,
    silenceTimeout = 2000, // Auto-stop after 2 seconds of silence
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [averageVolume, setAverageVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const speechStartRef = useRef<number | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const volumeSamplesRef = useRef<number[]>([]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Calculate average volume from samples
    if (volumeSamplesRef.current.length > 0) {
      const avg = volumeSamplesRef.current.reduce((a, b) => a + b, 0) / volumeSamplesRef.current.length;
      setAverageVolume(avg);
    }

    analyserRef.current = null;
    setIsRecording(false);
    setVolume(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      setIsDetected(false);
      setRecordingDuration(0);
      setAverageVolume(0);
      recordingStartRef.current = Date.now();
      speechStartRef.current = null;
      lastSoundTimeRef.current = Date.now();
      volumeSamplesRef.current = [];

      // Set max duration timeout
      maxDurationTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, maxDuration);

      // Start volume analysis
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyzeVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const normalizedVolume = average / 255;
        
        setVolume(normalizedVolume);

        // Check for speech
        if (normalizedVolume > volumeThreshold) {
          lastSoundTimeRef.current = Date.now();
          volumeSamplesRef.current.push(normalizedVolume);
          
          // Clear silence timeout since we detected sound
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          
          if (speechStartRef.current === null) {
            speechStartRef.current = Date.now();
          } else {
            const speechDuration = Date.now() - speechStartRef.current;
            setRecordingDuration(speechDuration);
            if (speechDuration >= minDuration) {
              setIsDetected(true);
            }
          }
        } else {
          // No sound detected - check for silence timeout
          const silenceDuration = Date.now() - lastSoundTimeRef.current;
          
          // If we've already detected speech and now silent for a while, auto-stop
          if (speechStartRef.current !== null && silenceDuration >= silenceTimeout) {
            stopRecording();
            return;
          }
          
          // Reset speech start if silence is too long during recording
          if (speechStartRef.current !== null && silenceDuration > 500) {
            // Keep the detected state if we've already met minimum duration
            // but reset for new speech detection
          }
        }

        animationFrameRef.current = requestAnimationFrame(analyzeVolume);
      };

      analyzeVolume();
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  }, [isRecording, maxDuration, minDuration, volumeThreshold, silenceTimeout, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isDetected,
    volume,
    startRecording,
    stopRecording,
    toggleRecording,
    hasPermission,
    requestPermission,
    recordingDuration,
    averageVolume,
  };
}
