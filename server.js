const app = require('./app.js');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err);
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
  console.log(err, err.message);
  console.log('Unhandled rejection !💥💥 shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
