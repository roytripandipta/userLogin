const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const bcrypt = require("bcrypt");
const dbPath = path.join(__dirname, "userData.db");
let db = null;

const initiateServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error in connecting to server: ${e.message}`);
    process.exit(1);
  }
};

initiateServer();

app.post("/register", async (req, res) => {
  try {
    const { username, name, password, gender, location } = req.body;
    // console.log(password);

    getUser = `
        select * from user where username = '${username}';
        `;

    const user = await db.get(getUser);

    if (user === undefined) {
      if (password.length < 5) {
        res.status(400);
        res.send("Password too short");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);
        insertQuery = `
                insert into user (username, name, password, gender, location) 
                values ('${username}','${name}', '${hashedPassword}', '${gender}', '${location}')
                `;

        const dbResponse = await db.run(insertQuery);
        const id = dbResponse.lastID;
        res.status(200);
        res.send("User created successfully");
      }
    } else {
      res.status(400);
      res.send("User already exists");
    }
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const getUserQuery = `
        select * from user where username='${username}';
        `;
    const dbUser = await db.get(getUserQuery);

    if (dbUser === undefined) {
      res.status(400);
      res.send("Invalid user");
    } else {
      const isMatched = await bcrypt.compare(password, dbUser.password);
      if (isMatched === true) {
        res.status(200);
        res.send("Login success!");
      } else {
        res.status(400);
        res.send("Invalid password");
      }
    }
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
});

module.exports = app;
