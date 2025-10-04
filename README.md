# Embeddable Chat Widget

A lightweight, customizable chat widget that can be embedded directly into any website.

## Features

- 🚀 Direct DOM injection - integrates seamlessly into your page
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
    campaignId: 'spring_sale_2025',
    title: 'Support Chat',
    primaryColor: '#4F46E5'
  };
</script>
<script src="https://your-domain.com/chat-widget.js"></script>
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
```

### Method 2: Self-Hosted

Download the files and include them in your project:

```html
<script src="./chat-widget.js"></script>
<link rel="stylesheet" href="./chat-widget.css">
<script>
  initChatWidget({
    webhook: 'https://your-webhook.com/chat',
    campaignId: 5
  });
</script>
```

### Method 3: CDN (via GitHub Pages)

```html
<link rel="stylesheet" href="https://YOUR_USERNAME.github.io/embeddable-chat-widget/chat-widget.css">
<script src="https://YOUR_USERNAME.github.io/embeddable-chat-widget/chat-widget.js"></script>
<script>
  initChatWidget({
    webhook: 'https://your-webhook.com/chat',
    campaignId: 5,
    title: 'Customer Support'
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `webhook` | string | `''` | URL to send/receive messages |
| `sessionId` | string | auto-generated | Session identifier (auto-created if not provided) |
| `campaignId` | string | `null` | Campaign identifier for backend webhook settings |
| `title` | string | `'Chat'` | Chat window title |
| `theme` | string | `'light'` | Theme (`light` or `dark`) |
| `primaryColor` | string | `'#4F46E5'` | Primary brand color |
| `position` | string | `'bottom-right'` | Widget position on page |
| `storageKey` | string | `'chatMessages'` | LocalStorage key for messages |

## Webhook Integration

### Request Actions

Each request is accompanied by an `action` field, where `action` can be one of:

- `loadPreviousSession` - When the user opens the chatbot again and the previous chat session should be loaded
- `sendMessage` - When the user sends a message

### Outgoing Message (POST to webhook)

When a user sends a message, the widget posts to your webhook URL with this format:

```json
{
  "sessionId": "541f2a7e-cc17-4825-a129-1a2cfaf80022",
  "action": "sendMessage",
  "chatInput": "Hello, I need help",
  "campaignid": 5
}
```

### Loading Previous Session

When the widget initializes and finds an existing session, it sends:

```json
{
  "sessionId": "541f2a7e-cc17-4825-a129-1a2cfaf80022",
  "action": "loadPreviousSession",
  "campaignid": 5
}
```

### Expected Response

Your webhook should respond with an array containing the output:

```json
[
  {
    "output": "Hello! How can I assist you today?"
  }
]
```

## Project Structure

```
embeddable-chat-widget/
├── README.md
├── index.html          # Standalone version
├── chat-widget.js      # Main JavaScript file
├── chat-widget.css     # Styles
└── examples/
    └── index.html      # Demo page
```

## Installation & Development

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/embeddable-chat-widget.git
cd embeddable-chat-widget
```

### Test Locally

Simply open `index.html` or `examples/index.html` in your browser. No build process required!

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select "Deploy from main branch"
4. Your widget will be live at: `https://YOUR_USERNAME.github.io/embeddable-chat-widget/`

## Usage Examples

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="chat-widget.css">
</head>
<body>
  <h1>My Website</h1>
  
  <script src="chat-widget.js"></script>
  <script>
    initChatWidget({
      webhook: 'https://api.myapp.com/chat',
      campaignId: 5,
      title: 'Help Center'
    });
  </script>
</body>
</html>
```

### Dark Theme

```javascript
initChatWidget({
  webhook: 'https://api.myapp.com/chat',
  theme: 'dark',
  primaryColor: '#8B5CF6'
});
```

### Custom Branding

```javascript
initChatWidget({
  webhook: 'https://api.myapp.com/chat',
  campaignId: 'holiday_2025'
});
```

## API Methods

After initialization, you can access the widget instance:

```javascript
const chatWidget = initChatWidget({ /* config */ });

// Methods (if you extend the class)
chatWidget.toggleMinimize();  // Minimize/maximize
chatWidget.close();            // Close the widget
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features Roadmap

- [ ] File upload support
- [ ] Rich text formatting
- [ ] Emoji picker
- [ ] Sound notifications
- [ ] Read receipts
- [ ] Typing indicators for multiple users
- [ ] Message reactions
- [ ] Chat history export

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this in your projects!

## Support

If you encounter any issues or have questions:

1. Check the [examples/index.html](examples/index.html) file
2. Open an issue on GitHub
3. Review the webhook integration section above

## Credits

Created as a lightweight, embeddable chat solution. No dependencies required!