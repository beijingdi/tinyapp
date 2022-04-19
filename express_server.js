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
  const templateVars = { urls: urlDatabase, username:req.cookies['username'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , username:req.cookies['username']};
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

// app.post("/login", (req,res) => {
//   console.log(req.body.username);
//   res.cookies.username = req.body.username;
//   //assign the username to the new cookie
//   console.log(req.cookies)
//   res.redirect("/urls");

// })



app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  
  //const userNameVars = {
  //  userName: req.cookies["username"],
  //};
  //console.log(userNameVars);
  //console.log(typeof(userNameVars));
  //res.render("_header.ejs", userNameVars);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  //console.log(res.cookie['username']);
  res.redirect("/urls");
});

app.get('/register', (req,res) => {
  const templateVars = { username: req.cookies['username']};
  res.render("user_new", templateVars);
})






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
