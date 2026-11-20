// PM2 Cluster Mode & Load Balancing Configuration
// Run with: pm2 start ecosystem.config.js
// Status:   pm2 status
// Logs:     pm2 logs
// Reload:   pm2 reload all (Zero-downtime)

module.exports = {
  apps: [
    {
      name: 'yoga-backend',
      script: './server/dist/index.js',
      cwd: './server',
      instances: 'max', // Spawns 1 worker per CPU core to load-balance traffic
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M', // Automatically restarts worker if memory leaks exceed 500MB
      autorestart: true,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};
