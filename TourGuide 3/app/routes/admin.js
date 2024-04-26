const sql = require("../models/db");
const Response = require("../entity/Response");
const User = require("../entity/User");
const session = require("express-session");

function is_admin(uid) {
  return uid && uid <= 5;
}

function permission_check(res, on_success) {
  let uid = session["login"];

  if (uid === undefined || uid === null) {
    res.send(new Response("Please login to continue!", false, null, "/login.html"));
    return;
  }

  check_user_type(uid, (type) => {
    if (type === 'Admin') {
      on_success();
    }else {
      res.send(new Response("You do not have permission to view this page!", false, null, "/"));
      return;
    }

  })
}

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
module.exports = app => {

  let router = require("express").Router();

  router.get("/check", (req, res) => {

    let uid = session["login"];

    if (uid === undefined || uid === null) {
      res.send(new Response("Please login to continue!", false, null, "/login.html"));
      return;
    }else if (!is_admin(uid)) {
      res.send(new Response("You should be an admin to continue!", false, null, "/"));
      return;
    }else {
      res.send(new Response(null, true, null, null));
      return;
    }

  });


  router.get("/users", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    if (!is_admin(uid)) {
      res.send(new Response("You don't have permission to access this data!", false, null, "/"));
      return;
    }else {
      sql.query('SELECT * FROM user', (err, res) => {
        if (err) {
          send(new Response(err.message, false, null, null));
          return;
        }

        send(new Response(null, true, res, null));
        return;
      });

    }


  });
  router.get("/places", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    if (!is_admin(uid)) {
      res.send(new Response("You don't have permission to access this data!", false, null, "/"));
      return;
    }else {
      sql.query('SELECT * FROM place', (err, res) => {
        if (err) {
          send(new Response(err.message, false, null, null));
          return;
        }

        send(new Response(null, true, res, null));
        return;
      });

    }


  });

  router.put("/user", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    if (!is_admin(uid)) {
      send(new Response("You don't have permission to access this data!", false, null, "/"));
      return;
    }

    sql.query("UPDATE user SET status = ? WHERE id = ?",
        [req.body.status, req.body.id],
        (err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }
        send(new Response("User status was updated", true, null, null));
    });

  });
  router.post("/place", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let send = function (response) {
      res.send(response);
    };

    sql.query("INSERT INTO place SET ?", req.body, (err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }
      send(new Response("Place was added", true, null, null));
    });

  });
  router.get("/guides", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    {
      sql.query('SELECT * FROM user LEFT JOIN guide ON user.id = guide.uid WHERE type = "Guide"', (err, res) => {
        if (err) {
          send(new Response(err.message, false, null, null));
          return;
        }

        send(new Response(null, true, res, null));
        return;
      });

    }

  });

  router.get("/rate", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };

      sql.query("SELECT AVG(rating) AS rating FROM rating WHERE type = ? AND rid = ?",  [req.query.type, req.query.rid], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res[0]);
      });

    });

  });

  router.post("/rider", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let send = function (response) {
      res.send(response);
    };

    sql.query("INSERT INTO rider SET ?", req.body, (err, res) => {
      if (err) {
        send(new Response(err.message, false, null, null));
        return;
      }
      send(new Response("Rider was added", true, null, null));
    });

  });
  router.get("/riders", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    {
      sql.query('SELECT * FROM rider', (err, res) => {
        if (err) {
          send(new Response(err.message, false, null, null));
          return;
        }

        send(new Response(null, true, res, null));
        return;
      });

    }

  });

  router.post("/package", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response("Package was added!", true, data, null));
          return;
        }
      };

      let time = new Date().toISOString().slice(0, 19).replace('T', ' ');

      sql.query("INSERT INTO package SET ?", {uid: session['login'], created: time, ...req.body}, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, null);
      });

    });

  });
  router.delete("/package", (req, res) => {

    let id = req.body.id;
    let uid = session["login"];

    let callback = (err, data) => {
      if (err){
        res.send(new Response(err.message, false, null, null));
      } else {
        res.send(new Response("Package was deleted!", true, data, null));
        return;
      }
    };

    sql.query("DELETE FROM package WHERE id = ? AND uid = ?", [id, uid], (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, null);
    });

  });
  router.get("/package", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query(`SELECT package.id as id,
                        uid,
                        name,
                        description,
                        created,
                        activities,
                        services,
                        extra,
                        price, days, guides, hotel,
                        transport, travel_cost,
                        person,
                        user.id as uid,
                        username,
                        full_name,
                        email,
                        phone,
                        password,
                        type,
                        status,
                        experience,
                        preferences
                 FROM package LEFT JOIN user ON package.uid = user.id
                 WHERE type = 'Admin'
      ORDER BY id DESC`, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });

  app.use('/api/admin/', router);
};
