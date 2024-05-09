const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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


// Middleware to parse URL encoded bodies
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</></body></html>\n");
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }

});

// Endpoint to return JSON representation to the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Render the URLs index page with template variables
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Render the new URL form page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: users[req.cookies.user_id],
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// Render the show URL page with template variables
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user : users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Render registration template
app.get("/register", (req, res) => {
  res.render("register");
});

// Render the login form
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle form submission to add a new URL to the database
app.post("/urls", (req, res) => {
  let generatedID = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[generatedID] = longURL;
  res.redirect(`/urls/${generatedID}`)
});

// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found")
  }
});

// POST route to delete URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

// POST route to handle requests to login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
})

// POST route to handle logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

const isEmailValid = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
  return false;
};

// POST route to handle user registration
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const { email, password } = req.body;

  if (isEmailValid(email, users)) {
    res.status(400).send("Email is already registered");
    return;
  }

  for (let existingUserID in users) {
    if (users[existingUserID].email === email) {
      res.status(400).send("Email alrady exists");
      return;
    }
  };

  const newUser = {
    id: userID,
    email,
    password
  };

  users[userID] = newUser;

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

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