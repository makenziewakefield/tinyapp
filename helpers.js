// Function to retrieve a user object by email from database of users
const getUserByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return undefined;
};

// Function to generate a random string of 6 characters
const generateRandomString = () => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Function to retrieve URLs associated with a specific user ID from URL database
const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser }
