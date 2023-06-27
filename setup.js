require("dotenv").config();
const express = require("express");
const session = require('express-session');
const app = express();
const joi = require('joi');

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const MongoClient = require("mongodb").MongoClient;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
const database = new MongoClient(atlasURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));
  

const db = database.db(mongodb_database).collection("Rooms");
db.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });

require("./main")(app, db, joi); // Pass app and db as parameters to main.js
require("./game")(app, db);
require("./result")(app, db);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Running on port " + port);
});
