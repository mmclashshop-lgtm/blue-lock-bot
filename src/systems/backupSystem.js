const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { execSync } = require('child_process');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');
const MAX_BACKUPS = 10;

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
  ensureDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  const collections = await mongoose.connection.db.listCollections().toArray();
  const data = {};

  for (const col of collections) {
    const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
    data[col.name] = docs;
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  rotateBackups();
  console.log(`Backup created: ${filename} (${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB)`);
  return { filename, path: filepath, size: fs.statSync(filepath).size };
}

async function restoreBackup(filename) {
  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) throw new Error('Backup not found');
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const db = mongoose.connection.db;
  for (const [collectionName, docs] of Object.entries(data)) {
    await db.collection(collectionName).deleteMany({});
    if (docs.length > 0) await db.collection(collectionName).insertMany(docs);
  }
  console.log(`Restored from: ${filename}`);
  return true;
}

function rotateBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .sort()
    .reverse();
  if (files.length > MAX_BACKUPS) {
    for (const f of files.slice(MAX_BACKUPS)) {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    }
  }
}

function getBackupList() {
  ensureDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .map(f => ({ filename: f, size: fs.statSync(path.join(BACKUP_DIR, f)).size, created: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
    .sort((a, b) => b.created - a.created);
}

function startAutoBackup() {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Auto backup triggered...');
    await createBackup();
  });
}

module.exports = { createBackup, restoreBackup, getBackupList, startAutoBackup };
