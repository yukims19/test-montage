import React, { Component } from "react";
import { Tabs, Icon, Collapse } from "antd";
import "./App.css";
import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import idx from "idx";
/*** Be sure to create an app on https://onegraph.com, replace the APP_ID here, and add the chrome-extension id to your CORS origins ***/
const APP_ID = "59f1697f-4947-49c0-964e-8e3d4fa640be";
const auth = new OneGraphAuth({
  appId: APP_ID,
  oauthFinishPath: "/index.html"
});
const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const GET_TwitterQuery = gql`
  query($twitter: String) {
    twitter {
      user(screenName: $twitter) {
        id
        timeline {
          tweets {
            id
            favoriteCount
            video {
              id
            }
            createdAt
            text
            idStr
            user {
              id
              screenName
              name
              profileImageUrlHttps
              profileBannerUrl
              profileUseBackgroundImage
            }
          }
        }
      }
    }
  }
`;

class TwitterInfo extends Component {
  render() {
    return (
      <Query
        query={GET_TwitterQuery}
        variables={{
          twitter: this.props.restwitter ? this.props.restwitter : ""
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (idx(data, _ => _.twitter.user.timeline)) {
            return (
              <div className="tab-twitter">
                {/* Twitter Background and avatar
                                 <div className="twitter-back-img">
                                 {idx(
                                 data,
                                 _ =>
                                 _.twitter.user.timeline.tweets[0].user
                                 .profileUseBackgroundImage
                                 )
                                 ? <img
                                 alt="Twitter Background"
                                 src={idx(
                                 data,
                                 _ =>
                                 _.twitter.user.timeline.tweets[0].user
                                 .profileBannerUrl
                                 )}
                                 />
                                 : ""}
                                 </div>
                                 <div className="twitter-back-avatar-container">
                                 <img
                                 alt="Twitter Avatar"
                                 className="twitter-back-avatar"
                                 src={idx(
                                 data,
                                 _ =>
                                 _.twitter.user.timeline.tweets[0].user
                                 .profileImageUrlHttps
                                 ).replace("_normal", "")}
                                 />
                                 </div>*/}
                {data.twitter.user.timeline.tweets.map((item, index) => {
                  return (
                    <div className="card" key={index}>
                      <div className="card-body">
                        <img
                          src={item.user.profileImageUrlHttps}
                          alt="Avatar"
                        />
                        <div className="names">
                          <h5 className="card-title">
                            <a
                              href={
                                "https://twitter.com/" + item.user.screenName
                              }
                            >
                              {item.user.name}
                            </a>
                          </h5>
                          <p>
                            @{item.user.screenName}
                          </p>
                        </div>
                        <a
                          href={
                            "https://twitter.com/" +
                            item.user.screenName +
                            "/status/" +
                            item.idStr
                          }
                        >
                          <i className="fab fa-twitter twittericon" />
                        </a>
                        <p className="card-text">
                          {item.text}
                          <br />
                          <span>
                            {item.createdAt.split(" ")[3].split(":")[0] > 12
                              ? item.createdAt.split(" ")[3].split(":")[0] -
                                12 +
                                ":" +
                                item.createdAt.split(" ")[3].split(":")[1] +
                                " PM"
                              : item.createdAt
                                  .split(" ")[3]
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":") + " AM"}
                          </span>
                          <span>
                            {" - " +
                              item.createdAt.split(" ").slice(1, 3).join(" ") +
                              " " +
                              item.createdAt.split(" ")[
                                item.createdAt.split(" ").length - 1
                              ]}
                          </span>
                        </p>
                        <div className="card-bottom">
                          <p>
                            <i className="fas fa-heart" /> {item.favoriteCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return <div>No Data Found</div>;
          }
        }}
      </Query>
    );
  }
}
const GET_YoutubeQuery = gql`
  query($github: String, $twitter: String, $URL: String) {
    eventil {
      user(github: $github, twitter: $twitter) {
        id
        presentations {
          id
          video_url
          draft {
            title
          }
          youtubeVideo {
            id
            statistics {
              viewCount
              dislikeCount
              likeCount
            }
          }
        }
      }
    }
    descuri(url: $URL) {
      other {
        descuri {
          youTube {
            uri
          }
        }
        uri
      }
    }
  }
`;

const GET_DescuriYoutubeStats = gql`
  query($id: String!) {
    youTubeVideo(id: $id) {
      statistics {
        dislikeCount
        likeCount
        viewCount
      }
      id
      snippet {
        title
      }
    }
  }
`;

class DescuriYoutubeStats extends Component {
  render() {
    if (!this.props.videoId) {
      return <div />;
    } else {
      return (
        <Query
          query={GET_DescuriYoutubeStats}
          variables={{
            id: this.props.videoId
          }}
        >
          {({ loading, error, data }) => {
            if (loading) return <div>Loading...</div>;
            if (error) {
              console.log(error);
              return <div>Uh oh, something went wrong!</div>;
            }
            return (
              <div>
                <p className="video-title">
                  {idx(data, _ => _.youTubeVideo.snippet.title)}
                </p>
                <div className="video-stats">
                  <div>
                    {idx(data, _ => _.youTubeVideo.statistics.viewCount)} views
                  </div>
                  <div className="thumbs">
                    <div>
                      <i className="fas fa-thumbs-up" />{" "}
                      {idx(data, _ => _.youTubeVideo.statistics.likeCount)}
                    </div>
                    <div>
                      <i className="fas fa-thumbs-down" />{" "}
                      {idx(data, _ => _.youTubeVideo.statistics.dislikeCount)}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Query>
      );
    }
  }
}

class YoutubeInfo extends Component {
  render() {
    return (
      <Query
        query={GET_YoutubeQuery}
        variables={{
          github: this.props.resgithub ? this.props.resgithub : "",
          twitter: this.props.restwitter ? this.props.restwitter : "",
          URL: this.props.resurl ? this.props.resurl : "" // ? this.props.resurl : "/"
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          let eventil_video = null;
          let descuri_video = null;
          /*###### Eventil
                    if (idx(data, _ => _.eventil.user.presentations)) {
                    eventil_video = data.eventil.user.presentations.map(
                    (item, index) => {
                    return (
                    <div key={index}>
                    {item.youtubeVideo
                    ? <div>
                    <iframe
                    title={index}
                    src={
                    "http://www.youtube.com/embed/" +
                    item.youtubeVideo.id
                    }
                    width="560"
                    height="315"
                    />
                    <p className="video-title">
                    {item.draft.title}
                    </p>
                    <div className="video-stats">
                    <div>
                    {item.youtubeVideo.statistics.viewCount} views
                    </div>
                    <div className="thumbs">
                    <div>
                    <i className="fas fa-thumbs-up" />{" "}
                    {item.youtubeVideo.statistics.likeCount}
                    </div>
                    <div>
                    <i className="fas fa-thumbs-down" />{" "}
                    {item.youtubeVideo.statistics.dislikeCount}
                    </div>
                    </div>
                    </div>
                    </div>
                    : " "}
                    </div>
                    );
                    }
                    );
                    }*/
          if (idx(data, _ => _.descuri.other)) {
            descuri_video = data.descuri.other.map(item => {
              return item.descuri.youTube.map((item, index) => {
                return (
                  <div key={index}>
                    <iframe
                      title={index}
                      src={
                        "http://www.youtube.com/embed/" +
                        item.uri.split("v=")[1]
                      }
                      width="560"
                      height="315"
                    />
                    {/*<DescuriYoutubeStats videoId={item.uri.split("v=")[1]} />*/}
                  </div>
                );
              });
            });
          }
          return (
            <div className="tab-youtube">
              {eventil_video ||
              (descuri_video[0] ? descuri_video[0][0] : descuri_video[0])
                ? <div>
                    <div>
                      {eventil_video}
                    </div>
                    <div>
                      {descuri_video}
                    </div>
                  </div>
                : <div>No Data Found</div>}
            </div>
          );
        }}
      </Query>
    );
  }
}

const GET_GithubQuery = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
        id
        avatarUrl
        url
        login
        starredRepositories {
          totalCount
        }
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(
          first: 6
          orderBy: { direction: DESC, field: UPDATED_AT }
        ) {
          nodes {
            id
            description
            url
            name
            forks {
              totalCount
            }
            stargazers {
              totalCount
            }
            languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  id
                  color
                  name
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

class GithubInfo extends Component {
  render() {
    if (!this.props.resgithub) {
      return <div>No Data Found</div>;
    }
    return (
      <Query
        query={GET_GithubQuery}
        variables={{ github: this.props.resgithub }}
      >
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (!idx(data, _ => _.gitHub.user)) return <div>No Data Found</div>;
          return (
            <div className="tab-github">
              <div className="github-summary">
                <li>
                  Total Repositories:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.repositories.totalCount)}
                  </span>
                </li>
                <li>
                  Stars:{" "}
                  <span>
                    {idx(
                      data,
                      _ => _.gitHub.user.starredRepositories.totalCount
                    )}
                  </span>
                </li>
                <li>
                  Follower:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.followers.totalCount)}
                  </span>
                </li>
                <li>
                  Following:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.following.totalCount)}
                  </span>
                </li>
              </div>
              <div className="repos">
                {idx(
                  data,
                  _ => _.gitHub.user.repositories.nodes
                ).map((item, index) => {
                  return (
                    <div className="repo-card" key={item.name}>
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">
                            <a href={item.url}>
                              {item.name}
                            </a>
                          </h5>
                          <p className="card-text">
                            {item.description}
                          </p>
                          <div className="card-bottom">
                            {item.languages.edges[0]
                              ? <p>
                                  <i
                                    className="fas fa-circle"
                                    style={{
                                      color: item.languages.edges[0].node.color
                                    }}
                                  />
                                  {item.languages.edges[0].node.name}
                                </p>
                              : " "}
                            {item.stargazers
                              ? <p>
                                  <i className="fas fa-star" />
                                  {item.stargazers.totalCount}
                                </p>
                              : " "}
                            {item.forks
                              ? <p>
                                  <i className="fas fa-code-branch" />
                                  {item.forks.totalCount}
                                </p>
                              : " "}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

class LoginButton extends Component {
  render() {
    return (
      <button
        className={"loginbtn loginbtn-" + this.props.eventClass}
        onClick={this.props.onClick}
      >
        <i className={"fab fa-" + this.props.eventClass} />
        <span> </span>Login with {this.props.event}
      </button>
    );
  }
}

class UserTabInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventil: false,
      github: false,
      youtube: false,
      twitter: false
    };
    this.isLoggedIn("eventil");
    this.isLoggedIn("github");
    this.isLoggedIn("youtube");
    this.isLoggedIn("twitter");
  }
  isLoggedIn(event) {
    auth.isLoggedIn(event).then(isLoggedIn => {
      this.setState({
        [event]: isLoggedIn
      });
    });
  }
  handleClick(service) {
    try {
      auth.login(service).then(() => {
        auth.isLoggedIn(service).then(isLoggedIn => {
          if (isLoggedIn) {
            console.log("Successfully logged in to " + service);
            this.setState({
              [service]: isLoggedIn
            });
          } else {
            console.log("Did not grant auth for service " + service);
            this.setState({
              service: isLoggedIn
            });
          }
        });
      });
    } catch (e) {
      console.error("Problem logging in", e);
    }
  }
  renderButton(eventTitle, eventClass) {
    return (
      <LoginButton
        event={eventTitle}
        eventClass={eventClass}
        onClick={() => this.handleClick(eventClass)}
      />
    );
  }
  render() {
    return (
      <div className="right-tabs">
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <Icon type="github" />Github
              </span>
            }
            key="1"
          >
            <div className="tab-content" id="github-content">
              {this.state.github
                ? <ApolloProvider client={client}>
                    <GithubInfo resgithub={this.props.resgithub} />
                  </ApolloProvider>
                : this.renderButton("GitHub", "github")}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="youtube" />Youtube
              </span>
            }
            key="2"
          >
            <div className="tab-content" id="youtube-content">
              {this.state.youtube
                ? <ApolloProvider client={client}>
                    <YoutubeInfo
                      resgithub={this.props.resgithub}
                      restwitter={this.props.restwitter}
                      resurl={this.props.resurl}
                    />
                  </ApolloProvider>
                : this.renderButton("Youtube", "youtube")}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="twitter" />Twitter
              </span>
            }
            key="3"
          >
            <div className="tab-content" id="twitter-content">
              {this.state.twitter
                ? <ApolloProvider client={client}>
                    <TwitterInfo restwitter={this.props.restwitter} />
                  </ApolloProvider>
                : this.renderButton("Twitter", "twitter")}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

class UserGeneralInfo extends Component {
  render() {
    return (
      <div className="right-general-info">
        <img
          src={
            this.props.resavatarurl
              ? this.props.resavatarurl.replace("_normal", "")
              : ""
          }
        />
        <div className="user-general-info">
          <div className="username">
            <h3>
              {this.props.resname}
            </h3>
            <small>
              <cite title={this.props.reslocation}>
                {this.props.reslocation} <i className="fas fa-map-marker-alt" />
              </cite>
            </small>
          </div>
          <div className="useraccounts">
            <ul>
              <li>
                <i className="fas fa-envelope" /> {this.props.resemail}
              </li>
              <li>
                <i className="fas fa-globe" /> {this.props.resurl}
              </li>
              <li>
                <i className="fab fa-github-square" /> {this.props.resgithub}
              </li>
              <li>
                <i className="fab fa-twitter-square" /> {this.props.restwitter}
              </li>
              <li>
                <i className="fab fa-reddit-square" /> {this.props.resreddit}
              </li>
              <li>
                <i className="fab fa-linkedin" /> {this.props.reslinkedin}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div className="left-filter">
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Filter" key="1">
            <div className="input-group mb-3">
              <input
                id="post-filter"
                type="text"
                className="form-control"
                placeholder="Post ID"
                aria-label="Post ID"
                aria-describedby="basic-addon2"
                ref="postfilter"
                onKeyDown={this.props.keyPress}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    this.props.handleClickAdd(this.refs.postfilter.value)}
                >
                  +
                </button>
              </div>
            </div>
            {this.props.filters.map(e => {
              return (
                <li key={e}>
                  <i
                    className="fas fa-times"
                    onClick={() => this.props.handleClickDelete(e)}
                  />{" "}
                  {e}
                </li>
              );
            })}
          </Panel>
        </Collapse>
      </div>
    );
  }
}

class AllUsers extends Component {
  state = {
    response: ""
  };

  componentDidMount() {
    this.callUsers()
      .then(res => this.setState({ response: res }))
      .catch(err => console.log(err));
  }
  componentDidUpdate(prevProps) {
    if (this.props.filters !== prevProps.filters) {
      this.callUsers()
        .then(res => this.setState({ response: res }))
        .catch(err => console.log(err));
    }
  }
  callUsers = async () => {
    let filterparam = "/" + this.props.filters.join("&");
    const response = await fetch("/users" + filterparam);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  render() {
    return (
      <div className="left-body">
        {this.state.response
          ? this.state.response.map(e => {
              return (
                <li
                  key={e.producthunt_id}
                  onClick={() => this.props.handleUserClick(e.producthunt_id)}
                >
                  <img src={e.avatarurl} alt="Avatar" />
                  <div className="alluser-userinfo">
                    <p>
                      {e ? e.name : ""}
                    </p>
                    <small>
                      <cite title={e ? e.location : ""}>
                        {e ? e.location : ""}{" "}
                        <i className="fas fa-map-marker-alt" />
                      </cite>
                    </small>
                  </div>
                </li>
              );
            })
          : ""}
      </div>
    );
  }
}

const GET_HeaderUser = gql`
  query {
    me {
      github {
        name
        avatarUrl
      }
    }
  }
`;

class HeaderUser extends Component {
  render() {
    return (
      <Query query={GET_HeaderUser}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          return (
            <header className="right-header">
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i>
                    {" "}<img
                      src={idx(data, _ => _.me.github.avatarUrl)}
                      alt="Avatar"
                    />
                  </i>
                  {idx(data, _ => _.me.github.name)}
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={this.props.handleLogout}
                  >
                    Logout
                  </a>
                </div>
              </div>
            </header>
          );
        }}
      </Query>
    );
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventil: false,
      resname: null,
      resurl: null,
      restwitter: null,
      resgithub: null,
      resavatarurl: null,
      reslocation: null,
      resid: null,
      resemail: null,
      filters: []
    };
    this.isLoggedIn("github");
  }

  componentDidMount() {
    this.callFirstUser()
      .then(res => {
        this.setState({
          resname: res.name,
          resurl: res.url,
          restwitter: res.twitter,
          resgithub: res.github,
          resavatarurl: res.avatarurl,
          reslocation: res.location,
          resid: res.producthunt_id,
          resemail: res.email,
          filters: []
        });
      })
      .catch(err => console.log(err));
  }

  callFirstUser = async () => {
    const response = await fetch("/user/initialdefault-firstuser");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  callUser = async id => {
    const response = await fetch("/user/" + id);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleClickDelete(e) {
    let filterlist = this.state.filters.slice();
    var index = filterlist.indexOf(e);
    var list1 = filterlist.slice(0, index);
    var list2 = filterlist.slice(index + 1, filterlist.length);
    var list = list1.concat(list2);
    this.setState({
      filters: list
    });
  }

  handleClickAdd(input) {
    //Need to check if the post name(id) is valid!
    if (input.match(/[a-zA-Z^0-9]/)) {
      let filterlist = this.state.filters.slice();
      if (!filterlist.includes(input)) {
        filterlist.push(input);
      }
      this.setState(
        {
          filters: filterlist
        },
        () => {
          console.log(this.state.filters);
        }
      );
      document.getElementById("post-filter").value = "";
    } else {
      alert("Invalid input");
    }
  }

  keyPress(e) {
    if (e.keyCode === 13) {
      this.handleClickAdd(e.target.value);
    }
  }

  handleUserClick(id) {
    this.callUser(id)
      .then(res => {
        this.setState({
          resname: res.name,
          resurl: res.url,
          restwitter: res.twitter,
          resgithub: res.github,
          resavatarurl: res.avatarurl,
          reslocation: res.location,
          resemail: res.email,
          resid: res.producthunt_id
        });
      })
      .catch(err => console.log(err));
  }

  isLoggedIn(event) {
    auth.isLoggedIn(event).then(isLoggedIn => {
      this.setState({
        [event]: isLoggedIn
      });
    });
  }
  callLogin = async (token, userid) => {
    const response = await fetch("/login", {
      method: "POST",
      body: JSON.stringify({ token: token, userid: userid }),
      headers: { "Content-Type": "application/json" }
    }).then(res => res);

    const body = await response;
    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  handleClick(service) {
    try {
      auth.login(service).then(() => {
        auth.isLoggedIn(service).then(isLoggedIn => {
          if (isLoggedIn) {
            console.log("Successfully logged in to " + service);
            this.setState({
              [service]: isLoggedIn
            });

            const token = JSON.parse(
              localStorage.getItem(
                "oneGraph:59f1697f-4947-49c0-964e-8e3d4fa640be"
              )
            )["accessToken"];
            const GET_GithubId = `query {
                                    me {
                                      github {
                                        id
                                      }
                                    }
                                  }`;
            fetch(
              "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
              {
                method: "POST",
                body: JSON.stringify({
                  query: GET_GithubId,
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
                const userid = json.data.me.github.id;
                this.callLogin(token, userid).then(res => {
                  console.log(res);
                });
              });
          } else {
            console.log("Did not grant auth for service " + service);
            this.setState({
              service: isLoggedIn
            });
          }
        });
      });
    } catch (e) {
      console.error("Problem logging in", e);
    }
  }

  handleLogout() {
    auth.logout("github").then(response => {
      if (response.result === "success") {
        console.log("Logout succeeded");
        console.log(response);
        this.setState({
          github: false
        });
      } else {
        console.log("Logout failed");
      }
    });
  }
  renderButton(eventTitle, eventClass) {
    return (
      <LoginButton
        event={eventTitle}
        eventClass={eventClass}
        onClick={() => this.handleClick(eventClass)}
      />
    );
  }
  render() {
    return (
      <div>
        {this.state.github
          ? <div className="App">
              <div className="left-column">
                <Filter
                  keyPress={this.keyPress.bind(this)}
                  handleClickDelete={this.handleClickDelete.bind(this)}
                  handleClickAdd={this.handleClickAdd.bind(this)}
                  filters={this.state.filters}
                />
                <AllUsers
                  handleUserClick={this.handleUserClick.bind(this)}
                  filters={this.state.filters}
                />
              </div>
              <div className="right-column">
                <ApolloProvider client={client}>
                  <HeaderUser handleLogout={this.handleLogout.bind(this)} />
                </ApolloProvider>
                <div className="right-body">
                  <UserGeneralInfo
                    resname={this.state.resname}
                    resurl={this.state.resurl}
                    restwitter={this.state.restwitter}
                    resgithub={this.state.resgithub}
                    resavatarurl={this.state.resavatarurl}
                    reslocation={this.state.reslocation}
                    resemail={this.state.resemail}
                  />
                  <UserTabInfo
                    restwitter={this.state.restwitter}
                    resgithub={this.state.resgithub}
                    resurl={this.state.resurl}
                  />
                </div>
              </div>
            </div>
          : <div>
              <div className="login-background">Montage</div>
              <div className="login-eventilbtn">
                {this.renderButton("GitHub", "github")}
              </div>
            </div>}
      </div>
    );
  }
}

export default App;
