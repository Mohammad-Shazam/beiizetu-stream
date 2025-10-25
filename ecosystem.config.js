module.exports = {
  apps: [
    { 
      name: "beiizetu-ui", 
      script: "npm", 
      args: "run start", 
      cwd: ".", 
      env: { NODE_ENV: "production" } 
    },
    { 
      name: "beiizetu-worker", 
      script: "node", 
      args: "worker/transcode.js", 
      cwd: ".", 
      env: { 
        NODE_ENV: "production", 
        MEDIA_ROOT: process.env.MEDIA_ROOT || "/opt/beiizetu-stream/media" 
      } 
    }
  ]
};
