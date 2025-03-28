const fs = require('fs');
const path = require('path');
const forge = require('node-forge');

// Paths for SSL certificates
const certDir = path.join(__dirname, 'cert');
const certPath = path.join(certDir, 'certificate.crt');
const keyPath = path.join(certDir, 'private.key');

// Function to generate SSL certificate using node-forge
const generateCertificate = () => {
  return new Promise((resolve, reject) => {
    try {
      // Create cert directory if it doesn't exist
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir);
      }

      // Check if certificate already exists
      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        console.log('SSL certificate already exists');
        resolve();
        return;
      }

      // Generate a keypair
      const keys = forge.pki.rsa.generateKeyPair(2048);

      // Create a certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

      // Add subject and issuer information
      const attrs = [{
        name: 'commonName',
        value: 'localhost'
      }, {
        name: 'organizationName',
        value: 'Speech Therapy App'
      }, {
        shortName: 'ST',
        value: 'US'
      }];

      cert.setSubject(attrs);
      cert.setIssuer(attrs); // The issuer is the same as the subject for self-signed certificates

      // Sign the certificate
      cert.sign(keys.privateKey);

      // Convert to PEM format
      const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
      const certificatePem = forge.pki.certificateToPem(cert);

      // Save private key and certificate
      fs.writeFileSync(keyPath, privateKeyPem);
      fs.writeFileSync(certPath, certificatePem);

      console.log('SSL certificate generated successfully');
      resolve();
    } catch (error) {
      console.error('Error generating certificate:', error);
      reject(error);
    }
  });
};

// Function to start the server
const startServer = async () => {
  try {
    // Generate certificate if needed
    await generateCertificate();

    // Start the server
    require('./server');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 