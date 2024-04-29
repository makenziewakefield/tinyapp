const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Middleware to parse URL encoded bodies
app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Render the new URL form page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Render the show URL page with template variables
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Handle form submission to add a new URL to the database
app.post("/urls", (req, res) => {
  let generatedID = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[generatedID] = longURL;
  res.redirect(`/urls/${generatedID}`)
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