const { assert } = require('chai');

const { getUserByEmail } = require('./helpers.js');

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