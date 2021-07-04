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

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  log: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
});

const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: Date,
});

const ExerciseModel = mongoose.model('Exercise', exerciseSchema);
const UserModel  = mongoose.model('User', userSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res) {

  let username = req.body.username;
  // console.log('given user name', username);

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

app.post('/api/users/:_id/exercises', function(req, res) {

  console.log('provided data: ', req.param(':_id', null));

  let description = req.param('description', null);
  let duration = req.param('duration', null);
  let date = req.param('date', null);

  if (date == null) {
    console.log("date is empty ")
    date = new Date();
  }

  // Store user in mongo db.
  var exerciseRecord = new ExerciseModel({
    description: description,
    duration: duration,
    date: date,
  });

  console.log('save version ', exerciseRecord);

  exerciseRecord.save()
    .then((result) => {
      UserModel.findOne({ _id: req.params._id }, (err, user) => {
          if (user) {
              // The below two lines will add the newly saved review's 
              // ObjectID to the the User's reviews array field
              user.log.push(exerciseRecord);
              user.save();
          }
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });

    UserModel.findOne({ _id: req.params._id })
    .populate('log')
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.get('/api/users/:_id/logs', function(req, res) {

  console.log('your input ', req.params._id);

  UserModel.findOne({ _id: req.params._id })
  .populate('log')
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    res.status(500).json({ error });
  });
  console.log('3')
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)

  // UserModel.findById('60e03f86b341974b3086dd28').populate('exercises').exec(function(err, user) {
  //   console.log('4')
  //   console.log(user)
  //   // return res.json(user);
  // });

  // Exercise.findOne({ title: Nintendo }).populate('_creator')

})
