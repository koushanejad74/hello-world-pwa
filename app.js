// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        updateStatus('Service Worker registered! 🎉');
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
        updateStatus('Service Worker registration failed 😞');
      });
  });
}

// PWA Install functionality
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  installBtn.style.display = 'block';
  updateStatus('App ready to install! 📱');
});

installBtn.addEventListener('click', (e) => {
  console.log('Install button clicked');
  // Hide the app provided install promotion
  installBtn.style.display = 'none';
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      updateStatus('App installed! 🎊');
    } else {
      console.log('User dismissed the install prompt');
      updateStatus('Installation cancelled 🤷‍♀️');
    }
    deferredPrompt = null;
  });
});

// Check if app is running in standalone mode
window.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    updateStatus('Running as installed PWA! 🚀');
  } else {
    updateStatus('Running in browser 🌐');
  }
});

// Update status message
function updateStatus(message) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.style.opacity = '0';
    setTimeout(() => {
      statusElement.style.opacity = '1';
    }, 100);
  }
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
  // Add click animation to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = 'scale(1)';
      }, 150);
    });
  });
  
  // Update time periodically
  setInterval(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    console.log(`PWA is running at ${timeString}`);
  }, 60000); // Every minute
});
