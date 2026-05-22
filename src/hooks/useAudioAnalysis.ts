import { useEffect, useRef, useState } from 'react';

interface AudioAnalysisResult {
  volume: number; // 0-1
  frequency: number; // Hz
}

/**
 * Хук для реального анализа аудио из SpeechSynthesis
 * Использует Web Audio API для анализа системного аудио
 */
export const useRealAudioAnalysis = (isSpeaking: boolean) => {
  const [audioData, setAudioData] = useState<AudioAnalysisResult>({ volume: 0, frequency: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isSpeaking) {
      // Останавливаем анализ когда не говорим
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setAudioData({ volume: 0, frequency: 0 });
      return;
    }

    // Инициализируем реальный анализ аудио
    const initRealAudioAnalysis = async () => {
      try {
        // Создаем AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('Web Audio API не поддерживается');
          return;
        }

        audioContextRef.current = new AudioContextClass();
        
        // Пытаемся захватить системный аудио (экспериментальная функция)
        // В Chrome/Edge можно использовать getDisplayMedia с аудио
        try {
          // Пытаемся получить системный аудио поток
          const stream = await (navigator.mediaDevices as any).getDisplayMedia({
            video: false,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              suppressLocalAudioPlayback: false,
            } as any
          }).catch(() => null);

          if (stream && stream.getAudioTracks().length > 0) {
            mediaStreamRef.current = stream;
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            analyserRef.current.smoothingTimeConstant = 0.3;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            // Начинаем анализ
            const analyze = () => {
              if (!analyserRef.current || !dataArrayRef.current || !isSpeaking) {
                return;
              }

              analyserRef.current.getByteFrequencyData(dataArrayRef.current);
              analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

              // Вычисляем RMS (Root Mean Square) для более точной громкости
              let sumSquares = 0;
              for (let i = 0; i < dataArrayRef.current.length; i++) {
                const normalized = (dataArrayRef.current[i] - 128) / 128;
                sumSquares += normalized * normalized;
              }
              const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
              const volume = Math.min(1, rms * 3); // Усиливаем для лучшей видимости

              // Находим доминирующую частоту
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);
              let maxIndex = 0;
              let maxValue = 0;
              for (let i = 0; i < dataArrayRef.current.length; i++) {
                if (dataArrayRef.current[i] > maxValue) {
                  maxValue = dataArrayRef.current[i];
                  maxIndex = i;
                }
              }
              const nyquist = audioContextRef.current!.sampleRate / 2;
              const frequency = (maxIndex * nyquist) / dataArrayRef.current.length;

              setAudioData({
                volume: volume,
                frequency: frequency,
              });

              animationFrameRef.current = requestAnimationFrame(analyze);
            };

            analyze();
            return;
          }
        } catch (error) {
          console.log('Не удалось захватить системный аудио, используем альтернативный метод');
        }

        // Альтернативный метод: используем микрофон для анализа (если пользователь разрешит)
        // Но это не идеально, так как будет улавливать и другие звуки
        // Для демонстрации используем улучшенную симуляцию
        
      } catch (error) {
        console.error('Ошибка инициализации анализа аудио:', error);
      }
    };

    initRealAudioAnalysis();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isSpeaking]);

  return audioData;
};

/**
 * Анализ текста для создания паттернов движения рта
 * Анализирует фонемы и звуки в тексте для более точной синхронизации
 */
export const useTextBasedAnalysis = (isSpeaking: boolean, speechText?: string) => {
  const [audioData, setAudioData] = useState<AudioAnalysisResult>({ volume: 0, frequency: 0 });
  const intervalRef = useRef<number | null>(null);
  const charIndexRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!isSpeaking || !speechText) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAudioData({ volume: 0, frequency: 0 });
      charIndexRef.current = 0;
      timeRef.current = 0;
      return;
    }

    // Анализируем текст и создаем паттерны на основе фонем
    const getPhonemeVolume = (char: string, position: number): number => {
      const lowerChar = char.toLowerCase();
      
      // Гласные - широко открытый рот
      if ('аеёиоуыэюя'.includes(lowerChar)) {
        return 0.7 + Math.random() * 0.2;
      }
      // Звонкие согласные - среднее открытие
      if ('бвгджзлмнр'.includes(lowerChar)) {
        return 0.4 + Math.random() * 0.2;
      }
      // Глухие согласные - небольшое открытие
      if ('кпстфхцчшщ'.includes(lowerChar)) {
        return 0.2 + Math.random() * 0.2;
      }
      // Пробелы и знаки препинания - закрытый рот
      if (' ,.!?;:'.includes(lowerChar)) {
        return 0.1;
      }
      // По умолчанию
      return 0.3 + Math.random() * 0.3;
    };

    // Скорость речи (символов в секунду)
    const speechRate = 12; // Примерно 12 символов в секунду
    const charDuration = 1000 / speechRate; // Время на символ в мс

    intervalRef.current = setInterval(() => {
      timeRef.current += 50; // Обновляем каждые 50мс
      
      // Вычисляем текущий символ на основе времени
      const currentCharIndex = Math.floor((timeRef.current / charDuration) % speechText.length);
      const currentChar = speechText[currentCharIndex] || ' ';
      
      // Получаем громкость на основе фонемы
      const baseVolume = getPhonemeVolume(currentChar, currentCharIndex);
      
      // Добавляем плавные переходы между символами
      const nextCharIndex = (currentCharIndex + 1) % speechText.length;
      const nextChar = speechText[nextCharIndex] || ' ';
      const nextVolume = getPhonemeVolume(nextChar, nextCharIndex);
      
      const progress = (timeRef.current % charDuration) / charDuration;
      const volume = baseVolume + (nextVolume - baseVolume) * progress;
      
      // Базовая частота на основе типа звука
      const baseFreq = 'аеёиоуыэюя'.includes(currentChar.toLowerCase()) ? 250 : 200;
      const frequency = baseFreq + Math.sin(timeRef.current * 0.01) * 50;

      setAudioData({
        volume: Math.min(1, Math.max(0.1, volume)),
        frequency: frequency,
      });
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpeaking, speechText]);

  return audioData;
};

/**
 * Улучшенный анализ на основе временных паттернов речи
 * Используется как fallback, если реальный анализ аудио недоступен
 * Создает более реалистичную анимацию на основе типичных частот речи
 */
export const useSpeechPatternAnalysis = (isSpeaking: boolean) => {
  const [audioData, setAudioData] = useState<AudioAnalysisResult>({ volume: 0, frequency: 0 });
  const intervalRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!isSpeaking) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAudioData({ volume: 0, frequency: 0 });
      timeRef.current = 0;
      return;
    }

    // Создаем паттерн, имитирующий реальную речь
    // Используем комбинацию синусоидальных волн для имитации речи
    intervalRef.current = setInterval(() => {
      timeRef.current += 0.05;

      // Базовый паттерн речи (комбинация частот)
      const baseFreq = 200; // Базовая частота голоса
      const formant1 = Math.sin(timeRef.current * 8) * 0.3; // Первая форманта (гласные)
      const formant2 = Math.sin(timeRef.current * 15) * 0.2; // Вторая форманта
      const formant3 = Math.sin(timeRef.current * 25) * 0.1; // Третья форманта

      // Имитируем вариации громкости (как в реальной речи)
      const volumeVariation = 0.5 + Math.sin(timeRef.current * 6) * 0.3 + 
                             Math.sin(timeRef.current * 12) * 0.15 +
                             Math.sin(timeRef.current * 20) * 0.05;

      // Добавляем случайные всплески для более естественного звучания
      const randomBurst = Math.random() < 0.1 ? Math.random() * 0.3 : 0;

      const volume = Math.min(1, Math.max(0, volumeVariation + randomBurst));
      const frequency = baseFreq + formant1 * 100 + formant2 * 50 + formant3 * 25;

      setAudioData({
        volume: volume,
        frequency: frequency,
      });
    }, 50); // Обновляем каждые 50мс для плавной анимации

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpeaking]);

  return audioData;
};
