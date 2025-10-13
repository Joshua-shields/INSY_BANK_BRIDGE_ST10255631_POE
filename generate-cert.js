//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// Generate self-signed certificate using Node.js selfsigned package
const selfsigned = require('selfsigned');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'US' },
  { shortName: 'ST', value: 'State' },
  { name: 'localityName', value: 'City' },
  { name: 'organizationName', value: 'BankBridge' },
  { shortName: 'OU', value: 'IT Department' }
];

const options = {
  keySize: 4096,
  days: 365,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2, // DNS
          value: 'localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        }
      ]
    }
  ]
};

console.log('Generating SSL certificates...');
const pems = selfsigned.generate(attrs, options);

// Write the certificate and key files
fs.writeFileSync(path.join(sslDir, 'cert.pem'), pems.cert);
fs.writeFileSync(path.join(sslDir, 'key.pem'), pems.private);

console.log('✅ SSL certificates generated successfully!');
console.log(`📁 Certificate: ${path.join(sslDir, 'cert.pem')}`);
console.log(`🔑 Private Key: ${path.join(sslDir, 'key.pem')}`);
console.log('\n⚠️  Note: These are self-signed certificates for development only.');
console.log('Your browser will show a security warning - this is normal for self-signed certs.');
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
