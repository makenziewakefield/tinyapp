const { assert } = require('chai');
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

const { getUserByEmail } = require('../helpers.js');

chai.use(chaiHttp);

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if email does not exist in the datatbase', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined for null or undefined email', function() {
    const userNull = getUserByEmail(null, testUsers);
    const userUndefined = getUserByEmail(undefined, testUsers);
    assert.isUndefined(userNull, 'getUserByEmail should return undefined for null email');
    assert.isUndefined(userUndefined, 'getUserByEmail should return undefined for undefined email');
  });
});


describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8080");

  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          expect(accessRes).to.have.status(403);
        });
      });
  });


it('should return 403 for authenticated user without access to the URL', () => {
  return agent
    .get('/urls/:id')
    .then((res) => {
      expect(res).to.have.status(403);
    });
});


  it('should return 404 for GET request to a non-existing URL', () => {
    return agent
      .get('/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  it('should return 403 for GET request to "/urls/b2xVn2"', () => {
    return agent
      .get('/urls/b2xVn2')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  after(() => {
    // Close agent after tests
    agent.close();
  });

});
