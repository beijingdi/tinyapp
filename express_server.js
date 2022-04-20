//Initialization uwu
function generateRandomString() {
  return Math.random().toString(36).slice(7);
}
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; 
app.set("view engine", "ejs")

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
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "www.google.com";
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.post("/urls/:id/update", (req,res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get('/register', (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("user_new", templateVars);
})

app.post('/register', (req,res) => {
  let newID = generateRandomString();
  users[newID] = {};
  users[newID]["id"] = newID;
  users[newID].email = req.body.email;
  users[newID].password = req.body.password;
  res.cookie("user_id", newID);
  res.redirect("/urls");

})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
