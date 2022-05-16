process.env.NODE_ENV = "test";
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const db = require("../db/connection");
const app = require("../app.js");
const request = require("supertest");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("get api topics", () => {
  test("200 : should respond with an array of topic objects with the properties slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((data) => {
        expect(data.body.topics).toHaveLength(3);
        data.body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
  test("404 : should respond with bad request if given an endpoint other than topics", () => {
    return request(app)
      .get("/api/fish")
      .expect(404)
      .then((data) => {
        expect(data.text).toEqual("Endpoint Not Found");
      });
  });
});

describe("get api articles", () => {
  test("200: should return an article object which has the following properties, author ,title, article_id, body, topic, created_at and votes", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((data) => {
        expect(data.body.article).toHaveProperty(
          "author",
          "title",
          "article_id",
          "body",
          "topic",
          "created_at",
          "votes"
        );
      });
  });
  test("400: if the article_id is not a number return bad request message", () => {
    return request(app)
      .get("/api/articles/fish")
      .expect(400)
      .then((data) => {
        expect(data.text).toEqual("Bad Request");
      });
  });
  test("404: if the article_id is a number but not the number matching an article return a not found message", () => {
    return request(app)
      .get("/api/articles/9999999")
      .expect(404)
      .then((data) => {
        expect(data.text).toEqual("Not Found");
      });
  });
});

describe("patch api articles", () => {
  test("201 : should accept an object with a POSITIVE number value. Update the article given in the endpoint with the amount of votes given in the article. ", () => {
    const updateVotes = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/1")
      .expect(201)
      .send(updateVotes)
      .then((data) => {
        expect(data.body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
        });
      });
  });
  test("201 : should accept an object with a NEGATIVE number value. Update the article given in the endpoint with the amount of votes given in the article. ", () => {
    const updateVotes = { inc_votes: -50 };

    return request(app)
      .patch("/api/articles/1")
      .expect(201)
      .send(updateVotes)
      .then((data) => {
        expect(data.body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 50,
        });
      });
  });
  test("400: check that the object which is being given has the correct properties", () => {
    const updateVotes = { haha_wrong_prop: -50 };

    return request(app)
      .patch("/api/articles/1")
      .expect(400)
      .send(updateVotes)
      .then((data) => {
          expect(data.text).toEqual("Wrong Object Type")
      });
  });
});
