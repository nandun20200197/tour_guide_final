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
function permission_check(res, on_success) {
  let uid = session["login"];

  if (uid === undefined || uid === null) {
    res.send(new Response("Please login to continue!", false, null, "/login.html"));
    return;
  }

  check_user_type(uid, (type) => {
    if (type === 'Guide') {
      on_success();
    }else {
      res.send(new Response("You do not have permission to view this page!", false, null, "/"));
      return;
    }

  })
}


module.exports = app => {

  let router = require("express").Router();

  router.post("/details", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response("Successfully updated!", true, null, null));
          return;
        }
      };


      sql.query("INSERT INTO guide SET ? ON DUPLICATE KEY UPDATE ?", [{uid: session['login'], ...req.body}, {...req.body}], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, {});
      });

    });

  });
  router.get("/details", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query("SELECT * FROM guide WHERE uid = ?", session['login'], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res[0]);
      });

    });

  });
  router.get("/messages", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query("SELECT id, full_name FROM user WHERE id IN (SELECT message.`from` FROM message WHERE message.`to` = ?) OR id IN (SELECT message.`to` FROM message WHERE message.`from` = ?)", [session['login'], session['login']], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });

  router.post("/images", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query("INSERT INTO guide_images SET ?", {uid: session['login'], ...req.body}, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, {});
      });

    });

  });
  router.get("/images", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query("SELECT guide_images.id as id, uid, place, guide_images.image as image, name from guide_images LEFT JOIN place ON guide_images.place = place.id WHERE uid = ? ", session['login'], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });

  router.get("/places", (req, res) => {

    let uid = session["login"];

    let send = function (response) {
      res.send(response);
    };

    {
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

  app.use('/api/guide/', router);
};
