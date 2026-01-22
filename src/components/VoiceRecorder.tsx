import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { Mic, Square, Loader2 } from 'lucide-react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onResult: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onResult, className }: VoiceRecorderProps) {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 frequency bands for visualization
    const levels: number[] = [];
    const bandSize = Math.floor(dataArray.length / 20);
    
    for (let i = 0; i < 20; i++) {
      let sum = 0;
      for (let j = 0; j < bandSize; j++) {
        sum += dataArray[i * bandSize + j];
      }
      const avg = sum / bandSize;
      // Normalize to 0-1 range with some amplification
      levels.push(Math.min(1, (avg / 255) * 2));
    }
    
    setAudioLevels(levels);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup media recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start visualization
      updateAudioLevels();
      
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setAudioLevels(new Array(20).fill(0));
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        try {
          const { text } = await blink.ai.transcribeAudio({
            audio: base64,
            language: 'ru'
          });
          
          if (text) {
            onResult(text);
            toast.success('Голос распознан');
          } else {
            toast.error('Не удалось распознать речь');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Ошибка распознавания');
        } finally {
          setIsTranscribing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Audio processing error:', error);
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Waveform visualization */}
      {(isRecording || isTranscribing) && (
        <div className="flex items-center justify-center gap-[3px] h-16 w-full max-w-xs px-4">
          {audioLevels.map((level, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75",
                isRecording ? "bg-red-500" : "bg-primary"
              )}
              style={{
                height: `${Math.max(8, level * 48 + 8)}px`,
                opacity: isRecording ? 0.5 + level * 0.5 : 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* Timer */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm font-bold text-red-500">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {/* Record button */}
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={cn(
          "h-14 px-6 rounded-2xl font-bold transition-all",
          isRecording && "animate-pulse"
        )}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Распознаю...
          </>
        ) : isRecording ? (
          <>
            <Square className="h-5 w-5 mr-2" />
            Остановить
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            Записать голос
          </>
        )}
      </Button>

      {/* Help text */}
      {!isRecording && !isTranscribing && (
        <p className="text-xs text-muted-foreground text-center">
          Нажмите для записи голосового сообщения
        </p>
      )}
    </div>
  );
}
