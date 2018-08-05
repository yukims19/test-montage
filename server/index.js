const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

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
  res.send({ name: "hello????????????/" });
  /*
    let resData;
    client.query(sql, (error, response) => {
        //console.log(err, res);
        resData = response.rows[0];
        res.send(resData);
    });
    */
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM people";
  res.send({ name: "hello????????????/" });
  /*
    let resData;
    client.query(sql, (error, response) => {
        //console.log(err, res);
        resData = response.rows;
        res.send(resData);
    });*/
});

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split("&");
  const uid = "MDQ6VXNlcjI3Mzk5NjU2";
  res.send([{ name: "hello????????????/" }, { name: "2222222222222" }]);
  /*
    let sqlfilter = filters.map(slug => {
        client.query(
            escape(
                "SELECT exists (SELECT 1 FROM posts WHERE slug = %L LIMIT 1)",
                slug
            ),
            (error, response) => {
                const isSlugNew = !response.rows[0].exists;
                if (isSlugNew) {
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
    });*/
});

app.post("/login", (req, res) => {
  const token = req.body.token;
  const userid = req.body.userid;
  console.log("Got you login");
  console.log(token);
  console.log(userid);
  /*
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
    });*/
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
