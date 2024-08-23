const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ', err.stack);
        return;
    }
    console.log('Connected to the database as ID', connection.threadId);
});

module.exports = connection;

// const mysql = require('mysql');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'new_app',
//     port: 3307,
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to database: ', err.stack);
//         return;
//     }
//     console.log('Connected to the database as ID', connection.threadId);
// });

// module.exports = connection;