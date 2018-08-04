const { Client } = require("pg");
const escape = require("pg-escape");
const connectionString = "postgresql://yukili:56112533@localhost:5432/montage";
const fetch = require("node-fetch");
const idx = require("idx");

let cursor = null;
let hasNextPage = true;

const productSlug = "submarine-popper";

const client = new Client({ connectionString: connectionString });
client.connect();
var kue = require("kue"),
  queue = kue.createQueue();

var peopleDataQuery = `
  query($name: String) {
  gitHub{
    user(login:$name){
      name
      id
    }
  }
}
`;
const queryVar = {
  slug: "submarine-popper",
  name: "yukims19"
};
const token = "JoumjaDc_nInk-FaysskI8njrLSfwllc22WLiWIGATw";
//kue.app.listen(3000);
let job = queue
  .create("people_data", {
    title: "Get People Data",
    query: peopleDataQuery,
    variables: queryVar,
    token: token
  })
  .save(function(err) {
    if (!err) console.log(job.id);
  });

job
  .on("complete", function(result) {
    console.log("Job completed with data ", result);
  })
  .on("failed attempt", function(errorMessage, doneAttempts) {
    console.log("Job failed");
  })
  .on("failed", function(errorMessage) {
    console.log("Job failed");
  })
  .on("progress", function(progress, data) {
    console.log(
      "\r  job #" + job.id + " " + progress + "% complete with data ",
      data
    );
  });

queue.process("people_data", function(job, done) {
  console.log("procesing");
  peopleData(job.data.query, job.data.variables, done);
});

function peopleData(q, v, done) {
  console.log("hiiiiiiiii");
  console.log(q);
  var bodycontent = {
    query: q,
    variables: v
  };
  console.log(bodycontent);
  fetch(
    "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
    {
      method: "POST",
      body: JSON.stringify(bodycontent),
      headers: {
        Authentication: "Bearer " + token,
        Accept: "application/json"
      }
    }
  )
    .then(res => res.json())
    .catch(error => error)
    .then(json => {
      console.log(json);
      console.log("Setting data here");
      done();
    });
}

//Need to check if productSlug already exist
/*
client.query(
  "INSERT INTO posts(slug) VALUES ('" + productSlug + "');",
  (err, res) => {
    console.log(err, res);
    client.end();
  }
  );

let peopledata = {
  name: "testtest",
  location: "testtest",
  website: "testtest",
  twitter: "testtest",
  github: "testtest",
  avatarURL: "testtest",
  email: "testtest",
  company: "testtest",
  producthunt_id: "testtest"
};
/*
let sql =
  "INSERT INTO people(name, url, twitter, github, AvatarUrl, location, email, producthunt_id) VALUES ('" +
  peopledata.name +
  "'," +
  (peopledata.website ? "'" + peopledata.website + "'," : "null,") +
  (peopledata.twitter ? "'" + peopledata.twitter + "'," : "null,") +
  (peopledata.github ? "'" + peopledata.github + "'," : "null,") +
  (peopledata.avatarURL ? "'" + peopledata.avatarURL + "'," : "null,") +
  (peopledata.location ? "'" + peopledata.location + "'," : "null,") +
  (peopledata.email ? "'" + peopledata.email + "'," : "null,") +
  (peopledata.producthunt_id ? "'" + peopledata.producthunt_id + "'" : "null") +
  ")";

client.query(sql, (err, res) => {
  console.log(err, res);
  client.end();
});*/
/*
var sql = escape(
  "INSERT INTO votes VALUES((select id from people where producthunt_id = %L),(select id from posts where slug = %L))",
  peopledata.producthunt_id,
  productSlug
  );
console.log(["test1", "test2"].toString());
var sql = escape(
  "(SELECT id FROM posts WHERE slug in (%s));",
  ["test1", "test2"].toString()
);

let token;
client.query("SELECT * FROM USERS LIMIT 1;", (err, res) => {
  console.log(err, res);
  token = res.rows[0].token;
  console.log(token);
  console.log("Bearer " + token);
});
*/
/*
const GET_HeaderUser = `
  query {
    me {
      github {
        name
        avatarUrl
        id
      }
    }
  }
`;
const token = "-RKkmL84TUov58KZcIUoJLxGdypYmQ7k4tikDvWNYdw";
fetch(
  "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
  {
    method: "POST",
    body: JSON.stringify({
      query: GET_HeaderUser,
      variables: null
    }),
    headers: {
      Authentication: "Bearer " + token,
      Accept: "application/json"
    }
  }
)
  .then(res => res.json())
  .catch(error => error.json())
  .then(json => {
    console.log(json.data.me.github);
    console.log("userid:::::::::");
    const userid = json.data.me.github.id;

    console.log(userid);
  });


  var kue = require("kue"),
  queue = kue.createQueue();
queue.watchStuckJobs(1000 * 10);
kue.app.listen(3000);

queue.on("ready", () => {
  console.info("Queue is ready!");
});

queue.on("error", err => {
  console.error("There was an error in the main queue!");
  console.error(err);
  console.error(err.stack);
});
let job;
function getPeopleData(e, uid, done) {
  job = queue
    .create("people_data", {
      title: "Get People Data",
      //query: peopleDataQuery,
      //variables: queryVar,
      //token: token,
      slug: e,
      uid: uid
    })
    //!!!!Need to check back what there means!!!!!!!
    .priority("critical")
    .attempts(8)
    .backoff(true)
    .removeOnComplete(false)
    .save(err => {
      if (err) {
        console.log("errorrrrrrrrr!");
        console.error(err);
        done(err);
      }
      if (!err) {
        console.log("not error!!!!");
        done();
      }
    });
}

queue.process("people_data", function(job, done) {
  console.log("jobs here!!!!!!!!");
  console.log(job.slug);
  //  peopleData(job.data.query, job.data.variables, done);
});

function peopleData(q, v, done) {
  var bodycontent = {
    query: q,
    variables: v
  };
  fetch(
    "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
    {
      method: "POST",
      body: JSON.stringify(bodycontent),
      headers: {
        Authentication: "Bearer " + token,
        Accept: "application/json"
      }
    }
  )
    .then(res => res.json())
    .catch(error => error.json())
    .then(json => {
      console.log(json);
      console.log("Setting data here");
    });
  done();
}

module.exports = {
  create: (e, uid, done) => {
    getPeopleData(e, uid, done);
  }
};


*/
