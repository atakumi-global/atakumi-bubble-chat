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
                sessionId: config.sessionId || window.CHAT_CONFIG?.sessionId || this.generateSessionId(),
                campaignId: config.campaignId || window.CHAT_CONFIG?.campaignId || null,
                title: config.title || window.CHAT_CONFIG?.title || 'Chat',
                theme: config.theme || window.CHAT_CONFIG?.theme || 'light',
                primaryColor: config.primaryColor || window.CHAT_CONFIG?.primaryColor || '#4F46E5',
                position: config.position || window.CHAT_CONFIG?.position || 'bottom-right',
                storageKey: config.storageKey || 'chatMessages',
                startCollapsed: config.startCollapsed !== undefined ? config.startCollapsed : (window.CHAT_CONFIG?.startCollapsed !== undefined ? window.CHAT_CONFIG.startCollapsed : true),
                bubbleMessage: config.bubbleMessage || window.CHAT_CONFIG?.bubbleMessage || 'Chat with us!',
                bubbleIcon: config.bubbleIcon || window.CHAT_CONFIG?.bubbleIcon || null
            };

            this.messages = this.loadMessages();
            this.isMinimized = false;
            this.isExpanded = !this.config.startCollapsed;
            this.isTyping = false;

            this.init();
        }

        generateSessionId() {
            const storedSessionId = sessionStorage.getItem('chat_session_id');
            if (storedSessionId) {
                return storedSessionId;
            }

            const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chat_session_id', newSessionId);
            return newSessionId;
        }

        init() {
            this.createBubble();
            this.createWidget();
            this.applyTheme();
            this.renderMessages();
            this.attachEventListeners();
            
            if (this.config.startCollapsed) {
                this.container.classList.add('hidden');
            } else {
                this.bubble.classList.add('hidden');
                this.bubbleMessageEl.classList.add('hidden');
            }
            
            this.loadPreviousSession();
        }

        createBubble() {
            const bubble = document.createElement('button');
            bubble.className = 'chat-bubble-button';
            bubble.setAttribute('aria-label', 'Open chat');
            
            const defaultIcon = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    <circle cx="12" cy="10" r="1.5"/>
                    <circle cx="8" cy="10" r="1.5"/>
                    <circle cx="16" cy="10" r="1.5"/>
                </svg>
            `;
            
            bubble.innerHTML = this.config.bubbleIcon || defaultIcon;
            
            const bubbleMessage = document.createElement('div');
            bubbleMessage.className = 'chat-bubble-message';
            bubbleMessage.textContent = this.config.bubbleMessage;
            
            document.body.appendChild(bubble);
            document.body.appendChild(bubbleMessage);
            
            this.bubble = bubble;
            this.bubbleMessageEl = bubbleMessage;
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
                this.bubbleMessageEl.classList.add('dark');
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
            closeBtn.addEventListener('click', () => this.collapseToButton());
            
            this.bubble.addEventListener('click', () => this.expandFromButton());
        }

        expandFromButton() {
            this.isExpanded = true;
            this.bubble.classList.add('hidden');
            this.bubbleMessageEl.classList.add('hidden');
            this.container.classList.remove('hidden');
            
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }

        collapseToButton() {
            this.isExpanded = false;
            this.container.classList.add('hidden');
            this.bubble.classList.remove('hidden');
            this.bubbleMessageEl.classList.remove('hidden');
        }

        async loadPreviousSession() {
            if (this.messages.length > 0 && this.config.webhook) {
                try {
                    const payload = {
                        sessionId: this.config.sessionId,
                        action: "loadPreviousSession",
                        campaignid: this.config.campaignId
                    };

                    const response = await fetch(this.config.webhook, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        if (Array.isArray(data) && data.length > 0 && data[0].output) {
                            const botMessage = {
                                text: data[0].output,
                                sender: 'bot',
                                timestamp: new Date().toISOString()
                            };
                            this.messages.push(botMessage);
                            this.saveMessages();
                            this.renderMessages();
                        }
                    }
                } catch (error) {
                    console.error('Error loading previous session:', error);
                }
            }
        }

        loadMessages() {
            try {
                const stored = localStorage.getItem(this.config.storageKey + '_' + this.config.sessionId);
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.error('Error loading messages:', error);
                return [];
            }
        }

        saveMessages() {
            try {
                localStorage.setItem(
                    this.config.storageKey + '_' + this.config.sessionId,
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

            const userMessage = {
                text: text,
                sender: 'user',
                timestamp: new Date().toISOString()
            };

            this.messages.push(userMessage);
            this.saveMessages();
            this.renderMessages();
            input.value = '';

            if (this.config.webhook) {
                this.showTypingIndicator();
                
                try {
                    const payload = {
                        sessionId: this.config.sessionId,
                        action: "sendMessage",
                        chatInput: text,
                        campaignid: this.config.campaignId
                    };

                    const response = await fetch(this.config.webhook, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });

                    this.hideTypingIndicator();

                    if (response.ok) {
                        const data = await response.json();
                        
                        if (Array.isArray(data) && data.length > 0 && data[0].output) {
                            const botMessage = {
                                text: data[0].output,
                                sender: 'bot',
                                timestamp: new Date().toISOString()
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
            if (this.bubble) {
                this.bubble.remove();
            }
            if (this.bubbleMessageEl) {
                this.bubbleMessageEl.remove();
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

    window.initChatWidget = function(config) {
        return new ChatWidget(config);
    };

    if (window.CHAT_CONFIG) {
        window.addEventListener('DOMContentLoaded', () => {
            window.initChatWidget(window.CHAT_CONFIG);
        });
    }

})(window);