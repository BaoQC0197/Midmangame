import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import styles from './ChatRoom.module.css';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text.trim());
            setText('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.inputArea}>
            <input
                type="text"
                className={styles.input}
                placeholder="Nhập tin nhắn..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <button 
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!text.trim() || disabled}
            >
                <Send size={18} />
            </button>
        </div>
    );
}
