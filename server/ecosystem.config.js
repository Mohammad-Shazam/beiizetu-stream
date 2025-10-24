module.exports = {
  apps: [
    {
      name: "beiizetu-server",
      script: "dist/index.js",
      cwd: ".",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024"
    }
  ]
};