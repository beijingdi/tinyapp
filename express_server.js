
const {getUserByEmail, generateRandomString, urlsForUser, urlDatabase} = require('./helpers');

const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const PORT = 8080; 


const salt = bcrypt.genSaltSync(18);
app.use(cookieSession({
  name: 'session',
  keys: [salt, "Do you want more salt?" ]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

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
  return res.redirect('login');

});

app.get('/urls/new', (req, res) => {
  if (req.session['user_id']) {
    const templateVars = {  user: users[req.session['user_id']] }
    return res.render('urls_new', templateVars)
  }
  
  
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(users[req.session['user_id']]), user: users[req.session['user_id']] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session['user_id']] };
  if (req.session['user_id']) {
    console.log(req.session['user_id']);
    res.status(400);
    res.send("please register first");
    return res.render("urls_new", templateVars);
  }
  res.render("user_login", templateVars);
  
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] , user: users[req.session['user_id']]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "www.google.com";
  res.redirect(longURL);
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

app.post("/urls/:shortURL/delete", (req,res) => {
  const templateVars = { user: users[req.session['user_id']]};
  if (urlsForUser(users[req.session['user_id']]).hasOwnProperty(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls")
  }
  res.render(user_login, templateVars);

});

app.post("/urls/:id/update", (req,res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
})

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session['user_id']]};
  res.render('user_login',templateVars);
});

app.post('/login', (req, res) => {
  console.log(req.body.password);
  console.log(typeof(req.body.password));
  if (getUserByEmail(req.body.email, users) == false) {
    res.status(403);
    return res.send("e-mail is not registered.");
  }
  if (!bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].hashedPassword)){
    res.status(403);
    return res.send("wrong password!");
  }
  res.session('user_id',users[getUserByEmail(req.body.email, users)].id);
  const templateVars = {user: users[req.session['user_id']]};
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  delete req.session["user_id"];
  res.redirect("/urls");
  console.log(users);
});

app.get('/register', (req,res) => {
  const templateVars = { user: users[req.session['user_id']]};
  res.render("user_new", templateVars);
})

app.post('/register', (req,res) => {
  if (!req.body.email) {
    res.status(400);
    return res.send('e-mail cannot be empty');
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400);
    return res.send('email already exists');
  }
  let newID = generateRandomString();
  users[newID] = {};
  users[newID]["id"] = newID;
  users[newID].email = req.body.email;
  users[newID].hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.session["user_id"] = newID;
  res.redirect("/urls");

});


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
