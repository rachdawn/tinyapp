const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080


//implement a function that generates a random 6-digit alphanumeric string
function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};
console.log(generateRandomString());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
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
        res.status(404).send("URL not found");
    };
});

app.post("/urls/:id/update", (req, res) => {
    const id = req.params.id;
    const updatedURL = req.body.updatedURL;
    if (urlDatabase[id]) {
        urlDatabase[id] = updatedURL;
        res.redirect("/urls");
    } else {
        res.status(404).send("URL not found")
    };
});

//logout
app.post("/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect('/urls');
})

//login
app.post("/login", (req, res) => {
    const { username } = req.body;
    if (username) {
        res.cookie('username', username);
        res.redirect('/urls');
    } else {
        res.status(400).send('Bad Request - Please provide a username');
    };
});




app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

