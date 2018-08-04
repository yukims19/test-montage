const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000;
const { Client } = require("pg");
const escape = require("pg-escape");
const connectionString = "postgresql://yukili:56112533@localhost:5432/montage";
const client = new Client({ connectionString: connectionString });
client.connect();
const worker = require("./worker");

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

app.get("/users", (req, res) => {
  console.log("hello");
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
  let workSlug = [];
  let sqlfilter = filters.map(e => {
    client.query(
      escape("SELECT exists (SELECT 1 FROM posts WHERE slug = %L LIMIT 1)", e),
      (error, response) => {
        if (!response.rows[0].exists) {
          console.log("anything?");
          console.log(e);
          workSlug.push(e);
          console.log(workSlug);
          worker.process(e, uid);
        }
      }
    );
    return "'" + e + "'";
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

app.listen(port, () => console.log(`Listening on port ${port}`));
