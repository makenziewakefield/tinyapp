const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Global object to store users
const users = {
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

////////////////////////////////////////////////////////
///////////////////// MIDDLEWARE ///////////////////////
////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

////////////////////////////////////////////////////////
//////////////////// ROUTE HANDLERS ////////////////////
////////////////////////////////////////////////////////

// Redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    res.status(401).send(`
    <html>
      <head>
        <title>Unauthorized</title>
      </head>
      <body>
        <h1>Unauthorized</h1>
        <p>You need to <a href="/login">log in</a> to view this URL.</p>
      </body>
    </html>
  `);
  return;
  }

  const loggedInUserID = req.session.user_id;
  const url = urlDatabase[req.params.id];

  if (!url || url.userID !== loggedInUserID) {
    res.status(404).send(`
    <html>
      <head>
        <title>404 Not Found</title>
      </head>
      <body>
        <h1>404 Not Found</h1>
        <p>The requested URL does not exist or you do not have permission to view it.</p>
      </body>
    </html>
  `);
  return;
  }

  const templateVars = {
    id: req.params.id,
    longURL: url.longURL,
    user: users[loggedInUserID]
  }

  res.render("urls_show", templateVars);
});

// Endpoint to return JSON representation to the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Render the URLs index page with template variables
app.get("/urls", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    res.send(`
      <html>
        <head>
          <title>Login Required</title>
        </head>
        <body>
          <h1>Login Required</h1>
          <p>You need to <a href="/login">log in</a> or <a href="/register">register</a> to view your URLs.</p>
        </body>
      </html>
    `);
    return;
  }

   const loggedInUserID = req.session.user_id;
   const userURLs = urlsForUser(loggedInUserID);

  const urlsArray = Object.keys(urlDatabase).map(shortURL => {
    return {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      userID: urlDatabase[shortURL].userID
    };
  });
  const templateVars = {
    urls: urlsArray,
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Render the new URL form page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});

// Render the show URL page with template variables
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  if (!userID || !users[userID]) {
    return res.status(401).send("You need to be logged in to access this page.");
  }

  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== userID) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

  const templateVars = {
    id: urlID,
    longURL: url.longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

// Render registration template
app.get("/register", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: req.user
  }
  res.render("register", templateVars);
});

// Render the login form
app.get("/login", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: req.user
  };
  res.render("login", templateVars);
});

// Handle form submission to add a new URL to the database
app.post("/urls", (req, res) => {
  if (!req.user) {
    res.status(401).send("You need to be logged in to create new URLs.");
    return;
  }
  let generatedID = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[generatedID] = { longURL, userID: req.user.id };
  res.redirect(`/urls/${generatedID}`)
});

// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (!urlDatabase[id]) {
    res.status(404).send("URL not found");
    return;
  }

  if (!req.session.user_id || !users[req.session.user_id]) {
    res.status(401).send("You need to be logged in to edit URLs.");
    return;
  }

  if (urlDatabase[id].userID !== req.session.user_id) {
    res.status(403).send("You do not have permission to edit this URL.");
    return;
  }

  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

// POST route to delete URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    res.status(404).send("URL not found");
    return;
  }

  if (!req.session.user_id || !users[req.session.user_id]) {
    res.status(401).send("You need to be logged in to delete URLs.");
    return;
  }

  if (urlDatabase[id].userID !== req.session.user_id) {
    res.status(403).send("You do not have permission to delete this URL.");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// POST route to handle requests to login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserbyEmail(email, users);

  if (!user) {
    return res.status(403).send("Invalid email or password");
  }

  if (bcrypt.compareSync(password, user.password)) {
    req.user = user;
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password");
  }
});

// POST route to handle logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// POST route to handle user registration
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const { email, password } = req.body;

  if (findUserbyEmail(email, users)) {
    res.status(400).send("Email is already registered");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userID,
    email,
    password: hashedPassword
  };

  users[userID] = newUser;

  req.session.user_id = userID;
  res.redirect("/urls");
});

//////////////////////////////////////////////////////////
/////////////////// HELPER FUNCTIONS /////////////////////
//////////////////////////////////////////////////////////

const findUserbyEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

// Function to generate a random 6-character string for short URLs
const generateRandomString = () => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

/////////////////////////////////////////////////////////
///////////////// SERVER INITIALIZATION /////////////////
/////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});