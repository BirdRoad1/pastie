import { encryptContent, decryptContent } from './cryptography.js';

const titleElem = document.getElementById('title');
const bodyElem = document.getElementById('textarea');
const uploadBtn = document.getElementById('upload-btn');
const visibilitySelect = document.getElementById('visibility');
const passwordBox = document.getElementById('password');

visibilitySelect.addEventListener('change', () => {
  const value = visibilitySelect.value;
  if (value === 'ENCRYPTED') {
    passwordBox.classList.add('visible');
  } else {
    passwordBox.classList.remove('visible');
  }
});

bodyElem.addEventListener('keyup', () => {
  const text = bodyElem.value;
  if (!text) {
    uploadBtn.disabled = true;
    return;
  }

  uploadBtn.disabled = false;
});

uploadBtn.addEventListener('click', async () => {
  if (uploadBtn.disabled) return;

  const visibility = visibilitySelect.value;
  let title = titleElem.value;
  let body = bodyElem.value;
  
  if (visibility === 'ENCRYPTED') {
    const password = passwordBox.value;
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    // encrypt locally
    body = await encryptContent(body, password);
    title = await encryptContent(title, password);
  }

  const res = await fetch('/api/paste', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      title,
      body,
      visibility
    })
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);

    if (!res.ok) {
      alert('Failed to upload paste: ' + text);
      return;
    }

    // Success
    const url = json.url;
    location.href = url;
  } catch (err) {
    console.log('Body:', json, ', Error:', err);
    alert('Unexpected response. Check console for more details');
  }
});
