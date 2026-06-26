'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

// ─── ИНТЕРФЕЙСЫ И ТИПЫ ──────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

interface AiAssistantProps {
  onCatalogSelect?: (catalog: any) => void;
}

// ─── УТИЛИТА: ОЧИСТКА MARKDOWN ДЛЯ TTS ──────────────────────────────────────
const cleanTextForSpeech = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

// ─── ВСТРОЕННЫЙ ХУК useAiChat ───────────────────────────────────────────────
function useAiChatInternal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/health');
      const data = await res.json();
      setIsConnected(data.connected);
      return data.connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      setIsLoading(true);
      setStreamText('');
      setProducts([]);

      const userMsg: ChatMessage = { role: 'user', content: userMessage };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: messages
              .filter((m) => m.role !== 'system')
              .slice(-6),
          }),
        });

        if (!res.ok) throw new Error('Ошибка сервера');

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'products') {
                setProducts(event.data);
              } else if (event.type === 'text') {
                fullText += event.data;
                setStreamText(fullText);
              } else if (event.type === 'done') {
                setMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: fullText },
                ]);
                setStreamText('');
              } else if (event.type === 'error') {
                throw new Error(event.data);
              }
            } catch (parseErr) {
              // пропускаем неполные чанки
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Ошибка: ${error.message || 'Не удалось получить ответ'}`,
            },
          ]);
        }
      } finally {
        setIsLoading(false);
        setStreamText('');
      }
    },
    [messages, isLoading],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamText('');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setProducts([]);
  }, []);

  return {
    messages,
    products,
    isLoading,
    streamText,
    isConnected,
    sendMessage,
    stopGeneration,
    clearMessages,
    checkConnection,
  };
}

// ─── ОСНОВНОЙ КОМПОНЕНТ ─────────────────────────────────────────────────────
const AIRec: React.FC<AiAssistantProps> = ({ onCatalogSelect }) => {
  const { t } = useTranslation('common');
  const { toast, showWarning, hideToast } = useToast();

  // Используем хук, объявленный прямо в этом файле
  const {
    messages,
    products,
    isLoading,
    streamText,
    isConnected,
    sendMessage,
    stopGeneration,
    checkConnection,
  } = useAiChatInternal();

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentSpeechText, setCurrentSpeechText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const waveRef = useRef<number>(0);
  const [waveBars, setWaveBars] = useState<number[]>(Array(20).fill(8));

  // Проверка подключения при маунте
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  // Анимация волны
  useEffect(() => {
    if (isSpeaking) {
      const animate = () => {
        setWaveBars(
          Array.from({ length: 20 }, (_, i) => {
            const t = Date.now() * 0.005;
            return Math.max(8, Math.min(60, 30 + Math.sin(t + i * 0.4) * 22));
          }),
        );
        waveRef.current = requestAnimationFrame(animate);
      };
      waveRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(waveRef.current);
      setWaveBars(Array(20).fill(8));
    }
    return () => cancelAnimationFrame(waveRef.current);
  }, [isSpeaking]);

  // Инициализация Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.onresult = (e: any) => {
        setInputMessage(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const load = () => synthRef.current?.getVoices();
      load();
      if (synthRef.current) synthRef.current.onvoiceschanged = load;
    }

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  // TTS воспроизведение
  const speakText = useCallback(
    (text: string) => {
      if (!isSoundEnabled || !synthRef.current) return;
      synthRef.current.cancel();

      const clean = cleanTextForSpeech(text);
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const preferred = ['Google русский', 'Microsoft Irina', 'Microsoft Katya', 'Anna', 'Milena'];
      const voice =
        voices.find((v) => preferred.some((p) => v.name.includes(p)) && v.lang.startsWith('ru')) ||
        voices.find((v) => v.lang.startsWith('ru'));
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeechText(clean);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeechText('');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeechText('');
      };

      setTimeout(() => synthRef.current?.speak(utterance), 100);
    },
    [isSoundEnabled],
  );

  // Автовоспроизведение ответов
  const lastAssistantMsgRef = useRef('');
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && last.content !== lastAssistantMsgRef.current) {
      lastAssistantMsgRef.current = last.content;
      speakText(last.content);
    }
  }, [messages, speakText]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendMessage(msg);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      showWarning('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      if (prev) {
        synthRef.current?.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  };

  return (
    <Box className={styles.container}>
      <Grid container spacing={3}>
        {/* Чат */}
        <Grid item xs={12} md={8}>
          <Paper className={styles.chatContainer}>
            <Box className={styles.chatHeader}>
              <Typography variant="h6" fontWeight="bold">
                {t('aiAssistant.title')}
              </Typography>
              {isConnected !== null && (
                <Chip
                  label={
                    isConnected
                      ? t('aiAssistant.status.connected')
                      : t('aiAssistant.status.disconnected')
                  }
                  color={isConnected ? 'success' : 'error'}
                  size="small"
                />
              )}
            </Box>

            <Box className={styles.messagesContainer}>
              {messages
                .filter((m) => m.role !== 'system')
                .map((m, i) => (
                  <Box
                    key={i}
                    className={`${styles.message} ${
                      m.role === 'user' ? styles.userMessage : styles.assistantMessage
                    }`}
                  >
                    <Typography variant="body2" className={styles.messageText}>
                      {m.content}
                    </Typography>
                  </Box>
                ))}

              {streamText && (
                <Box className={`${styles.message} ${styles.assistantMessage}`}>
                  <Typography variant="body2" className={styles.messageText}>
                    {streamText}
                    <span style={{ animation: 'blink 1s step-end infinite' }}>▍</span>
                  </Typography>
                </Box>
              )}

              {isLoading && !streamText && (
                <Box className={`${styles.message} ${styles.assistantMessage}`}>
                  <CircularProgress size={20} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {products.length > 0 && (
              <Box className={styles.suggestedCatalogs}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  {t('aiAssistant.catalog.recommended')}
                </Typography>
                <Grid container spacing={2}>
                  {products.map((p) => (
                    <FavoriteItem key={p.id} catalog={p} />
                  ))}
                </Grid>
              </Box>
            )}

            <Box className={styles.inputContainer}>
              <TextField
                fullWidth
                placeholder={t('aiAssistant.chat.placeholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton
                color={isListening ? 'error' : 'primary'}
                onClick={handleVoiceInput}
                disabled={isLoading}
              >
                {isListening ? <StopIcon /> : <MicIcon />}
              </IconButton>
              {isLoading ? (
                <IconButton color="error" onClick={stopGeneration}>
                  <StopIcon />
                </IconButton>
              ) : (
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!inputMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Визуализация голоса */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '3px',
                height: 80,
              }}
            >
              {waveBars.map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 5,
                    height: `${h}px`,
                    backgroundColor: isSpeaking ? '#667eea' : '#e0e0e0',
                    borderRadius: 2.5,
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </Box>

            {isSpeaking && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  🔊 {t('aiAssistant.voice.speaking')}
                </Typography>
                {currentSpeechText && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {currentSpeechText.substring(0, 50)}...
                  </Typography>
                )}
              </Box>
            )}

            <IconButton
              color={isSoundEnabled ? 'primary' : 'default'}
              size="large"
              onClick={toggleSound}
              title={isSoundEnabled ? t('aiAssistant.voice.off') : t('aiAssistant.voice.on')}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: isSoundEnabled ? 'primary.light' : 'grey.200',
                '&:hover': {
                  backgroundColor: isSoundEnabled ? 'primary.main' : 'grey.300',
                  color: 'white',
                },
              }}
            >
              {isSoundEnabled ? <VolumeUpIcon fontSize="large" /> : <VolumeOffIcon fontSize="large" />}
            </IconButton>
          </Paper>
        </Grid>
      </Grid>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={hideToast} />
    </Box>
  );
};

export default AIRec;