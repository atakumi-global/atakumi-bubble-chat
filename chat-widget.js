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
            
            // Create default SVG icon safely
            if (!this.config.bubbleIcon) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z');
                
                const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle1.setAttribute('cx', '12');
                circle1.setAttribute('cy', '10');
                circle1.setAttribute('r', '1.5');
                
                const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle2.setAttribute('cx', '8');
                circle2.setAttribute('cy', '10');
                circle2.setAttribute('r', '1.5');
                
                const circle3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle3.setAttribute('cx', '16');
                circle3.setAttribute('cy', '10');
                circle3.setAttribute('r', '1.5');
                
                svg.appendChild(path);
                svg.appendChild(circle1);
                svg.appendChild(circle2);
                svg.appendChild(circle3);
                
                bubble.appendChild(svg);
            } else {
                // If custom icon is provided, still use innerHTML for SVG only (not user data)
                // This is acceptable as bubbleIcon comes from config, not user input
                bubble.innerHTML = this.config.bubbleIcon;
            }
            
            const bubbleMessage = document.createElement('div');
            bubbleMessage.className = 'chat-bubble-message';
            bubbleMessage.textContent = this.config.bubbleMessage; // Safe - uses textContent
            
            document.body.appendChild(bubble);
            document.body.appendChild(bubbleMessage);
            
            this.bubble = bubble;
            this.bubbleMessageEl = bubbleMessage;
        }

        createWidget() {
            const container = document.createElement('div');
            container.className = 'chat-widget-container';
            container.id = 'chat-widget-container';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'chat-header';
            
            const title = document.createElement('span');
            title.className = 'chat-title';
            title.textContent = this.config.title; // Safe - uses textContent
            
            const controls = document.createElement('div');
            controls.className = 'chat-controls';
            
            const minimizeBtn = document.createElement('button');
            minimizeBtn.className = 'chat-control-btn minimize-btn';
            minimizeBtn.title = 'Minimize';
            minimizeBtn.textContent = '−';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'chat-control-btn close-btn';
            closeBtn.title = 'Close';
            closeBtn.textContent = '×';
            
            controls.appendChild(minimizeBtn);
            controls.appendChild(closeBtn);
            header.appendChild(title);
            header.appendChild(controls);
            
            // Create messages container
            const messagesContainer = document.createElement('div');
            messagesContainer.className = 'chat-messages';
            messagesContainer.id = 'chat-messages';
            
            // Create input container
            const inputContainer = document.createElement('div');
            inputContainer.className = 'chat-input-container';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'chat-input';
            input.id = 'chat-input';
            input.placeholder = 'Type a message...';
            input.autocomplete = 'off';
            
            const sendButton = document.createElement('button');
            sendButton.className = 'send-button';
            sendButton.id = 'send-button';
            sendButton.textContent = 'Send';
            
            inputContainer.appendChild(input);
            inputContainer.appendChild(sendButton);
            
            // Assemble container
            container.appendChild(header);
            container.appendChild(messagesContainer);
            container.appendChild(inputContainer);

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

            // Clear container safely
            container.innerHTML = '';

            // Create message elements using DOM methods
            this.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}`;
                
                const textDiv = document.createElement('div');
                textDiv.className = 'message-text';
                textDiv.textContent = msg.text; // Safe - uses textContent
                
                const timestampDiv = document.createElement('div');
                timestampDiv.className = 'message-timestamp';
                timestampDiv.textContent = this.formatTime(msg.timestamp);
                
                messageDiv.appendChild(textDiv);
                messageDiv.appendChild(timestampDiv);
                container.appendChild(messageDiv);
            });

            if (this.isTyping) {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'typing-indicator';
                
                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'typing-dot';
                    typingDiv.appendChild(dot);
                }
                
                container.appendChild(typingDiv);
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
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            if (this.bubble && this.bubble.parentNode) {
                this.bubble.parentNode.removeChild(this.bubble);
            }
            if (this.bubbleMessageEl && this.bubbleMessageEl.parentNode) {
                this.bubbleMessageEl.parentNode.removeChild(this.bubbleMessageEl);
            }
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