let extractedText = '';

const DEFAULT_KEYWORD = '^\\d{2}-\\d{5}/[A-Z]{3}$';
const SERVER_URL = 'http://localhost:3000';

chrome.contextMenus.create({
  id: 'extractOrderText',
  title: 'Copy Extracted Text',
  contexts: ['image']
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'extractOrderText') {
    const imageUrl = info.srcUrl;
    const isBlob = imageUrl.startsWith('blob:');
    
    const keyword = DEFAULT_KEYWORD;
    
    try {
        let imageBase64 = null;
        
        if (isBlob) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (url) => {
              const img = document.querySelector(`img[src="${url}"]`);
              if (!img) return null;
              
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              return canvas.toDataURL('image/png');
            },
            args: [imageUrl]
          });
          
          imageBase64 = results[0]?.result;
          
          if (!imageBase64) {
            throw new Error('Could not capture image. Try opening image in new tab.');
          }
        }
        
        const response = await fetch(`${SERVER_URL}/ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl: isBlob ? null : imageUrl,
            imageBase64: imageBase64,
            keyword: keyword
          })
        });
        
        const responseText = await response.text();
        
        if (!response.ok) {
          throw new Error('Server error ' + response.status + ': ' + responseText);
        }
        
        const result = JSON.parse(responseText);
        
        if (result.extractedValue) {
          extractedText = result.extractedValue;
          
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (text) => navigator.clipboard.writeText(text),
              args: [result.extractedValue]
            });
            
            // Show notification
            reg.showNotification('Clipboard Copied', 'Text has been copied to clipboard.');
          } catch (e) {
            console.log('Clipboard copy failed:', e);
            
            // Show notification for clipboard copy failure
            reg.showNotification('Clipboard Copy Failed', 'Failed to copy text to clipboard.');
          }
          
          chrome.storage.local.set({ 
            ocrResult: 'Copied: ' + result.extractedValue,
            fullText: result.text,
            isSuccess: true 
          });
          
          chrome.action.setBadgeText({ text: '✓' });
          chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
          
        } else if (result.matchFound) {
          chrome.storage.local.set({ 
            ocrResult: 'No text found after match',
            fullText: result.text,
            isSuccess: false
          });
          
          chrome.action.setBadgeText({ text: '✗' });
          chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
          
        } else {
          chrome.storage.local.set({ 
            ocrResult: 'No match for "' + keyword + '"',
            fullText: result.text,
            isSuccess: false
          });
          
          chrome.action.setBadgeText({ text: '✗' });
          chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
        }
        
      } catch (error) {
        console.error('OCR Error:', error);
        
        let errorMsg = error.message;
        if (error.message.includes('Failed to fetch')) {
          errorMsg = 'Server not running. Start tesseract-server on desktop';
        }
        
        chrome.storage.local.set({ 
          ocrResult: 'Error: ' + errorMsg,
          isSuccess: false 
        });
        
        chrome.action.setBadgeText({ text: '✗' });
        chrome.action.setBadgeBackgroundColor({ color: '#dc3545' });
        
        // Show notification for OCR error
        reg.showNotification('OCR Error', errorMsg);
      }
    }
  }
);
