/**
 * Embeddable Chat Widget
 * Version: 1.0.0
 */

(function(window) {
    'use strict';

    class ChatWidget {
        constructor(config = {}) {
            this.config = {
                webhook: config.webhook || window.CHAT_CONFIG?.webhook || '',
                userId: config.userId || window.CHAT_CONFIG?.userId || 'user_' + Date.now(),
                title: config.title || window.CHAT_CONFIG?.title || 'Chat',
                theme: config.theme || window.CHAT_CONFIG?.theme || 'light',
                primaryColor: config.primaryColor || window.CHAT_CONFIG?.primaryColor || '#4F46E5',
                position: config.position || window.CHAT_CONFIG?.position || 'bottom-right',
                storageKey: config.storageKey || 'chatMessages'
            };

            this.messages = this.loadMessages();
            this.isMinimized = false;
            this.isTyping = false;

            this.init();
        }

        init() {
            this.createWidget();
            this.applyTheme();
            this.renderMessages();
            this.attachEventListeners();
        }

        createWidget() {
            const container = document.createElement('div');
            container.className = 'chat-widget-container';
            container.id = 'chat-widget-container';
            
            container.innerHTML = `
                <div class="chat-header">
                    <span class="chat-title">${this.config.title}</span>
                    <div class="chat-controls">
                        <button class="chat-control-btn minimize-btn" title="Minimize">−</button>
                        <button class="chat-control-btn close-btn" title="Close">×</button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input-container">
                    <input 
                        type="text" 
                        class="chat-input" 
                        id="chat-input" 
                        placeholder="Type a message..."
                        autocomplete="off"
                    >
                    <button class="send-button" id="send-button">Send</button>
                </div>
            `;

            document.body.appendChild(container);
            this.container = container;
        }

        applyTheme() {
            if (this.config.theme === 'dark') {
                this.container.classList.add('dark');
            }
            
            document.documentElement.style.setProperty('--chat-primary-color', this.config.primaryColor);
        }

        attachEventListeners() {
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('send-button');
            const minimizeBtn = this.container.querySelector('.minimize-btn');
            const closeBtn = this.container.querySelector('.close-btn');

            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
            closeBtn.addEventListener('click', () => this.close());
        }

        loadMessages() {
            try {
                const stored = localStorage.getItem(this.config.storageKey + '_' + this.config.userId);
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.error('Error loading messages:', error);
                return [];
            }
        }

        saveMessages() {
            try {
                localStorage.setItem(
                    this.config.storageKey + '_' + this.config.userId,
                    JSON.stringify(this.messages)
                );
            } catch (error) {
                console.error('Error saving messages:', error);
            }
        }

        renderMessages() {
            const container = document.getElementById('chat-messages');
            if (!container) return;

            container.innerHTML = this.messages.map(msg => `
                <div class="message ${msg.sender}">
                    <div class="message-text">${this.escapeHtml(msg.text)}</div>
                    <div class="message-timestamp">${this.formatTime(msg.timestamp)}</div>
                </div>
            `).join('');

            if (this.isTyping) {
                container.innerHTML += `
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                `;
            }

            container.scrollTop = container.scrollHeight;
        }

        async sendMessage() {
            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            
            if (!text) return;

            const message = {
                text: text,
                sender: 'user',
                timestamp: new Date().toISOString(),
                userId: this.config.userId
            };

            this.messages.push(message);
            this.saveMessages();
            this.renderMessages();
            input.value = '';

            // Send to webhook
            if (this.config.webhook) {
                this.showTypingIndicator();
                
                try {
                    const response = await fetch(this.config.webhook, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(message)
                    });

                    this.hideTypingIndicator();

                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.message || data.response) {
                            const botMessage = {
                                text: data.message || data.response,
                                sender: 'bot',
                                timestamp: data.timestamp || new Date().toISOString()
                            };
                            this.messages.push(botMessage);
                            this.saveMessages();
                            this.renderMessages();
                        }
                    }
                } catch (error) {
                    this.hideTypingIndicator();
                    console.error('Error sending message:', error);
                }
            }
        }

        showTypingIndicator() {
            this.isTyping = true;
            this.renderMessages();
        }

        hideTypingIndicator() {
            this.isTyping = false;
            this.renderMessages();
        }

        toggleMinimize() {
            this.isMinimized = !this.isMinimized;
            this.container.classList.toggle('minimized');
        }

        close() {
            if (this.container) {
                this.container.remove();
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    // Global initialization function
    window.initChatWidget = function(config) {
        return new ChatWidget(config);
    };

    // Auto-initialize if config exists
    if (window.CHAT_CONFIG) {
        window.addEventListener('DOMContentLoaded', () => {
            window.initChatWidget(window.CHAT_CONFIG);
        });
    }

})(window);