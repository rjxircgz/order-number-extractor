chrome.storage.local.get(['ocrResult', 'extractedValues'], async (data) => {
  const messageElement = document.getElementById('message');
  const copyButtonsContainer = document.getElementById('copy-buttons-container');

  if (data.isSuccess && data.extractedValues && Array.isArray(data.extractedValues)) {
    messageElement.textContent = 'OCR Success: Found multiple values';

    // Clear any existing buttons
    copyButtonsContainer.innerHTML = '';

    // Create a "Copy" button for each extracted value
    data.extractedValues.forEach((value, index) => {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = `Copy Value ${index + 1}: ${value}`;
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(value);
          // Optionally, show a success message or change the button text
          button.style.backgroundColor = '#4caf50';
          button.style.color = 'white';
          button.textContent = `Copied Value ${index + 1}`;
        } catch (e) {
          console.error('Copy failed:', e);
          alert('Failed to copy value. Please try again.');
        }
      });
      copyButtonsContainer.appendChild(button);
    });

  } else if (data.isSuccess && data.extractedValue) {
    messageElement.textContent = 'OCR Success: ' + data.ocrResult;
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = `Copy Value`;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.extractedValue);
        // Optionally, show a success message or change the button text
        button.style.backgroundColor = '#4caf50';
        button.style.color = 'white';
        button.textContent = `Copied`;
      } catch (e) {
        console.error('Copy failed:', e);
        alert('Failed to copy value. Please try again.');
      }
    });
    copyButtonsContainer.appendChild(button);

  } else {
    messageElement.textContent = data.ocrResult || 'No OCR result available';
  }
});
