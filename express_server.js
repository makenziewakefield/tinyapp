const express = require("express");
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());

////////////////////////////////////////////////////////
//////////////////// ROUTE HANDLERS ////////////////////
////////////////////////////////////////////////////////

// Redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send(`
    <html>
      <head>
        <title>404 Not Found</title>
      </head>
      <body>
        <h1>404 Not Found</h1>
        <p>The requested URL does not exist.</p>
      </body>
    </html>
  `);
  }

});

// Endpoint to return JSON representation to the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Render the URLs index page with template variables
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id || !users[req.cookies.user_id]) {
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

  const urlsArray = Object.keys(urlDatabase).map(shortURL => {
    console.log("shortURL:", shortURL);
    console.log("longURL:", urlDatabase[shortURL].longURL);
    return {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      userID: urlDatabase[shortURL].userID
    };
  });
  const templateVars = {
    urls: urlsArray,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Render the new URL form page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: users[req.cookies.user_id],
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// Render the show URL page with template variables
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

// Render registration template
app.get("/register", (req, res) => {
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: req.user
  }
  res.render("register", templateVars);
});

// Render the login form
app.get("/login", (req, res) => {
  if (req.cookies.user_id && users[req.cookies.user_id]) {
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
  if (urlDatabase[id]) {
    urlDatabase[id].longURL = newLongURL;
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
  const { email, password } = req.body;
  const user = findUserbyEmail(email, users);

  if (user && user.password === password) {
    req.user = user;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password")
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
  const newUser = {
    id: userID,
    email,
    password
  };
  users[userID] = newUser;

  res.cookie("user_id", userID);
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

/////////////////////////////////////////////////////////
///////////////// SERVER INITIALIZATION /////////////////
/////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});