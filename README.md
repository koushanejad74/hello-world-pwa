# Hello World PWA 🌍

A simple "Hello World" Progressive Web App that demonstrates the core features of PWAs.

## 🚀 Features

- **Installable**: Can be installed on devices like a native app
- **Offline Support**: Works without internet connection using Service Worker
- **Responsive**: Adapts to different screen sizes
- **App-like Experience**: Runs in standalone mode when installed

## 📁 Project Structure

```
BallSortPWA/
├── index.html          # Main HTML file
├── manifest.json       # Web App Manifest
├── sw.js              # Service Worker
├── app.js             # Main JavaScript logic
├── styles.css         # Styles and responsive design
├── generate-icons.sh  # Script to generate PWA icons
├── icons/             # App icons directory
└── README.md          # This file
```

## 🛠️ Setup and Installation

### 1. Generate Icons (Optional)

Run the icon generation script to create all required PWA icons:

```bash
./generate-icons.sh
```

This will create icons in various sizes required for PWA installation.

### 2. Serve the App

For the PWA to work properly (including Service Worker), you need to serve it from a web server:

**Option 1: Python (if Python is installed)**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Node.js (if Node.js is installed)**
```bash
npx serve .
# or install serve globally: npm install -g serve
```

**Option 3: PHP (if PHP is installed)**
```bash
php -S localhost:8000
```

### 3. Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## 📱 Testing PWA Features

### Installation
- **Chrome/Edge**: Look for the install icon in the address bar or the install banner
- **Safari**: Add to Home Screen from the share menu
- **Firefox**: Look for the install prompt

### Offline Testing
1. Open Developer Tools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh the page - it should still work!

### Service Worker
- Check the Application/Storage tab in Developer Tools
- View registered Service Workers
- Inspect cached resources

## 🎨 Customization

### Colors and Theme
Edit `styles.css` to change:
- Background gradients
- Button colors  
- Card styling
- Theme colors

### App Information
Edit `manifest.json` to change:
- App name and description
- Theme colors
- Display mode
- Icons

### Functionality
Edit `app.js` to add:
- New interactive features
- Additional PWA capabilities
- Custom functionality

## 🌐 Deployment

To deploy your PWA:

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Your PWA will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop the folder to Netlify
2. Your PWA will get a custom URL

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## 🔧 Browser Support

- ✅ Chrome (Android & Desktop)
- ✅ Firefox (Android & Desktop)
- ✅ Safari (iOS & macOS)
- ✅ Edge (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera

## 📚 Learn More

- [Progressive Web Apps (PWAs) | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest | MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎉 Next Steps

Now that you have a working PWA, you can:
- Add more interactive features
- Implement push notifications
- Add background sync
- Create a more complex caching strategy
- Add authentication
- Connect to APIs

Happy coding! 🚀
