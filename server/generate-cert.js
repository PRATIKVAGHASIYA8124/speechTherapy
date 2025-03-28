const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'cert');

// Create cert directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// Generate private key and certificate
const command = `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ${path.join(certDir, 'private.key')} -out ${path.join(certDir, 'certificate.crt')} -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating certificate: ${error}`);
    return;
  }
  console.log('Self-signed certificate generated successfully!');
  console.log('Certificate location:', path.join(certDir, 'certificate.crt'));
  console.log('Private key location:', path.join(certDir, 'private.key'));
}); 