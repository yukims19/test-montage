const { Client } = require("pg");
const escape = require("pg-escape");
const connectionString = "postgresql://yukili:56112533@localhost:5432/montage";
/*
const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";
  */

const fetch = require("node-fetch");
const idx = require("idx");
const kue = require("kue"),
  queue = kue.createQueue();
//kue.app.listen(3000);
let cursor = null;
let hasNextPage = true;

const client = new Client({ connectionString: connectionString });

client.connect();
const peopleDataQuery = `
  query($slug: String!, $cursor: String!) {
  productHunt {
    post(slug: $slug) {
      voters(first: 30, after: $cursor) {
        edges {
          node {
            id
            websiteUrl
            gitHubUser {
              login
              websiteUrl
              email
              avatarUrl
              company
              location
            }
            twitter_username
            id
            name
          }
          cursor
        }
        pageInfo {
          startCursor
          hasNextPage
          endCursor
        }
      }
      name
      id
      votes_count
    }
  }
}`;

/*
  twitterUser {
  screenName
  name
  url
  location
  profileImageUrlHttps
  homepageDescuri {
  gitHub {
  gitHubUser {
  avatarUrl
  websiteUrl
  email
  company
  location
  login
  }
  }
  mailto {
  address
  uri
  }
  }
  }*/
function getdata(q, v, token, slug, done) {
  console.log("+++++++++++++++++++++get data+++++++++++++++");
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
      cursor = json.data.productHunt.post.voters.pageInfo.endCursor;
      hasNextPage = json.data.productHunt.post.voters.pageInfo.hasNextPage;
      //Need to store startCursor in posts table to get new voted people
      const startCursor =
        json.data.productHunt.post.voters.pageInfo.startCursor;
      let sqlPostsCursor = escape(
        "UPDATE posts SET cursor = %L WHERE slug = %L;",
        startCursor,
        slug
      );
      client.query(sqlPostsCursor, (err, res) => {
        console.log(err, res);
      });
      console.log(cursor);
      console.log(hasNextPage);
      let peopleData = {
        name: null,
        location: null,
        website: null,
        twitter: null,
        github: null,
        avatarURL: null,
        email: [],
        company: null,
        producthunt_id: null
      };
      const upvoters = json.data.productHunt.post.voters.edges;
      upvoters.forEach((e, index) => {
        const gitHubUser = idx(e, _ => _.node.gitHubUser)
          ? idx(e, _ => _.node.gitHubUser)
          : idx(e, _ => _.node.twitterUser.homepageDescuri.gitHub.gitHubUser);
        const twitterUser = idx(e, _ => _.node.twitterUser)
          ? idx(e, _ => _.node.twitterUser)
          : ""; /*github descuri here*/

        peopleData.producthunt_id = idx(e, _ => _.node.id);
        peopleData.name = idx(e, _ => _.node.name);
        peopleData.twitter = e.node.twitter_username;
        //if null, look for github descuri

        peopleData.github = gitHubUser ? gitHubUser.login : null;

        peopleData.avatarURL = twitterUser
          ? twitterUser.profileImageUrlHttps
          : gitHubUser ? gitHubUser.avatarUrl : null;

        peopleData.website = idx(e, _ => _.node.website_url)
          ? idx(e, _ => _.node.website_url)
          : idx(e, _ => _.node.twitterUser.url)
            ? twitterUser.url
            : gitHubUser ? gitHubUser.websiteUrl : null;

        peopleData.location = idx(e, _ => _.node.twitterUser.location)
          ? twitterUser.location
          : gitHubUser ? gitHubUser.location : null;

        peopleData.company = gitHubUser ? gitHubUser.company : null;

        peopleData.email = idx(e, _ => _.node.gitHubUser.email)
          ? gitHubUser.email
          : twitterUser
            ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              : []
            : [];
        console.log("**********************");
        console.log(peopleData);

        //Table people
        let sqlPeople = escape(
          "INSERT INTO people(name, url, twitter, github, AvatarUrl, location, email, producthunt_id) VALUES (%L,%L,%L,%L,%L,%L,%L,%L)",
          peopleData.name,
          peopleData.website,
          peopleData.twitter,
          peopleData.github,
          peopleData.avatarURL,
          peopleData.location,
          peopleData.email.toString(),
          peopleData.producthunt_id
        );
        client.query(sqlPeople, (err, res) => {
          console.log(err, res);
        });

        //Table votes
        let sqlVotes = escape(
          "INSERT INTO votes VALUES(%L, (select id from posts where slug = %L))",
          peopleData.producthunt_id,
          slug
        );
        client.query(sqlVotes, (err, res) => {
          console.log(err, res);
        });
      });

      if (hasNextPage == true) {
        getdata(
          peopleDataQuery,
          {
            slug: slug,
            cursor: cursor
          },
          token,
          slug,
          done
        );
      } else {
        //client.end();
        done();
      }
    });
}

function getPeopleDataWorker(q, v, token, slug) {
  console.log("!!!!!!!!!!!!!!!!!create job!!!!!!!");
  let job = queue
    .create("people_data", {
      title: "Get People Data",
      query: q,
      variables: v,
      token: token,
      slug: slug
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
    getdata(
      job.data.query,
      job.data.variables,
      job.data.token,
      job.data.slug,
      done
    );
  });
}

function process(slug, uid) {
  const productSlug = slug;
  let sqlPostsSlug = escape("INSERT INTO posts(slug) VALUES (%L);", slug);
  client.query(sqlPostsSlug, (err, res) => {
    console.log(err, res);
  });
  let token;
  client
    .query(escape("SELECT * FROM USERS WHERE userid = %L;", uid))
    .then(res => (token = res.rows[0].token))
    .catch(e => console.log(e))
    .then(() => {
      console.log(token);
      getPeopleDataWorker(
        peopleDataQuery,
        {
          slug: slug,
          cursor: cursor
        },
        token,
        slug
      );
    });
}
module.exports = {
  process: (slug, uid) => {
    process(slug, uid);
  }
};
process("submarine-popper", "MDQ6VXNlcjI3Mzk5NjU2");

//client.end();
