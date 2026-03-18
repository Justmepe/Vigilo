module.exports = {
  apps: [
    {
      name: 'safety-backend',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0',
        DATABASE_PATH: '/var/www/safety/database/safety.db',
        JWT_SECRET: 'szu79AHqdfAsJ26DeZrRlKEvyuqqGXNfOY1Gt8eXTNQ=',
        JWT_REFRESH_SECRET: 'refresh_szu79AHqdfAsJ26DeZrRlKEvyuqqGXNfOY1Gt8eXTNQ=',
        JWT_EXPIRY: '24h',
        LOG_LEVEL: 'info',
        UPLOAD_DIR: '/var/www/safety/backend/uploads',
        CORS_ORIGIN: 'https://safety.creohub.io'
      }
    }
  ]
};
