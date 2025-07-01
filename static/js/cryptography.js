/**
 *
 * @param {ArrayBuffer} buffer
 */
function bufToBase64(buffer) {
  let str = '';
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]);
  }

  return btoa(str);
}

/**
 *
 * @param {string} base64
 */
function base64ToBuf(base64) {
  const str = atob(base64);

  const buffer = new ArrayBuffer(str.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    view[i] = code;
  }

  return buffer;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/**
 * Encrypts a string locally using AES-256 and PBKDF2
 * @param {string} content
 * @param {string} password
 */
export async function encryptContent(content, password) {
  const subtle = crypto.subtle;
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const pass = await subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt,
      iterations: 600_000
    },
    pass,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt']
  );

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const enc = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    textEncoder.encode(content)
  );

  const encArray = new Uint8Array(enc);

  // 12 bytes for iv, 16 bytes for salt
  const newBuf = new ArrayBuffer(iv.length + salt.length + enc.byteLength);
  const newBufWriter = new Uint8Array(newBuf);
  for (let i = 0; i < iv.length; i++) {
    newBufWriter[i] = iv[i];
  }

  for (let i = 0; i < salt.length; i++) {
    newBufWriter[iv.length + i] = salt[i];
  }
  for (let i = 0; i < enc.byteLength; i++) {
    newBufWriter[iv.length + salt.length + i] = encArray[i];
  }

  return bufToBase64(newBuf);
}

/**
 * Decrypts an AES-256 encrypted payload
 * @param {string} content
 * @param {string} password
 */
export async function decryptContent(content, password) {
  const subtle = crypto.subtle;
  const buf = base64ToBuf(content);
  const reader = new Uint8Array(buf);

  const iv = new Uint8Array(12);
  for (let i = 0; i < iv.length; i++) {
    iv[i] = reader[i];
  }

  const salt = new Uint8Array(16);
  for (let i = 0; i < salt.length; i++) {
    salt[i] = reader[iv.length + i];
  }

  const encrypted = new Uint8Array(buf.byteLength - iv.length - salt.length);
  for (let i = 0; i < encrypted.length; i++) {
    encrypted[i] = reader[iv.length + salt.length + i];
  }

  const pass = await subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt,
      iterations: 600_000
    },
    pass,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );

  const dec = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encrypted
  );

  const decrypted = new Uint8Array(dec);

  return textDecoder.decode(decrypted);
}
