const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const remoteUser = 'dh_kbd6eq';
const remoteHost = 'cantfoc.us';
const remotePath = '~/seraph.cantfoc.us/';
const buildDir = path.resolve(__dirname, './build');

try {
  execSync(
    `scp -r ${buildDir}/* ${remoteUser}@${remoteHost}:${remotePath}`,
    { stdio: 'inherit' }
  );
  console.log('Upload complete.');
} catch (err) {
  console.error('Upload failed:', err.message);
}
