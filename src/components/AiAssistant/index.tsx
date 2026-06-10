import React, { useState, useRef, useEffect } from 'react';
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
import { chat, checkHealth, ChatMessage } from '@homeberris/http/aiApi';
import styles from './index.module.css';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';

// Импорт хука для анализа речи
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { useTranslation } from 'react-i18next';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';

interface AiAssistantProps {
  onCatalogSelect?: (catalog: any) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onCatalogSelect }) => {
  const { t } = useTranslation('common');
  const { toast, showWarning, hideToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedCatalogs, setSuggestedCatalogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [youtubeVideos, setYoutubeVideos] = useState<{ [key: number]: string }>({});
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const router = useRouter();

  // Проверка подключения к Ollama
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkHealth();
        setIsConnected(health.connected);
        if (!health.connected) {
          setMessages([
            {
              role: 'system',
              content: '⚠️ Ollama не подключен. Убедитесь, что Ollama запущен на http://192.168.27.15:11434',
            },
          ]);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: 'Привет! Я ваш AI помощник. Чем могу помочь? Ищу товары, отвечаю на вопросы, помогаю с выбором.',
            },
          ]);
        }
      } catch (error) {
        setIsConnected(false);
        setMessages([
          {
            role: 'system',
            content: '⚠️ Не удалось подключиться к AI сервису. Проверьте, что бэкенд запущен и Ollama установлен.',
          },
        ]);
      }
    };

    checkConnection();
  }, []);

  // Инициализация распознавания речи и синтеза речи
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Распознавание речи
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Синтез речи - загружаем голоса
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;

        // Голоса могут загружаться асинхронно, поэтому вызываем getVoices
        // несколько раз для надежности
        const loadVoices = () => {
          const voices = synthRef.current?.getVoices();
          if (voices && voices.length > 0) {
            console.log('Доступные голоса:', voices.filter(v => v.lang.startsWith('ru')).map(v => v.name));
          } else {
            // Повторяем попытку через небольшую задержку
            setTimeout(loadVoices, 100);
          }
        };

        // Первая попытка
        loadVoices();

        // Также слушаем событие voiceschanged
        if (synthRef.current.onvoiceschanged !== undefined) {
          synthRef.current.onvoiceschanged = loadVoices;
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Функция для поиска YouTube видео
  const searchYouTubeVideo = async (productName: string): Promise<string | null> => {
    try {
      // Используем YouTube Data API v3 (требуется API ключ)
      // Для демонстрации используем простой поиск
      const searchQuery = encodeURIComponent(`${productName} обзор`);
      // В продакшене используйте реальный API ключ
      // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&key=YOUR_API_KEY&maxResults=1`);
      // const data = await response.json();
      // return data.items?.[0]?.id?.videoId || null;

      // Временное решение - возвращаем null, но можно использовать iframe с поиском
      return null;
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return null;
    }
  };

  // Функция для очистки текста от markdown и специальных символов
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Удаляем markdown форматирование
      .replace(/\*\*(.*?)\*\*/g, '$1') // **жирный текст**
      .replace(/\*(.*?)\*/g, '$1') // *курсив*
      .replace(/__(.*?)__/g, '$1') // __подчеркнутый__
      .replace(/_(.*?)_/g, '$1') // _курсив_
      .replace(/~~(.*?)~~/g, '$1') // ~~зачеркнутый~~
      .replace(/`(.*?)`/g, '$1') // `код`
      .replace(/```[\s\S]*?```/g, '') // блоки кода
      // Удаляем ссылки
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // [текст](url)
      .replace(/https?:\/\/[^\s]+/g, '') // URL
      // Удаляем специальные символы
      .replace(/[#*_`~\[\]()]/g, '')
      .replace(/\n+/g, '. ') // Заменяем переносы строк на точки
      .replace(/\s+/g, ' ') // Множественные пробелы в один
      .trim();
  };

  // Функция для синтеза речи с улучшенным голосом
  const speakText = (text: string) => {
    if (!isSoundEnabled || !synthRef.current) return;

    // Останавливаем предыдущую речь
    synthRef.current.cancel();

    // Очищаем текст от markdown и специальных символов
    const cleanText = cleanTextForSpeech(text);

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';

    // Улучшенные настройки для приятного естественного голоса (как у человека)
    utterance.rate = 0.92; // Естественная скорость речи человека
    utterance.pitch = 1.0; // Нормальный тон голоса
    utterance.volume = 1.0; // Полная громкость

    // Пытаемся выбрать приятный женский голос (если доступен)
    const voices = synthRef.current.getVoices();
    const preferredVoices = [
      'Google русский',
      'Microsoft Irina - Russian (Russia)',
      'Microsoft Katya - Russian (Russia)',
      'Yandex',
      'Anna',
      'Milena',
      'Elena',
    ];

    // Ищем предпочтительный голос
    let selectedVoice = voices.find(voice =>
      preferredVoices.some(pref => voice.name.includes(pref)) && voice.lang.startsWith('ru')
    );

    // Если не нашли, ищем любой русский женский голос
    if (!selectedVoice) {
      selectedVoice = voices.find(voice =>
        voice.lang.startsWith('ru') &&
        (voice.name.toLowerCase().includes('жен') ||
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('irina') ||
          voice.name.toLowerCase().includes('katya') ||
          voice.name.toLowerCase().includes('anna'))
      );
    }

    // Если все еще не нашли, берем любой русский голос
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('ru'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Используется голос:', selectedVoice.name);
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeechText(cleanText);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeechText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeechText('');
    };

    // Небольшая задержка для более естественного начала
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 100);
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setSuggestedCatalogs([]);

    try {
      const response = await chat({
        message: inputMessage,
        conversationHistory: messages.filter((m) => m.role !== 'system'),
      });

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.response };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Сохраняем YouTube видео ID, если он есть в ответе
      if (response.youtubeVideoId) {
        setYoutubeVideos(prev => ({ ...prev, [updatedMessages.length - 1]: response.youtubeVideoId! }));
      }

      // Ищем YouTube видео для товаров, если не было в ответе
      if (response.suggestedCatalogs && response.suggestedCatalogs.length > 0) {
        setSuggestedCatalogs(response.suggestedCatalogs);

        // Если видео не было в ответе, пытаемся найти для первого товара
        if (!response.youtubeVideoId) {
          const firstProduct = response.suggestedCatalogs[0];
          if (firstProduct?.name) {
            const videoId = await searchYouTubeVideo(firstProduct.name);
            if (videoId) {
              setYoutubeVideos(prev => ({ ...prev, [updatedMessages.length - 1]: videoId }));
            }
          }
        }
      }

      // Воспроизводим ответ голосом
      if (isSoundEnabled) {
        speakText(response.response);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Ошибка: ${error.message || 'Не удалось получить ответ от AI'}`,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      showWarning('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Функция для извлечения YouTube URL из текста
  const extractYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = text.match(youtubeRegex);
    return match ? match[1] : null;
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
                  label={isConnected ? `${t('aiAssistant.status.connected')}` : `${t('aiAssistant.status.disconnected')}`}
                  color={isConnected ? 'success' : 'error'}
                  size="small"
                />
              )}
            </Box>

            <Box className={styles.messagesContainer}>
              {messages
                .filter((m) => m.role !== 'system')
                .map((message, index) => {
                  const youtubeId = youtubeVideos[index] || extractYouTubeUrl(message.content);
                  return (
                    <Box key={index}>
                      <Box
                        className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                      >
                        <Typography variant="body2" className={styles.messageText}>
                          {message.content}
                        </Typography>
                      </Box>
                      {youtubeId && message.role === 'assistant' && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: '8px' }}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              {isLoading && (
                <Box className={`${styles.message} ${styles.assistantMessage}`}>
                  <CircularProgress size={20} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {suggestedCatalogs.length > 0 && (
              <Box className={styles.suggestedCatalogs}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  {t('aiAssistant.catalog.recommended')}
                </Typography>
                <Grid container spacing={2}>
                  {suggestedCatalogs.map((catalog) => (
                    <FavoriteItem catalog={catalog} />
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
                onKeyPress={(e) => {
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
                disabled={isLoading || !recognitionRef.current}
              >
                {isListening ? <StopIcon /> : <MicIcon />}
              </IconButton>
              <IconButton color="primary" onClick={handleSend} disabled={isLoading || !inputMessage.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Визуализация голоса */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {/* Визуализация звуковых волн */}
            <Box sx={{ width: '100%', mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, height: 80 }}>
              {Array.from({ length: 20 }).map((_, i) => {
                const delay = i * 0.05;
                const baseHeight = isSpeaking ? (0.5) * 50 + 15 : 8;
                const time = Date.now() * 0.01;
                const variation = isSpeaking ? Math.sin(time + delay * 2) * 20 : 0;
                const height = Math.max(8, Math.min(60, baseHeight + variation));

                return (
                  <Box
                    key={i}
                    sx={{
                      width: 5,
                      height: `${height}px`,
                      backgroundColor: isSpeaking ? '#667eea' : '#e0e0e0',
                      borderRadius: 2.5,
                      transition: isSpeaking ? 'all 0.15s ease' : 'all 0.3s ease',
                      transform: isSpeaking ? `scaleY(${1 + Math.sin(time + delay) * 0.3})` : 'scaleY(1)',
                    }}
                  />
                );
              })}
            </Box>

            {/* Индикатор речи */}
            {isSpeaking && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  🔊 {t('aiAssistant.voice.speaking')}
                </Typography>
                {currentSpeechText && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {currentSpeechText.substring(0, 50)}...
                  </Typography>
                )}
              </Box>
            )}

            {/* Кнопка управления звуком */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <IconButton
                color={isSoundEnabled ? 'primary' : 'default'}
                size="large"
                onClick={() => {
                  setIsSoundEnabled(!isSoundEnabled);
                  if (synthRef.current) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                  }
                }}
                title={isSoundEnabled ? `${t('aiAssistant.voice.off')}` : `${t('aiAssistant.voice.on')}`}
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={hideToast} />
    </Box>
  );
};

export default AiAssistant;
