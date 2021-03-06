var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var partials = require('express-partials');
var handle = require('./request-handler.js');
var session = require('express-session');
var util = require('./utility');

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  return next();
});

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/../client/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.static(__dirname + '/../client'));
app.use(session({
  secret: 'nyan cat',
  resave: false,
  saveUninitialized: true
}));

//Request handlers for all routes in app
app.get('/', util.checkUser, renderIndex);

app.get('/clients', handle.fetchClients);
app.post('/clients', handle.addClient);

app.get('/addclient', renderIndex);
app.get('/add', renderIndex);

app.get('/jobs', handle.fetchJobs);
app.post('/jobs', handle.addJob);

app.get('/login', loginUserForm);
app.post('/login', handle.loginUser);

app.get('/signup', signupUserForm);
app.post('/signup', handle.signupUser);

app.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/login');
  });
});

app.use(function (error, req, res, next) {
  console.error(error.stack);
  next(error);
});

app.use(function (error, req, res, next) {
  res.send(500, {error: error.message});
});


// Handler functions for template rendering
function renderIndex (req, res) {
  res.render('index');
  console.log("IN RENDERINDEX")
};

function signupUserForm (req, res) {
  res.render('signup');
};

function splash (req, res, next) {
  res.render('splash');
  console.log("IN SPLASH")
  next();
};

function loginUserForm (req, res) {
  res.render('login');
};

var port = process.env.PORT || 3000;

app.listen(port);


