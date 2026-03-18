const app = require('./src/app');

const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle errors after server starts
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ FATAL ERROR starting server:', error);
  console.error(error.stack);
  process.exit(1);
}
