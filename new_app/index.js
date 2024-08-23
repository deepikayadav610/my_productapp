const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const usersRouter = require('./user');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/user', usersRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Node.js server running on port ${port}`);
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});


// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const usersRouter = require('./user');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/user', usersRouter);

// const port = 3005;
// app.listen(port, () => {
//     console.log(`Node.js server running on port ${port}`);
// });

// //error handling
// process.on('uncaughtException', (err) => {
//     console.error('Uncaught Exception:', err);
// });

// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled Rejection:', err);
// });







