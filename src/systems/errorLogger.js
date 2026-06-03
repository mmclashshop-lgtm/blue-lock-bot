const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

class ErrorLogger {
  constructor() {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  _getTimestamp() {
    return new Date().toISOString();
  }

  _getLogFile(type) {
    const date = new Date().toISOString().split('T')[0];
    return path.join(LOG_DIR, `${type}-${date}.log`);
  }

  _writeToFile(file, message) {
    try {
      fs.appendFileSync(file, message + '\n');
    } catch (e) {
      console.error('Failed to write log:', e);
    }
  }

  error(context, error) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [ERROR] [${context}] ${error.message}\n${error.stack || ''}`;
    console.error(msg);
    this._writeToFile(this._getLogFile('error'), msg);
  }

  warn(context, message) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [WARN] [${context}] ${message}`;
    console.warn(msg);
    this._writeToFile(this._getLogFile('warn'), msg);
  }

  info(context, message) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [INFO] [${context}] ${message}`;
    console.log(msg);
    this._writeToFile(this._getLogFile('info'), msg);
  }

  command(userId, command, success = true, details = '') {
    const timestamp = this._getTimestamp();
    const status = success ? 'SUCCESS' : 'FAILED';
    const msg = `[${timestamp}] [CMD] [${status}] User:${userId} Cmd:${command} ${details}`;
    this._writeToFile(this._getLogFile('commands'), msg);
  }

  economy(userId, action, amount, balance) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [ECO] User:${userId} Action:${action} Amt:${amount} Bal:${balance}`;
    this._writeToFile(this._getLogFile('economy'), msg);
  }

  match(userId1, userId2, result, score) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [MATCH] ${userId1} vs ${userId2} Result:${result} Score:${score}`;
    this._writeToFile(this._getLogFile('matches'), msg);
  }

  security(userId, action, details) {
    const timestamp = this._getTimestamp();
    const msg = `[${timestamp}] [SECURITY] User:${userId} Action:${action} Details:${details}`;
    console.warn(`⚠️ ${msg}`);
    this._writeToFile(this._getLogFile('security'), msg);
  }

  getLogs(type = 'error', date = null) {
    const d = date || new Date().toISOString().split('T')[0];
    const file = path.join(LOG_DIR, `${type}-${d}.log`);
    if (!fs.existsSync(file)) return [];
    try {
      const content = fs.readFileSync(file, 'utf-8');
      return content.split('\n').filter(Boolean).slice(-100);
    } catch {
      return [];
    }
  }

  getStats() {
    const files = fs.readdirSync(LOG_DIR);
    const stats = { error: 0, warn: 0, info: 0, commands: 0, economy: 0, matches: 0, security: 0 };
    files.forEach(f => {
      const type = f.split('-')[0];
      if (stats[type] !== undefined) {
        const content = fs.readFileSync(path.join(LOG_DIR, f), 'utf-8');
        stats[type] += content.split('\n').filter(Boolean).length;
      }
    });
    return stats;
  }
}

module.exports = new ErrorLogger();
