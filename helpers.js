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


const urlsForUser = (id, database) => {
  let userURL = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userURL[url] = database[url];
    }

  }
  return userURL;
}
module.exports = {getUserByEmail, generateRandomString, urlsForUser};