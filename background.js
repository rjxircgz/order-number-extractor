// ... existing content ...

if (chrome.notifications) {
  chrome.notifications.create('ocrError', {
    type: 'basic',
    title: 'OCR Error',
    message: errorMsg,
    iconUrl: 'icons/icon16.png' // Added iconUrl
  });
} else {
  console.error('Notifications API is not available.');
}

// ... existing content ...
