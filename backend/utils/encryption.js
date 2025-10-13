//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////


const crypto = require('crypto'); // Node.js built-in crypto module for encryption and decryption

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-character-secret-key!!';
const ALGORITHM = 'aes-256-gcm';


function encrypt(text) {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16); // Initialization vector
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag(); // Authentication tag for GCM mode
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
// Decrypt function to reverse the encryption 
// this is to ensure data security 
function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  
  const parts = text.split(':');
  
  if (parts.length === 2) {
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
   //  mode decryption
  if (parts.length === 3) {
    const iv = Buffer.from(parts[0], 'hex'); 
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2]; // encrypted text
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag); // Set the authentication tag
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted; // return decrypted text
  }
  
  return text; // return original text if format is unexpected
}

module.exports = { encrypt, decrypt }; // export the functions for use in other files
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
