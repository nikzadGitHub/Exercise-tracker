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

const userSchema = Schema({
  _id: { type: Schema.Types.ObjectId},
  username: String,
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
});

const exerciseSchema = Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: Date,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

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
  var userRecord = new User({name: username});

  userRecord.save(function(err, data) {
    if (err) return console.error(err);
    // The returned response will be an object with username and _id properties.
    res.json(data);
  });
  
});

// You can make a GET request to /api/users to get an array of all users. Each element in the array is an object containing a user's username and _id.
app.get('/api/users', function(req, res) {

  User.find(function(err, data) {
    if (err) return console.error(err);
    // The returned response will be an object with username and _id properties.
    res.json(data);
  });
  
});

app.post('/api/users/:_id/exercises', function(req, res) {

  console.log('provided data: ', req.param(':_id', null));

  let user_id = req.param(':_id', null);
  let description = req.param('description', null);
  let duration = req.param('duration', null);
  let date = req.param('date', null);

  if (date.length < 5) {
    console.log("date is empty")
    date = new Date();
  }

  console.log('given user user_id', user_id);
  console.log('given user description', description);
  console.log('given user duration', duration);
  console.log('given user date', date);

  // Store user in mongo db.
  var exerciseRecord = new Exercise({
    fk_user: user_id,
    description: description,
    duration: duration,
    date: date,
  });

  exerciseRecord.save(function(err) {
    if (err) return console.error(err);
    // The returned response will be an object with username and _id properties.
    
    exerciseRecord.populate('fk_user', function(err) {
      if (err) return console.error(err);
      res.json(exerciseRecord);
    });
  });
  
});

app.get('/api/users/:_id/logs', function(req, res) {

  console.log('your input ', req.params._id);

  User.findById(req.params._id).populate('exercises').exec(function(err, user) {
    console.log('2')
    return res.json(user);
  });

  console.log('3')

});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)

  User.findById('60e03f86b341974b3086dd28').populate('exercises').exec(function(err, user) {
    console.log('4')
    console.log(user)
    // return res.json(user);
  });

  // Exercise.findOne({ title: Nintendo }).populate('_creator')

})
