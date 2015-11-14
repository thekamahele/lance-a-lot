var bcrypt = require('bcrypt-nodejs');
var util = require('./utility');
var mongoose = require('mongoose');
var db = require('./db/database');
var Job = require('./db/models/job');
var Client = require('./db/models/client');



exports.fetchClients = function (req, res) {
  Client.find({}).exec(function (err, clients) {
    res.send(200, clients);
  });
};

exports.addClient = function (req, res) {
  console.log('req header: ', req.header)
  var newClient = new Client({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone
  });
  newClient.save(function (err, newClient) {
    if (err) {
      res.send(500, err);
      console.log('error adding/saving client');
    } else {
      console.log('added new client: ', newClient);
      res.send(200, newClient);
    }
  });
};

/*
fetchJobs is called when /jobs path receives get request
Finds all jobs in the database, replaces client_id with object that include client Id and name
Responds with result of query
*/
exports.fetchJobs = function (req, res) {
  Job.find({})
              .populate('client', 'name')
              .exec(function (err, jobs) {
                  res.send(200, jobs);
              });
};

exports.updateJob = function (req, res) {
  console.log('updateJob id is:', req.body);
  util.creatJobDoc(req, res, function (newJob) {
    // console.log('is this happening?')
    Job.findOneAndUpdate({_id: req.body.id}, newJob, function(err, job) {
      if(err) {
        console.log('error updating job');
      } else {
        console.log('updatedJob id is:', req.body.id);
        res.redirect('/jobs');
      }
    });
  });
};

exports.addJob = function (req, res) {
  //call createJobDoc first to find client id to use to create job document
  console.log('req body in addJob: ', req.body);
  //check if id already exists
  Job.findById(req.body._id, function (err, job) {
    if (err) {
      console.error("error");
  //find client id by client name
  Client.find({name:req.body.client}).exec(function (err, client){
    if (err) {
      console.error('Error searching for client');
      res.send(500, err);
    } else {
      console.log('it found a job?', job);
        if(job === null) {
          util.createJobDoc(req, res, function(newJob){
            newJob.save(function (err, newJob) {
              if (err) {
                res.send(500, err);
              } else {
                res.redirect('/jobs');
              }
            });
          });
        } else {
          Job.findOneAndUpdate({_id: req.body._id}, {status:req.body.status}, function(err, job) {
            if(err) {
              console.log('error updating job');
            } else {
              res.redirect('/');
              }
          });
        }
      }
  });
};

  // if (err) {
  //   console.log('got an error');
  // }
  //call createJobDoc first to find client id to use to create job document
  // util.createJobDoc(req, res, function(newJob){
  //   Job.findOneAndUpdate({description:}, update, options, function(err, person) {
  // if (err) {
  //   console.log('got an error');
  // }




  //   newJob.save(function (err, newJob) {
  //     if (err) {
  //       res.send(500, err);
  //     } else {
  //       res.redirect('/jobs');
  //     }
  //   });
  // });


exports.loginUser = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function (err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        User.comparePassword(password, user.password, function(err, match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
  });
};

exports.signupUser = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var options = {
    url: 'https://www.toggl.com/api/v8/signups',
    data: {"user":{"email":email,"password":password}},
    headers: {'Content-Type': 'application/json'}
  };

  User.findOne({ email: email })
    .exec(function (err, user) {
      if (!user) {
	request.post(options, function (err, httpResponse, body) {
          if (err) {
	    return console.error('upload failed:', err);
          }
	  console.log('Request successful!  Server responded with:', body);
	  var newUser = new User({
	    email: email,
	    password: password
	  });
	  newUser.save(function (err, newUser) {
	    if (err) {
	      res.send(500, err);
	    }
	      res.redirect('/');
	  });
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};
