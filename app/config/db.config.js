var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE alert (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            league text , 
            country text, 
            email text, 
            clubname text
            )`,
        (err) => {
            if (err) {
                console.log("database is already created")
            }
        });  
    }
});


module.exports = db