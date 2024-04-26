const sql = require("../models/db");
const Response = require("../entity/Response");
const User = require("../entity/User");
const session = require("express-session");

function check_user_type(id, on_type) {
  sql.query('SELECT type FROM user WHERE id='+ id, (err, res) => {
    if (err) {
      on_type('Tourist');
      return;
    }
    on_type(res[0]['type']);
    return;
  });

}
function permission_check(type, on_check) {
  let uid = session["login"];

  if (uid === undefined || uid === null) {
    res.send(new Response("Please login to continue!", false, null, "/login.html"));
    return;
  }
  check_user_type()
}


module.exports = app => {

  let router = require("express").Router();

  router.get("/check", (req, res) => {

    let uid = session["login"];

    if (uid === undefined || uid === null) {
      res.send(new Response("Please login to continue!", false, null, "/login.html"));
      return;
    }
    else {
      res.send(new Response(null, true, null, null));
      return;

    }

  });
  router.get("/details", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    if (uid === undefined || uid === null) {
      res.send(new Response("Please login to continue!", false, null, "/login.html"));
      return;
    }else {
      sql.query('SELECT * FROM user WHERE id='+ uid, (err, res) => {
        if (err) {
          send(new Response(err.message, false, null, null));
          return;
        }

        send(new Response(null, true, res[0], null));
        return;
      });

    }


  });

  router.post("/register", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let user_data = {status: "Pending", ...req.body};

    const user = new User({...user_data});

    let callback = (err, data) => {
      if (err){
        res.send(new Response(err.message, false, null, null));
      } else {
        session["login"] = data['id'];
        res.send(new Response("Successfully registered!", true, null, user.type === "Tourist" ? "/tourist/index.html" : "/guide/index.html"));
        return;
      }
    };

    sql.query("INSERT INTO user SET ?", user, (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, {id: res.insertId, ...user});
    });

  });
  router.post("/login", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let username = req.body.username;
    let password = req.body.password;

    let send = function (response) {
      res.send(response);
    };

    sql.query(`SELECT * FROM user WHERE username='${username}'`,(err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }

      console.log(res);

      if (res.length === 0) {
        send(new Response("Username not found! Please check your username or register!", false, null, null));
        return;
      }

      let user = res[0];
      let pw = user.password;
      if (password !== pw){
        send(new Response("Invalid password!", false, null, null));
        return;
      }

      session["login"] = res[0]['id'];


      let type = user['type'];

      if (type === 'Guide') {
        send(new Response(null, true, null, "/guide/index.html"));
        return;
      }
      if (type === 'Admin') {
        send(new Response(null, true, null, "/admin/index.html"));
        return;
      }
      send(new Response("Successfully logged in!", true, null, "/tourist/index.html"));
      return;
    });

  });
  router.get("/logout", (req, res) => {

    session["login"] = null;
    let send = function (response) {
      res.send(response);
    };

    send(new Response("Logged out successfully!", true, null, "/login.html"));

  });
  router.post("/update", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let callback = (err, data) => {
      if (err){
        res.send(new Response(err.message, false, null, null));
      } else {
        res.send(new Response("Details were updated!", true, null, null));
        return;
      }
    };

    sql.query(
        "UPDATE user SET full_name = ?, email = ?, phone = ? WHERE id = ?",
        [req.body.full_name, req.body.email, req.body.phone, session["login"]],
        (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, null);
    });

  });
  router.post("/update-password", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let current = req.body.current;
    let password = req.body.password;

    let send = function (response) {
      res.send(response);
    };

    sql.query(`SELECT * FROM user WHERE id=${session['login']}`,(err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }

      let user = res[0];
      let pw = user.password;
      if (current !== pw){
        send(new Response("Invalid current password!", false, null, null));
        return;
      }
      if (current === password){
        send(new Response("New password cannot be same as current!", false, null, null));
        return;
      }


      sql.query(
          "UPDATE user SET password = ? WHERE id = ?",
          [req.body.password, session['login']],
          (err, res) => {
            if (err) {
              send(new Response(err.message, false, null, null));
              return;
            }

            send(new Response("Password was updated!", true, null, null));
          });

    });



  });




/*  // Retrieve all published Tutorials
  router.get("/published", tutorials.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", tutorials.findOne);

  // Update a Tutorial with id
  router.put("/:id", tutorials.update);

  // Delete a Tutorial with id
  router.delete("/:id", tutorials.delete);

  // Delete all Tutorials
  router.delete("/", tutorials.deleteAll);*/

  app.use('/api/auth/', router);
};
