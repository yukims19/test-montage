const { Client } = require("pg");

var config = parse(
  "postgres://someuser:somepassword@somehost:381/somedatabase"
);

const client = new Client({ connectionString: connectionString });
client.connect();

client.query(
  "CREATE TABLE people (id SERIAL, name TEXT, url TEXT, twitter TEXT, github TEXT, AvatarUrl TEXT, location TEXT, email TEXT, producthunt_id TEXT UNIQUE, PRIMARY KEY(id, producthunt_id) );",
  (err, res) => {
    console.log(err, res);
  }
);
client.query("CREATE TABLE votes (uid TEXT, pid INT)", (err, res) => {
  console.log(err, res);
});
client.query(
  "CREATE TABLE posts(id SERIAL, slug TEXT UNIQUE, cursor TEXT, PRIMARY KEY (id, slug))",
  (err, res) => {
    console.log(err, res);
    client.end();
  }
);
client.query(
  "CREATE TABLE users (userid TEXT PRIMARY KEY, token TEXT);",
  (err, res) => {
    console.log(err, res);
  }
);

/*SQLITE*/
/*const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");
db.serialize(() => {
  //customers table
  db.run(
    "CREATE TABLE people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT, twitter TEXT, github TEXT, AvatarUrl TEXT, location TEXT, email TEXT, producthunt_id TEXT, CONSTRAINT con_emp_name_unique UNIQUE (name, url, twitter, github, AvatarUrl, location, email));"
  );

  //votes table
  db.run("CREATE TABLE votes (uid NUM, pid NUM)");

  //posts table
  db.run(
    "create table posts(id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, cursor TEXT, CONSTRAINT unique_slug UNIQUE(slug))"
  );
  console.log("successfully created the tables");
});

db.close();*/
