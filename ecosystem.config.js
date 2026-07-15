module.exports = {
  apps: [
    {
      name: "shakti-yoga-server",
      script: "./server/dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};
