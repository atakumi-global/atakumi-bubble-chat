# Embeddable Chat Widget

A lightweight, customizable chat widget that can be embedded into any website without iframes.

## Features

- 🚀 No iframe required - direct DOM injection
- ⚙️ Configurable via URL parameters or JavaScript
- 💾 Local message persistence
- 🎨 Customizable themes and colors
- 📱 Responsive design
- 🔗 Webhook integration for backend communication

## Quick Start

### Method 1: Script Tag
```html
<script>
  window.CHAT_CONFIG = {
    webhook: 'https://your-webhook.com/chat',
    userId: 'user123',
    title: 'Support Chat',
    primaryColor: '#4F46E5'
  };
</script>
<script src="https://your-domain.com/chat-widget.js"></script>
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
Method 2: Self-Hosted
Download the files and include them in your project:
html<script src="./chat-widget.js"></script>
<link rel="stylesheet" href="./chat-widget.css">
<script>
  initChatWidget({
    webhook: 'https://your-webhook.com/chat',
    userId: 'user123'
  });
</script>
Configuration Options
OptionTypeDefaultDescriptionwebhookstring''URL to send/receive messagesuserIdstringauto-generatedUnique user identifiertitlestring'Chat'Chat window titlethemestring'light'Theme (light/dark)primaryColorstring'#4F46E5'Primary brand colorpositionstring'bottom-right'Widget position on page
Webhook Format
Outgoing Message (POST to webhook)
json{
  "text": "User message",
  "sender": "user",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "userId": "user123"
}
Expected Response
json{
  "message": "Bot response text",
  "timestamp": "2025-10-04T12:00:01.000Z"
}
Browser Support

Chrome/Edge 90+
Firefox 88+
Safari 14+

License
MIT

## 📄 index.html (Standalone Version)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget - Standalone</title>
    <link rel="stylesheet" href="chat-widget.css">
</head>
<body>
    <div id="chat-widget-root"></div>
    <script src="chat-widget.js"></script>
    <script>
        // Initialize with configuration
        initChatWidget({
            webhook: new URLSearchParams(window.location.search).get('webhook') || '',
            userId: new URLSearchParams(window.location.search).get('userId') || '',
            title: new URLSearchParams(window.location.search).get('title') || 'Chat',
            theme: new URLSearchParams(window.location.search).get('theme') || 'light',
            primaryColor: new URLSearchParams(window.location.search).get('primaryColor') || '#4F46E5'
        });
    </script>
</body>
</html>