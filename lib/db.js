var mysql      = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '2017125083',
    database : 'web',
    port : 3306
});
db.connect();
module.exports = db;