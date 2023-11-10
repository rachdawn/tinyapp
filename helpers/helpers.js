//implement a function that generates a random 6-digit alphanumeric string
function generateRandomString() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  
  //email in database checker
  const isUser = function(email, users) {
  for (const user in users) {
      let userObject = {};
      if (users[user]['email'] === email) {
          userObject = users[user];
          return userObject;
      }
    }
    return null;
  };
  
  //link urlDatabase to userID
  const urlOwner = function(userID, database) {
      const userURLs = {};
      for (const id in database) {
          if (database[id].userID === userID) {
              userURLs[id] = database[id];
          }
      }
      return userURLs;
  };

  module.exports = {
    generateRandomString,
    isUser,
    urlOwner
  }