import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generate RSA key pair for JWT signing
 */
const generateRSAKeyPair = () => {
  console.log('🔑 Generating RSA key pair for JWT signing...');
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
};

/**
 * Convert PEM to single line format for environment variables
 */
const pemToSingleLine = (pem) => {
  return pem.replace(/\n/g, '\\n');
};

/**
 * Save keys to files
 */
const saveKeysToFiles = (publicKey, privateKey) => {
  const keysDir = path.join(process.cwd(), 'keys');
  
  // Create keys directory if it doesn't exist
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  // Save private key
  fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
  console.log('✅ Private key saved to keys/private.pem');
  
  // Save public key
  fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
  console.log('✅ Public key saved to keys/public.pem');
  
  // Set proper file permissions (readable only by owner)
  fs.chmodSync(path.join(keysDir, 'private.pem'), 0o600);
  fs.chmodSync(path.join(keysDir, 'public.pem'), 0o644);
};

/**
 * Generate .env file with keys
 */
const generateEnvFile = (publicKey, privateKey) => {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Read .env.example if it exists
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }
  
  // Replace JWT keys in the content
  const privateKeyLine = `JWT_PRIVATE_KEY="${pemToSingleLine(privateKey)}"`;
  const publicKeyLine = `JWT_PUBLIC_KEY="${pemToSingleLine(publicKey)}"`;
  
  if (envContent.includes('JWT_PRIVATE_KEY=')) {
    envContent = envContent.replace(/JWT_PRIVATE_KEY=.*/, privateKeyLine);
  } else {
    envContent += `\n${privateKeyLine}`;
  }
  
  if (envContent.includes('JWT_PUBLIC_KEY=')) {
    envContent = envContent.replace(/JWT_PUBLIC_KEY=.*/, publicKeyLine);
  } else {
    envContent += `\n${publicKeyLine}`;
  }
  
  // Generate other required values if not present
  if (!envContent.includes('SESSION_SECRET=')) {
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    envContent += `\nSESSION_SECRET=${sessionSecret}`;
  }
  
  if (!envContent.includes('ENCRYPTION_KEY=')) {
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    envContent += `\nENCRYPTION_KEY=${encryptionKey}`;
  }
  
  // Write .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('✅ Environment file updated: .env');
};

/**
 * Main function
 */
const main = () => {
  try {
    console.log('🚀 ZenTalk JWT Key Generator\n');
    
    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair();
    
    // Save keys to files
    saveKeysToFiles(publicKey, privateKey);
    
    // Generate .env file
    generateEnvFile(publicKey, privateKey);
    
    console.log('\n✨ Key generation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated .env file');
    console.log('2. Update MongoDB URI and other configuration');
    console.log('3. Start the server with: npm run dev');
    console.log('\n⚠️  Important: Keep your private key secure and never commit it to version control!');
    
  } catch (error) {
    console.error('❌ Error generating keys:', error);
    process.exit(1);
  }
};

// Run the script
main();
