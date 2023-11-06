const express = require("express");
const cookieParser = require("cookie-parser");
const e = require("express");
const app = express();
const PORT = 8080; // default port 8080

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
console.log(generateRandomString());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  userRandomID: {
    userID: "userRandomID",
    email: "a@a.com",
    password: "1234"
  },
  user2RandomID: {
    userID: "user2RandomID",
    email: "b@b.com",
    password: "1234"
  },
};

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

//PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//HOME
app.get("/", (req, res) => {
//   const user = users[userID];
//   const templateVars = {
//     email: user.email,
//   }
  res.render("urls_index");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  const templateVars = {
    urls: urlDatabase,
    email: req.cookies.email,
    user: req.cookies["userID", userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  const templateVars = {
    email: req.cookies.email,
    user: req.cookies["userID", userID],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["userID", userID],
    email: req.cookies.email,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // get long url from req.body.longURL
  const longURL = req.body.longURL;
  //generate short id
  const id = generateRandomString();
  //store in database
  urlDatabase[id] = longURL;
  //redirect
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found.");
  }
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = updatedURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found.");
  }
});

//LOGIN
app.get("/login", (req, res) => {
    const templateVars = {
        email: req.cookies['email']
    };
    res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  //retrieve email and password from body
  const email = req.body.email;
  const password = req.body.password;
  //check if both fields were filled out
  if (!email || !password) {
    return res.status(400).send("Bad Request - Please provide an email AND password.");
  }
  //if invalid login return 403
  if (!isUser(email, users)) {
    return res.status(403).send("Bad Request - Please provide a valid login or create an account.")
  }
  //if isUser true => attach cookie and redirect to urls
  if (isUser(email, users)) {
    if (password !== isUser(email, users).password) {
      return res.status(403).send("Invalid password")
    }
  } 
    res.cookie("email", email);
    res.redirect("/urls");
});

//REGISTER
app.get("/register", (req, res) => {
    res.render("urls_register");
});

app.post("/register", (req, res) => {
  //retrieve email and password from body
  const email = req.body.email;
  const password = req.body.password;

  //redirect if fields left empty
  if (!email || !password) {
    return res.status(400).send("Bad Request - Please create an account.");
  }
  //return error if isUser
  if (isUser(email, users)) {
    return res.status(400).send('Bad Request - A user with that email is already registered.');
  }
  //if email is unique => populate user object to store in users database
    //generate random userID to assign to and within user object
  const userID = generateRandomString();
  const user = {
    userID,
    email,
    password
  }

  //update users database
  users[userID] = user;

  console.log(users);
  //userID cookie
  res.cookie("email", email);
  res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
    const email = req.body.email;
    res.clearCookie("email", email);
    res.redirect("/login");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
