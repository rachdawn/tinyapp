const express = require("express");
const cookieParser = require("cookie-parser");
const e = require("express");
const { generateRandomString, isUser, urlOwner } = require("./helpers/helpers"); //helper functions
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//URL DATABASE
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: '8PVbhk' },
  "9sm5xK": { longURL: "http://www.google.com", userID: '8PVbhk' },
};

//USER DATABASE
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
  
  for (const userID in users) {
    const plainTextPassword = users[userID].password;
    const hashedPassword = bcrypt.hashSync(plainTextPassword, 10);
    users[userID].password = hashedPassword;
  }


app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

//PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//REGISTER
app.get("/register", (req, res) => {
    if (req.cookies.email) {
        res.redirect('/urls');
    } else {
      const templateVars = {
        email: null
      };
    res.render("urls_register", templateVars);
    }
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    userID,
    email,
    password: hashedPassword
  }
  //update users database
  users[userID] = user;

  console.log(users);
  //userID cookie
  res.cookie("email", email);
  res.redirect("/urls");
});

//LOGIN
app.get("/login", (req, res) => {
    if (req.cookies.email) {
      res.redirect("/urls");
    } else {
      const templateVars = {
        email: null,
      };
      res.render("urls_login", templateVars);
    }
});
  
app.post("/login", (req, res) => {
    //retrieve email and password from body
    const email = req.body.email;
    const password = req.body.password;
    const user = isUser(email, users);
    //check if both fields were filled out
    if (!email || !password) {
      return res.status(400).send("Bad Request - Please provide an email AND password.");
    }
    //if invalid login return 403
    if (!user) {
      return res.status(403).send("Bad Request - Please provide a valid login or create an account.")
    }
    //if isUser true => attach cookie and redirect to urls
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send('Password does not match.')
    } 
      res.cookie("email", email);
      res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
    const email = req.body.email;
    res.clearCookie("email", email);
    res.redirect("/login");
});

//PROTECTED PATHS
app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  const email = req.cookies.email;
  const user = isUser(email, users);
    if (!user) {
    return res.status(401).send(`
    <html>
      <body>
        <p>You must be <a href="/login">logged in</a> to view this page.</p>
      </body>
    </html>
    `);
  }  
  const userURLS = urlOwner(userID, urlDatabase);

  console.log('userURLS:', userURLS);
  const templateVars = {
    urls: userURLS,
    user: user,
    email: req.cookies.email,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.userID;
  // get long url from req.body.longURL
  const longURL = req.body.longURL;
  //generate short id
  const id = generateRandomString();
  //store in database
  
  urlDatabase[id] = { longURL, userID };
  //redirect
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.email) {
    res.redirect("/login");
  }
  const userID = req.cookies.userID;
  const templateVars = {
    email: req.cookies.email,
    user: req.cookies[("userID", userID)],
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('The short URL you are trying to access does not exist.');
  }
});

app.get("/urls/:id", (req, res) => {
  const email = req.cookies.email;
  const userID = req.cookies.user;
  const id = req.params.id;
  const user = users[userID];
  if (!urlDatabase[id]) {
    return res.status(404).send('The requested URL was not found.');
  }
  if (!email) {
    return res.status(401).send(`
    <html>
    <body>
      <p>You must be <a href="/login">logged in</a> to view this page.</p>
    </body>
    </html>
    `);
  }
  if (!urlOwner(userID, urlDatabase)) {
    return res.status(403).send('You do not have permission to view this page.');
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id].longURL,
    user: user,
    email: req.cookies.email,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id].longURL) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found.");
  }
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;
  if (urlDatabase[id].longURL) {
    urlDatabase[id].longURL = updatedURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found.");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
