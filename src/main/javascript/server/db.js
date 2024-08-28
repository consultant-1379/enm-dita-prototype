define(function(){
	const sqlite = require('sqlite3').verbose();
	let db=null;
	
	function error(err) {
		if (err) {
			console.error(err.message);
		}
    }
	function open(file) {
		let f=file?file:'./db.sql';
		db = new sqlite.Database(f,sqlite.OPEN_READWRITE|sqlite.OPEN_CREATE, error);
	}
	function close() {
		db.close(error);
	}
	function dbQuery(s) {
		db.serialize(function(){
			var rows=[];
		  db.each(s, function(error, row){
			rows.push(row);
		  });
		  return rows;
		});
	}
	function test() {
		open("./db.sql");
		dbQuery(`CREATE TABLE contacts (
			contact_id INTEGER PRIMARY KEY,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			phone TEXT NOT NULL UNIQUE)`
		);
		dbQuery("INSERT INTO contacts (contact_id,first_name,last_name,email,phone) VALUES (1,'Eddie','Bowe','eddie@somewhere.com','12345678990')");
		close();
	}
	test();
	return {test:test};
});