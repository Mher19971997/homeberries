import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
} from '@mui/material';

interface Props {
    car: any;
}

const AiChat = ({ car }: Props) => {
    const [messages, setMessages] = useState<
        { role: 'user' | 'ai'; text: string }[]
    >([]);

    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [
            ...messages,
            { role: 'user' as const, text: input },
        ];

        setMessages(newMessages);
        setInput('');

        // ⬇ тут ты можешь подключить свой backend AI endpoint
        const fakeResponse = `AI ответ по ${car.title}: хороший выбор 👍`;

        setMessages([
            ...newMessages,
            { role: 'ai', text: fakeResponse },
        ]);
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2, maxHeight: 300, overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                    <Typography
                        key={index}
                        align={msg.role === 'user' ? 'right' : 'left'}
                        sx={{ mb: 1 }}
                    >
                        <strong>
                            {msg.role === 'user' ? 'Вы' : 'AI'}:
                        </strong>{' '}
                        {msg.text}
                    </Typography>
                ))}
            </Paper>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Задайте вопрос об автомобиле..."
                />
                <Button variant="contained" onClick={handleSend}>
                    Отправить
                </Button>
            </Box>
        </Box>
    );
};

export default AiChat;
