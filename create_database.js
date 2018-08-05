const { Client } = require("pg");
const connectionString =
  "postgres://omahrmiojnmlax:61741e41fc32e87113a2f76723798be243e97b556907120f6edd5b6e91aa335d@ec2-50-17-250-38.compute-1.amazonaws.com:5432/d162q4l6qggmkj";

const client = new Client({ connectionString: connectionString, ssl: true });
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
