const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const BACKUP_DIR = path.join(__dirname, '../backups');
const MONGODB_URI = process.env.MONGODB_URI;

// Validate MongoDB URI
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create timestamp for backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupName = `backup_${timestamp}`;
const backupPath = path.join(BACKUP_DIR, backupName);

// Create backup directory
fs.mkdirSync(backupPath);

// Function to backup MongoDB database
const backupDatabase = async () => {
    try {
        const dbBackupPath = path.join(backupPath, 'database');
        fs.mkdirSync(dbBackupPath);

        // Connect to MongoDB with options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
            connectTimeoutMS: 10000,
            family: 4, // Force IPv4
            directConnection: true, // Try direct connection first
            ssl: true, // Enable SSL
            tls: true, // Enable TLS
            tlsAllowInvalidCertificates: false, // Don't allow invalid certificates
            tlsAllowInvalidHostnames: false, // Don't allow invalid hostnames
            authSource: 'admin', // Use admin database for authentication
            srvMaxHosts: 1, // Limit the number of hosts to try
            srvServiceName: 'mongodb' // Specify the service name
        };

        console.log('Attempting to connect to MongoDB Atlas...');
        console.log('Using URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password in logs
        
        // Try to connect with the provided URI
        await mongoose.connect(MONGODB_URI, options);
        console.log('Connected to MongoDB Atlas successfully');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name));

        // Backup each collection
        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`Backing up collection: ${collectionName}`);
            
            try {
                // Get all documents from the collection
                const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();
                
                // Write to a JSON file
                const filePath = path.join(dbBackupPath, `${collectionName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
                console.log(`Backed up ${documents.length} documents from ${collectionName}`);
            } catch (collectionError) {
                console.error(`Error backing up collection ${collectionName}:`, collectionError.message);
                // Continue with next collection even if one fails
                continue;
            }
        }

        // Close the connection
        await mongoose.connection.close();
        console.log('Database backup completed successfully');
    } catch (error) {
        console.error('Database backup failed:', error.message);
        if (error.code === 'ENOTFOUND') {
            console.error('\nNetwork error: Could not connect to MongoDB Atlas. Please check:');
            console.error('1. Your internet connection');
            console.error('2. Your IP address is whitelisted in MongoDB Atlas');
            console.error('3. The cluster is running in MongoDB Atlas');
            console.error('\nTo whitelist your IP:');
            console.error('1. Go to MongoDB Atlas dashboard');
            console.error('2. Click "Network Access"');
            console.error('3. Click "Add IP Address"');
            console.error('4. Add your current IP or use "0.0.0.0/0" to allow all IPs');
        } else if (error.code === 'MongoParseError') {
            console.error('\nMongoDB URI Error: Please check your connection string format');
            console.error('Expected format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
        } else if (error.code === 'MongoServerSelectionError') {
            console.error('\nServer Selection Error: Could not connect to any MongoDB server');
            console.error('Please check if your MongoDB Atlas cluster is running');
        }
        throw error;
    }
};

// Function to backup application files
const backupFiles = () => {
    return new Promise((resolve, reject) => {
        const filesBackupPath = path.join(backupPath, 'files.zip');
        const output = fs.createWriteStream(filesBackupPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            console.log('Files backup completed successfully');
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Add server files
        archive.directory(path.join(__dirname, '../'), 'server', {
            ignore: ['node_modules/**', 'backups/**', 'cert/**']
        });

        // Add client files
        archive.directory(path.join(__dirname, '../../client'), 'client', {
            ignore: ['node_modules/**', 'build/**']
        });

        archive.finalize();
    });
};

// Function to create a manifest file
const createManifest = () => {
    const manifest = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version,
        database: MONGODB_URI.split('/').pop().split('?')[0],
        backupType: 'full',
        contents: {
            database: true,
            files: true
        }
    };

    fs.writeFileSync(
        path.join(backupPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
};

// Main backup function
const performBackup = async () => {
    try {
        console.log('Starting backup process...');
        
        // Create manifest first
        createManifest();
        
        // Perform backups in parallel
        await Promise.all([
            backupDatabase(),
            backupFiles()
        ]);

        console.log('Backup completed successfully');
    } catch (error) {
        console.error('Backup failed:', error.message);
        process.exit(1);
    }
};

// Run backup
performBackup(); 