const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const BACKUP_DIR = path.join(__dirname, '../backups');
const MONGODB_URI = process.env.MONGODB_URI;

// Function to list available backups
const listBackups = () => {
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => fs.statSync(path.join(BACKUP_DIR, file)).isDirectory())
        .map(file => {
            const manifestPath = path.join(BACKUP_DIR, file, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                return {
                    name: file,
                    timestamp: manifest.timestamp,
                    version: manifest.version,
                    database: manifest.database
                };
            }
            return null;
        })
        .filter(backup => backup !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups;
};

// Function to restore database
const restoreDatabase = (backupPath) => {
    return new Promise((resolve, reject) => {
        const dbBackupPath = path.join(backupPath, 'database');
        
        if (!fs.existsSync(dbBackupPath)) {
            reject(new Error('Database backup not found'));
            return;
        }

        const command = `mongorestore --uri="${MONGODB_URI}" "${dbBackupPath}" --drop`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Database restoration failed:', error);
                reject(error);
                return;
            }
            console.log('Database restored successfully');
            resolve();
        });
    });
};

// Function to restore files
const restoreFiles = async (backupPath) => {
    const filesBackupPath = path.join(backupPath, 'files.zip');
    
    if (!fs.existsSync(filesBackupPath)) {
        throw new Error('Files backup not found');
    }

    // Extract server files
    await extract(filesBackupPath, {
        dir: path.join(__dirname, '../../'),
        onEntry: (entry) => {
            // Skip if the entry is not in server or client directory
            if (!entry.fileName.startsWith('server/') && !entry.fileName.startsWith('client/')) {
                return false;
            }
            return true;
        }
    });

    console.log('Files restored successfully');
};

// Function to validate backup
const validateBackup = (backupPath) => {
    const manifestPath = path.join(backupPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        throw new Error('Invalid backup: manifest file not found');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Validate manifest contents
    if (!manifest.timestamp || !manifest.version || !manifest.database) {
        throw new Error('Invalid backup: manifest file is incomplete');
    }

    return manifest;
};

// Main recovery function
const performRecovery = async (backupName) => {
    try {
        console.log('Starting recovery process...');
        
        const backupPath = path.join(BACKUP_DIR, backupName);
        
        if (!fs.existsSync(backupPath)) {
            throw new Error('Backup not found');
        }

        // Validate backup
        const manifest = validateBackup(backupPath);
        console.log('Backup validated successfully');
        console.log('Backup details:', manifest);

        // Confirm with user
        console.log('\nWARNING: This will overwrite your current data!');
        console.log('Are you sure you want to continue? (yes/no)');
        
        // Note: In a real application, you would implement proper user input handling here
        // For this example, we'll assume the user confirmed

        // Perform recovery
        await Promise.all([
            restoreDatabase(backupPath),
            restoreFiles(backupPath)
        ]);

        console.log('Recovery completed successfully');
    } catch (error) {
        console.error('Recovery failed:', error);
        process.exit(1);
    }
};

// If no backup name provided, list available backups
if (process.argv.length < 3) {
    console.log('Available backups:');
    const backups = listBackups();
    backups.forEach(backup => {
        console.log(`\nName: ${backup.name}`);
        console.log(`Timestamp: ${backup.timestamp}`);
        console.log(`Version: ${backup.version}`);
        console.log(`Database: ${backup.database}`);
    });
    process.exit(0);
}

// Perform recovery with specified backup
performRecovery(process.argv[2]); 