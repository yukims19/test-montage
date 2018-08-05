const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const { Client } = require("pg");
const escape = require("pg-escape");
const connectionString =
  "postgres://omahrmiojnmlax:61741e41fc32e87113a2f76723798be243e97b556907120f6edd5b6e91aa335d@ec2-50-17-250-38.compute-1.amazonaws.com:5432/d162q4l6qggmkj";
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
client.connect();
const worker = require("./worker");

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

// Answer API requests.
app.get("/api", function(req, res) {
  res.set("Content-Type", "application/json");
  res.send('{"message":"Hello from the custom server!"}');
});

app.get("/apii", function(req, res) {
  res.set("Content-Type", "application/json");
  res.send('{"message":"Hello from the yuki!"}');
});

app.get("/user/:id", (req, res) => {
  console.log("here is /user/:id");
  console.log(req.params.id);
  if (req.params.id == "initialdefault-firstuser") {
    var sql = "SELECT * FROM people LIMIT 1";
  } else {
    var sql = escape(
      "SELECT * FROM people where producthunt_id= %L",
      req.params.id
    );
  }
  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows[0];
    res.send(resData);
  });
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM people";
  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows;
    res.send(resData);
  });
});

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split("&");
  const uid = "MDQ6VXNlcjI3Mzk5NjU2";
  let sqlfilter = filters.map(slug => {
    client.query(
      escape(
        "SELECT exists (SELECT 1 FROM posts WHERE slug = %L LIMIT 1)",
        slug
      ),
      (error, response) => {
        const isSlugNew = !response.rows[0].exists;
        if (isSlugNew) {
          console.log("worker here++++++++++");
          worker.queuePostBySlug(slug, uid);
        }
      }
    );
    return "'" + slug + "'";
  });
  const sql = escape(
    "SELECT * FROM people WHERE producthunt_id IN (SELECT uid FROM votes WHERE pid IN (SELECT id FROM posts WHERE slug in (%s)));",
    sqlfilter.toString()
  );
  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows;
    res.send(resData);
  });
});

app.post("/login", (req, res) => {
  const token = req.body.token;
  const userid = req.body.userid;
  console.log("Got you login");
  console.log(token);
  console.log(userid);
  const sql = escape(
    "UPDATE users SET token=%L WHERE userid=%L; INSERT INTO users (userid, token) SELECT %L, %L WHERE NOT EXISTS (SELECT * FROM users WHERE userid= %L);",
    token,
    userid,
    userid,
    token,
    userid
  );
  client.query(sql, (error, response) => {
    console.log(error, response);
  });
});

// All remaining requests return the React app, so it can handle routing.
app.get("*", function(request, response) {
  response.sendFile(path.resolve(__dirname, "../react-ui/build", "index.html"));
});
app.listen(PORT, function() {
  console.error(
    `Node cluster worker ${process.pid}: listening on port ${PORT}`
  );
});
