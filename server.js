const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikzad:KtKt8SI28dQ9P5Du@cluster0.h0hbu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')   
.then(() => console.log("Database connected!"))
.catch(err => console.log(err));

var bodyParser = require("body-parser");

const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  log: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
});

// Exercise Schema
const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: Date,
});

// Creating Both Models.
const ExerciseModel = mongoose.model('Exercise', exerciseSchema);
const UserModel  = mongoose.model('User', userSchema);

// Cors configurations.
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// This route to to create new users.
app.post('/api/users', function(req, res) {

  let username = req.body.username;

  // Store user in mongo db.
  var userRecord = new UserModel({
    username: username, 
    _id: new mongoose.Types.ObjectId()
  });

  userRecord.save(function(err, data) {
    if (err) return console.error(err);
    // The returned response will be an object with username and _id properties.
    res.json(data);
  });
  
});

// You can make a GET request to /api/users to get an array of all users. Each element in the array is an object containing a user's username and _id.
app.get('/api/users', function(req, res) {

  UserModel.find(function(err, data) {
    if (err) return console.error(err);
    // The returned response will be an object with username and _id properties.
    res.json(data);
  });
  
});

// This route to to create new exercise for the user.
app.post('/api/users/:_id/exercises', function(req, res) {

  console.log('provided data: ', req.param(':_id', null));

  let description = req.param('description', null);
  let duration = req.param('duration', null);
  let date = req.param('date', null);

  if (date == null) {
    console.log("date is empty ")
    date = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  }

  // Store user in mongo db.
  var exerciseRecord = new ExerciseModel({
    description: description,
    duration: duration,
    date: date,
  });

  exerciseRecord.save()
    .then((result) => {
      UserModel.findOne({ _id: req.params._id }, (err, user) => {
          if (user) {
              // The below two lines will add the newly saved review's 
              // ObjectID to the the User's reviews array field
              user.log.push(exerciseRecord);
              user.save(function(err, data) {
                if (err) return console.error(err);
                // The returned response will be an object with username and _id properties.

                UserModel.findOne({ _id: req.params._id })
                .populate({
                  path: 'log',
               })
                .then((result) => {
                  result = result.toObject();
                  let newObj = {
                    date: new Date(result.log[0].date).toDateString(),
                    duration: parseInt(result.log[0].duration),
                    description: result.log[0].description,
                    username:  result.username,
                    _id: result._id,
                  }
                  res.json(newObj);
                })
                .catch((error) => {
                  res.status(500).json({ error });
                });
                // res.json(data);
              });
          }
      });
    });

});

// This route to to list all logs.
app.get('/api/users/:_id/logs', function(req, res) {

  // console.log('your input ', req.query);
  let dateFilter = {};
  let options = {};

  if (typeof  req.query.limit != 'undefined') {
    options = { limit: req.query.limit  }
  }

  if ( typeof req.query.from != 'undefined' ) {
    // console.log('date is not null');
    dateFilter = {'date': { $gt: req.query.from, $lt: req.query.to}};
  }

  UserModel.findOne({ _id: req.params._id })
  .populate({
    path: 'log',
    match: dateFilter,
    options: options,
  })
  .then((result) => {

    var result = result.toObject();
    result.count = result.log.length;

    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
});

// Start server and print port.
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
