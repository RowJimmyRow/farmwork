// Main App file

const express = require("express"),
  handlebars = require("express-handlebars"),
  methodOverride = require("method-override"),
  session = require("express-session"),
  bcrypt = require('bcrypt');

// // Probably will need to create model files for dynamo DB?  I'm not sure
// const Hikes = require("./models/hikes"),
//       User = require("./models/user"),
//       Image = require("./models/image");

// // routes files grouped by use (will be many)
const indexRoutes = require("./routes/index")

// handlebar helpers stored in different file
const hbs = require("./helperFunc/handlebarHelpers")

// allow env file usage
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// set directory for CSS files
app.use(express.static(__dirname + "/public"));

// allow methodOveride to allow put and node delete requests
app.use(methodOverride("_method"));

// setup Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup handlebars options
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: "shell",
}));

// set secret.  
const secret = process.env.SECRET || "diving is crazy";

const sessionConfig = {
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));

// Allow use of currentUser on any individual page
app.use((request, response, next) => {
  response.locals.currentUser = request.session.user_id;
  next();
});


// Main route calls
app.use(indexRoutes);
app.use("/diver", diverRoutes);

// Error route calls
app.use((request, response) => {
  response.status(404);
  response.render("errors/404")
});

app.use((error, request, response, next) => {
  console.error(error.stack);
  response.status(500);
  response.render("errors/500");
});

const port = process.env.PORT || 6960;

app.listen(port, () => {
  console.log(`The server is working on port ${port}`)
});
