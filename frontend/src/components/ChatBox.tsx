'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
    sender: string;
    message: string;
    timestamp: number;
}

interface ChatBoxProps {
    matchId: string;
    userAddress: string;
    gamerTag: string;
}

export default function ChatBox({ matchId, userAddress, gamerTag }: ChatBoxProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to backend
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.emit('join_match', matchId);

        // Load history
        fetch(`http://localhost:3001/api/chat/${matchId}`)
            .then(res => res.json())
            .then(data => setMessages(data.messages));

        newSocket.on('new_message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
            // Scroll to bottom
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [matchId]);

    const sendMessage = () => {
        if (!input.trim() || !socket) return;

        const senderName = gamerTag || userAddress.slice(0, 6);
        socket.emit('send_message', { matchId, sender: senderName, message: input });
        setInput('');
    };

    return (
        <div className="flex flex-col h-[400px] bg-black border border-gray-800 rounded-xl overflow-hidden">
            <div className="bg-surface p-3 border-b border-gray-800 font-bold text-sm text-gray-400">
                MATCH CHAT
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === (gamerTag || userAddress.slice(0, 6)) ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                        <div className={`p-2 rounded-lg max-w-[80%] text-sm ${msg.sender === (gamerTag || userAddress.slice(0, 6))
                                ? 'bg-primary text-black'
                                : 'bg-surface-hover text-white'
                            }`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <div className="p-3 bg-surface border-t border-gray-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-primary outline-none"
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-primary text-black font-bold px-4 rounded text-sm hover:bg-green-400"
                >
                    SEND
                </button>
            </div>
        </div>
    );
}
