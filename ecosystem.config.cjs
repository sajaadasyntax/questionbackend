const path = require('path');

const root = __dirname;
const logsDir = path.join(root, 'logs');

module.exports = {
  apps: [
    {
      name: 'questinare-api',
      cwd: root,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: path.join(logsDir, 'api-error.log'),
      out_file: path.join(logsDir, 'api-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
