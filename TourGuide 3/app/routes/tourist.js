const sql = require("../models/db");
const Response = require("../entity/Response");
const User = require("../entity/User");
const session = require("express-session");
const {data} = require("express-session/session/cookie");

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
    if (type === 'Tourist') {
      on_success();
    }else {
      res.send(new Response("You do not have permission to view this page!", false, null, "/"));
      return;
    }

  })
}


module.exports = app => {

  let router = require("express").Router();

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
  router.get("/reservations", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query(`SELECT reservations.id as id,
                        uid,
                        place,
                        \`from\`,
                        \`to\`,
                        persons,
                        place.id as pid,
                        name,
                        description,
                        category,
                        address,
                        latitude,
                        longitude,
                        image,
                        extra
                 FROM reservations
                        LEFT JOIN place ON reservations.place = place.id
                 WHERE uid = ? ORDER BY id DESC`, session['login'], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });
  router.post("/reservations", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response("Reservation was added!", true, data, null));
          return;
        }
      };


      sql.query("INSERT INTO reservations SET ?", {uid: session['login'], ...req.body}, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res[0]);
      });

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
  router.get("/guide/images", (req, res) => {
    if (!req.body) {
      res.send(new Response("Please enter valid details!", false, null, null));
      return;
    }

    let id = req.query.id;
      console.log(req.query);

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query("SELECT guide_images.id as id, uid, place, guide_images.image as image, name from guide_images LEFT JOIN place ON guide_images.place = place.id WHERE uid = ? ", id, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });
  router.post("/guide-reservations", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response("Guide reservation was added!", true, data, null));
          return;
        }
      };


      sql.query("INSERT INTO guide_reservation SET ?", {uid: session['login'], ...req.body}, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res[0]);
      });

    });

  });
  router.get("/guide-reservations", (req, res) => {

    permission_check(res, () => {

      let callback = (err, data) => {
        if (err){
          res.send(new Response(err.message, false, null, null));
        } else {
          res.send(new Response(null, true, data, null));
          return;
        }
      };


      sql.query(`SELECT guide_reservation.id as id,
                        uid,
                        gid,
                        place,
                        \`from\`,
                        \`to\`,
                        persons,
                        place.id             as pid,
                        name,
                        description,
                        category,
                        address,
                        latitude,
                        longitude,
                        image,
                        extra,
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
                 FROM guide_reservation
                        LEFT JOIN place ON guide_reservation.place = place.id
                        LEFT JOIN user ON guide_reservation.gid = user.id
                 WHERE uid = ? ORDER BY id DESC`, session['login'], (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });

    router.post("/preferences", (req, res) => {
        if (!req.body) {
            res.send(new Response("Please enter valid details!", false, null, null));
            return;
        }

        let callback = (err, data) => {
            if (err){
                res.send(new Response(err.message, false, null, null));
            } else {
                res.send(new Response("Preferences were updated!", true, null, null));
                return;
            }
        };

        sql.query(
            "UPDATE user SET preferences = ? WHERE id = ?",
            [req.body.preferences, session["login"]],
            (err, res) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, null);
            });

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
      ORDER BY id DESC`, (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
      });

    });

  });

  router.post("/rate", (req, res) => {
    permission_check(res, () => {

          let callback = (err, data) => {
            if (err) {
              res.send(new Response(err.message, false, null, null));
            } else {
              res.send(new Response(null, true, data, null));
              return;
            }
          };

          let data = {
            uid: session['login'],
            rid: req.body.rid,
            type: req.body.type,
          };
          sql.query("SELECT * FROM rating WHERE uid = ? AND rid = ? AND type = ?", [data.uid, data.rid, data.type], (err, res) => {
            if (err) {
              callback(err, null);
              return;
            }

            if (res.length > 0) {
              sql.query("UPDATE rating SET rating = ? WHERE id = ?", [req.body.rating, res[0]['id']], (err, res) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                callback(null, null);
              });
            }
            else {

              sql.query("INSERT INTO rating SET ?", {uid: session['login'], ...req.body}, (err, res) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                callback(null, null);
              });


            }


          });


        });
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

      sql.query("SELECT AVG(rating) AS rating FROM rating WHERE uid = ? AND type = ? AND rid = ?", [session['login'], req.query.type, req.query.rid], (err, res) => {
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

  app.use('/api/tourist/', router);
};
