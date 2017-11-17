var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//var expressValidator = require('express-validator');
const { check, oneOf, validationResult } = require('express-validator/check');


var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var isMongo = false; //true;
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
/*
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
*/

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
	console.log("isMongo=" + isMongo);
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

// Use New Express Validator Method
app.post('/users/add', [
	  check('first_name', 'First name is required').isLength({ min: 1 }),
	  check('last_name', 'Last name is required').isLength({ min: 1 }),
	  check('email', 'Email is required').isLength({ min : 1 }).isEmail().withMessage('must be an email')
	], (req, res, next) => {
	  try {
		  const errors = validationResult(req);
		  console.log("isMongo 2:" + isMongo);
		
		  if (!errors.isEmpty()) {
			  console.log("errors not empty");			  
			  var newErrorArray = new Array();
			  
			  if(errors.mapped().first_name !=null){
				  console.log("first_name:" + errors.mapped().first_name.msg);				 
				  newErrorArray.push(JSON.parse("{\"msg\":\"" + errors.mapped().first_name.msg + "\"}"));
			  }
			  
			  if(errors.mapped().last_name !=null){
				  console.log("last_name:" + errors.mapped().last_name.msg);
				  newErrorArray.push(JSON.parse("{\"msg\":\"" + errors.mapped().last_name.msg + "\"}"));
			  }
			  
			  if(errors.mapped().email !=null){
				  console.log("email:" + errors.mapped().email.msg);
				  newErrorArray.push(JSON.parse("{\"msg\":\"" + errors.mapped().email.msg + "\"}"));
			  }		
			  
			  
			  console.log("newErrorArray:" + newErrorArray );
			  var xError = [{'msg': 'x1'}, {'msg': 'x2'}];  //correct array format testing for pass to the template
			  //return res.status(422).json(errors.mapped());
			  
			  
			  if(isMongo){
			  db.users.find(function (err, docs){
					if(err){
						console.log("ERROR on mongo database");
					}else{
						console.log(docs);
						res.render('index', {
							title: 'Customers',
							users: docs,
							errors:newErrorArray,
							isMongo: isMongo
						});
					}
				});
			  }else{			  
				  res.render('index', {
						title: 'Customers',
						users: users,
						errors:newErrorArray, //xError
						isMongo: isMongo
					});
			  }
			  
		  }else{
			  //console.log("bad");
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
		  
	   // validationResult(req).throw();
	   // alert("test 1");
		 
	   // var errors = validationResult(req);
	    
		  /*
	    if(errors){
			console.log('ERRORS');
			res.render('index', {
				title: 'Customers',
				users: users,
				errors: errors,
				isMongo: isMongo
			});
			
		}
	 	*/
	    // yay! we're good to start selling our skilled services :)))
	   // res.json({good:true});
	  } catch (err) {
	    // Oh noes. This user doesn't have enough skills for this...
	    res.status(422).json({error:"error"});
	  }
	});


app.post('/users/add_X', function(req,res){
	console.log("FORM SUBMITTED");
	//console.log(req.body.first_name);
	
	/*
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	*/
	check('username').notEmpty();
	
	
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