const session = require("express-session");
const Response = require("../entity/Response");
const sql = require("../models/db");
const User = require("../entity/User");
module.exports = app => {

  let router = require("express").Router();

  router.get("/:id", (req, res) => {

    let uid = session["login"];
    if (uid === undefined || uid === null) {
      res.send(new Response("Please login to continue!", false, null, "/login.html"));
      return;
    }

    let rid = req.params.id;

    if (rid === undefined || rid === null) {
      res.send(new Response("Invalid message recipient!", false, null, "/"));
      return;
    }

    let send = function (response) {
      res.send(response);
    };

    let query = `SELECT * FROM message WHERE (\`from\` = ${uid} AND \`to\` = ${rid}) OR (\`from\` = ${rid} AND \`to\` = ${uid})`;

    sql.query(query, (err, res) => {
      if (err) {
        send(new Response(err.message, false, null, "/"));
        return;
      }

      send(new Response(null, true, {login: session["login"], messages: res}, null));
    });


  });
  router.post("/", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }


    let uid = session["login"];
    if (uid === undefined || uid === null) {
      res.send(new Response("Please login to continue!", false, null, "/login.html"));
      return;
    }

    let rid = req.body.id;
    let message = req.body.message;

    if (rid === undefined || rid === null) {
      res.send(new Response("Invalid message recipient!", false, null, null));
      return;
    }
    if (message === undefined || message === null) {
      res.send(new Response("Invalid message!", false, null, null));
      return;
    }

    let send = function (response) {
      res.send(response);
    };
    let time =new Date().toLocaleString();
    let query = `INSERT INTO message (\`from\`, \`to\`, text, time) VALUES (${uid}, ${rid}, '${message}', '${time}')`;

    sql.query(query, (err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }

      send(new Response(null, true, {id: res.insertId, time}, null));
    });


  });


  app.use('/api/message', router);
};
