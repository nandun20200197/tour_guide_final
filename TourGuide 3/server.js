const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(session({secret:'TourGuide'}));

let corsOptions = {origin: "http://localhost:3434"};

app.use(cors(corsOptions));

app.use(express.json({limit: '50mb'}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/json", (req, res) => {
  res.json({ message: "Welcome." });
});

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


require("./app/routes/user.js")(app);
require("./app/routes/message.js")(app);
require("./app/routes/admin.js")(app);
require("./app/routes/guide.js")(app);
require("./app/routes/tourist")(app);

const PORT = process.env.PORT || 3434;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
