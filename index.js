// Initialization
var express = require('express');

var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var path = require('path');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/trump-libs';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

// Serve static content
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/submit', function(request, response) {
	var tweet = request.body.tweet;
	if (typeof tweet == 'undefined' || tweet == null) {
		response.send({"error":"Whoops, something is wrong with your data!"});
		return;
	}

	var toInsert = {
		"tweet": tweet
	};

	db.collection('fakeTweets', function(error, coll) {
	    coll.insert(toInsert, function(error, saved) {
			if (error) {
				response.send(500);
			}
			else {
				response.send(200);
			}
	    });
	});
});

app.get('/getTweet', function(request, response) {

	db.collection('realTweets', function(err, collection) {

		collection.find({}).toArray(function(err, results) {
			if (!err) {
				var randNum = Math.floor(Math.random() * results.length);
				console.log(results[randNum]);
				response.send(results[randNum].tweet);
			} else {
				response.send(500);
			}
		});
	});
});

app.get('/', function(request, response) {
	res.sendFile(path.resolve('../index.html'));
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);


