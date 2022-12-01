const functions = require('firebase-functions');
const app = require('../app');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Unhandled exception! 💥💥 shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('Databse connected succesfully!');
});

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection !💥💥 shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM FOUND! 💥');
  server.close(() => {
    console.log('process terminated 💥💥');
  });
});

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
