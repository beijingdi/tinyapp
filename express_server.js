/*
** Initialization
*/
const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');
const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { existsSync } = require('fs');
const PORT = 8080; 
const salt = bcrypt.genSaltSync(18);
app.use(cookieSession({
  name: 'session',
  keys: [salt, "Do you want more salt?" ]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
/*
**database
*/
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
  i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};
let users = { 
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


/*
**if user is logged in: redirect to /urls; if user is not logged in: redirect to /login
*/
app.get("/", (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');

});
/*
**get register page. if a user is logged in, redirect them to /urls. if a user is not logged in, redirect to registration page
*/
app.get('/register', (req,res) => {
  if(req.session['user_id']){
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session['user_id']]};
  res.render("user_new", templateVars);
})
/*
**post to register page: return error if email exists or is empty, redirect to /urls when registered successfully
*/
app.post('/register', (req,res) => {
  if (!req.body.email) {
    res.status(403);
    return res.send('e-mail cannot be empty. Please <a href="./register">retry</a>');
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(403);
    return res.send('email already exists. Please <a href="./register">retry</a>');
  }
  let newID = generateRandomString();
  users[newID] = {};
  users[newID]["id"] = newID;
  users[newID].email = req.body.email;
  users[newID].hashedPassword = bcrypt.hashSync(req.body.password);
  req.session["user_id"] = newID;
  res.redirect("/urls");

});
/*
**get login page, redirct to /urls if already logged in
*/
app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session['user_id']]};
  res.render('user_login',templateVars);
});
/*
**post to login page. display log-in status, encrypt cookie and redirect to /urls when succeeded, redirect to error page if failed. 
*/
app.post('/login', (req, res) => {
  if (getUserByEmail(req.body.email, users) === undefined) {
    res.status(403);
    return res.send('e-mail does not exist, please <a href="./register">register</a> first');
  }
  if (!bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].hashedPassword)){
    res.status(403);
    return res.send('wrong password! Please <a href="./login">retry</a>');
  }
  req.session.user_id = users[getUserByEmail(req.body.email, users)].id;
  res.redirect("/urls");
});

/*
**access create new url page - only logged in users can access
*/
app.get('/urls/new', (req, res) => {
  if (req.session['user_id']) {
    const templateVars = {  user: users[req.session['user_id']] }
    return res.render('urls_new', templateVars);
  }
  res.status(403).send('Please <a href="../../login">login</a>');
  
})
/*
**create a tiny url and redirct to the page with url info in logged in, returns an error if not
*/
app.post('/urls',(req, res) => {
  if (req.session['user_id']) {
    let newShortURL = generateRandomString();
    urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    console.log(urlDatabase);
    return res.redirect(`/urls/${newShortURL}`);
  }
  res.status(403).send('Please <a href="/login">login</a>')
});
/*
** display all urls a user created
*/
app.get("/urls", (req, res) => {
  if (req.session['user_id']) {
    const templateVars = { urls: urlsForUser(req.session['user_id'], urlDatabase), user: users[req.session['user_id']]};
    return res.render("urls_index", templateVars);
  }
  res.status(403).send('Please <a href="/login">login</a>');
});

/*
** Only the owner can access the page for shortURL. 
*/ 
app.get("/urls/:id", (req, res) => {
  if (!req.session['user_id']) {
    return res.status(403).send('Please <a href="../../login">login</a>');
  }
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    return res.status(403).send('URL does not exist');
  }
  if (urlDatabase[req.params.id].userID !== req.session['user_id']) {
    return res.status(403).send('Access denied.Please <a href="../../login">login</a> as the owner');
  }
  if (urlDatabase[req.params.id].id !== req.session['user_id']){
    const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]["longURL"] , user: users[req.session['user_id']]};
    return res.render("urls_show", templateVars);
  }
});
/*
**post request to edit the long url for a short url
*/
app.post("/urls/:id", (req,res) => {
  if (!req.session['user_id']) {
    return res.status(403).send('Please <a href="../../login">login</a>');
  }
  if (urlDatabase[req.params.id].userID !== req.session['user_id']) {
    return res.status(403).send('Access denied.Please <a href="../../login">login</a> as the owner');
  }
  if (urlDatabase[req.params.id].id !== req.session['user_id']) {
    urlDatabase[req.params.id].longURL = req.body.newURL;
    return res.redirect("/urls");
  }
})
/*
**delete the URL record. Only owner can access
*/
app.post("/urls/:id/delete", (req,res) => {
  if (!req.session['user_id']) {
    return res.status(403).send('Please <a href="../../login">login</a>');
  }
  if (urlDatabase[req.params.id].userID !== req.session['user_id']) {
    return res.status(403).send('Access denied.Please <a href="../../login">login</a> as the owner');
  }
  
  if (urlDatabase[req.params.id].userID === req.session['user_id']) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls")
  }
});
/*
** Anyone can visit the website with its existing short URL
*/
app.get("/u/:id", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    return res.status(403).send('URL does not exist.');
  }
  return res.redirect(urlDatabase[req.params.id].longURL);
});
/*
**logout
*/
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
