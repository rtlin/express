var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');


var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var isMongo = true;
var app = express();
/*
var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);
*/

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use(function(req, res, next){
	res.locals.errors = null;	
	next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;
		
		while(namespace.length) {
			formParam +='[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

var people = [
	{
		name: 'Jeff',
		age: 30
	},
	{
		name: 'Sara',
		age: 25
	},
	{
		name: "Bill",
		age: 45
	}
];

var users = [
	{
		id: 1,
		first_name: 'john',
		last_name: 'Doe',
		email: 'john.doe@abc.com'
	},
	{
		id: 2,
		first_name: 'Bob',
		last_name: 'Smith',
		email: 'bobsmith@abc.com'
	},
	{
		id: 3,
		first_name: 'Jill',
		last_name: 'Jackson',
		email: 'jja@abc.com'
	}
];

app.get('/', function(req, res){
	//res.send('Hello World - 3');
	//res.json(people);
	
	if(isMongo){
		db.users.find(function (err, docs){
			if(err){
				console.log("ERROR on mongo database");
			}else{
				console.log(docs);
				res.render('index', {
					title: 'Customers',
					users: docs,
					isMongo: isMongo
				});
			}
		});
	}else{	
		res.render('index', {
			title: 'Customers',
			users: users,
			isMongo: isMongo
		});		
	}
});

app.post('/users/add', function(req,res){
	console.log("FORM SUBMITTED");
	//console.log(req.body.first_name);
	
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	
	var errors = req.validationErrors();
	
	if(errors){
		console.log('ERRORS');
		res.render('index', {
			title: 'Customers',
			users: users,
			errors: errors,
			isMongo: isMongo
		});
		
	}else{
		var newUser = {
				first_name:req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email
		}
		console.log('SUCCESS');
		console.log(newUser);
		
		if(isMongo){
			db.users.insert(newUser, function(err, result){
				if(err){
					console.log(err);				
				}
				res.redirect('/');
			});
		}else{		
			res.send('New Customer Successfully Added. <a href="/">click here</a>');
		}
	}	
		
});


app.delete('/users/delete/:id', function(req,res){
	console.log("x=" + req.params.id);
	
	if(isMongo){
		db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});
	}else{
		res.send('Deleted Customer.')
	}	
});


app.listen(3000, function(){
	console.log('Server started on Port 3000...');
})