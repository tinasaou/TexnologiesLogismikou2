const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'p@ssword',
    database: 'dietplan'
});


module.exports = connection; 