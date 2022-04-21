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



const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email == email) {
      return user;
    }
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
}


const urlsForUser = (id) => {
  let userURL = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURL[url] = urlDatabase[url];
    }

  }
  return userURL;
}
module.exports = {getUserByEmail, generateRandomString, urlsForUser,urlDatabase};