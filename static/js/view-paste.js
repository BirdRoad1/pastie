import { encryptContent, decryptContent, generateKey } from './cryptography.js';

const titleElem = document.getElementById('paste-title');
const pasteContentElem = document.getElementById('paste-content');
const contentElem = document.getElementById('content');
const decryptionElem = document.getElementById('decryption');
const pageTitleElem = document.getElementById('title');
const decryptBtn = document.getElementById('decrypt-btn');
const passwordElem = document.getElementById('password');
const notFoundContent = document.getElementById('not-found-content');

const copyBtn = document.getElementById('copy-btn');
copyBtn.addEventListener('click', () => {
  pasteContentElem.select();
  pasteContentElem.setSelectionRange(0, pasteContentElem.value.length + 1);
  navigator.clipboard.writeText(pasteContentElem.value);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 800);
});

let postInfo;

decryptBtn.addEventListener('click', async () => {
  const password = passwordElem.value;
  try {
    const date = new Date(postInfo.createdAt);
    const { title, body } = JSON.parse(
      await decryptContent(postInfo.body, password, false)
    );

    const key = await generateKey(postInfo.body, password);
    location.hash = key;

    titleElem.textContent = `${title} • ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    pasteContentElem.textContent = body;
    passwordElem.value = '';
    passwordElem.remove();
    decryptionElem.classList.remove('visible');
  } catch (err) {
    console.log(err);
    alert(
      'Decryption failed! You may have entered the password wrong or the data was corrupted.'
    );
  }
});

const url = location.pathname;
async function init() {
  if (!url.startsWith('/paste/')) {
    alert('Invalid access');
    return;
  }

  const pasteName = url.substring(7);
  try {
    const res = await fetch(`/api/paste/${pasteName}`);
    const text = await res.text();
    if (res.status === 404) {
      contentElem.remove();
      notFoundContent.classList.add('visible');
      return;
    }

    if (!res.ok) {
      return alert('Failed to get paste: ' + text);
    }

    const post = JSON.parse(text); //{ title, body, createdAt, visibility }
    if (post.visibility === 'ENCRYPTED') {
      let key = location.hash;
      if (key != null && key.length > 0) {
        key = key.substring(1);
        try {
          const date = new Date(post.createdAt);
          const { title, body } = JSON.parse(
            await decryptContent(post.body, key, true)
          );

          titleElem.textContent = `${title} • ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          pasteContentElem.textContent = body;
          passwordElem.value = '';
          passwordElem.remove();
          decryptionElem.classList.remove('visible');
          return;
        } catch (err) {
          console.log(err);
        }
      }

      postInfo = post;
      pageTitleElem.textContent = 'View Encrypted Paste';
      decryptionElem.classList.add('visible');
      pasteContentElem.textContent =
        'This paste is encrypted. Enter the password and click "Decrypt" to view this paste.';
    } else {
      const date = new Date(post.createdAt);
      titleElem.textContent = `${
        post.title
      } • ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      pasteContentElem.textContent = post.body;
    }
  } catch (err) {
    console.log('Error getting paste:', err);
    alert('Failed to get paste. Check the console for more info.');
  }
}

init();
