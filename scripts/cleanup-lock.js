const fs = require('fs');
const path = require('path');
const lockPath = path.join(__dirname, '..', '.next', 'dev', 'lock');
if (fs.existsSync(lockPath)) {
  fs.unlinkSync(lockPath);
  console.log('Removed .next/dev/lock');
}
