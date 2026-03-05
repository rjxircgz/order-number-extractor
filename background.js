// ... existing content ...

if (chrome.notifications) {
  chrome.notifications.create('clipboardCopied', {
    type: 'basic',
    title: 'Clipboard Copied',
    message: 'Text has been copied to clipboard.',
    iconUrl: 'icons/icon16.png' // Added iconUrl
  });
} else {
  console.error('Notifications API is not available.');
}

// ... existing content ...

if (chrome.notifications) {
  chrome.notifications.create('clipboardCopyFailed', {
    type: 'basic',
    title: 'Clipboard Copy Failed',
    message: 'Failed to copy text to clipboard.',
    iconUrl: 'icons/icon16.png' // Added iconUrl
  });
} else {
  console.error('Notifications API is not available.');
}

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
