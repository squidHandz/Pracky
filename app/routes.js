var Todo = require('./models/todo');
var PlayerModel = require('./player-db')
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');



module.exports = function(app) {

	app.get('/api/scrape', function(req, res) {

		var playerGameLogUrlList = require('./url-scraper'),
			playerPageScraper = require('./player-page-scraper'),
			playerDb = require('./player-db');

		console.log("Getting Urls for all active players\n---------------------------");
		playerGameLogUrlList.getList(function (urls) {
			console.log("Done getting Urls for all active players\n-------------------------");
			oneAtATimeScraper(urls);
		});
		var lastFailedUrl = "";
		// prevent pseudo DDOS of their site, maybe even throttle the requests if need be
		var oneAtATimeScraper = function(urls){
			
			console.log("Starting Game Scraping for players\n-------------------------");
			function internalOrderFunc(index){
				
			console.log("Starting Game Scraping for player at index " + index +"\n-------------------------");
				if(index < urls.length){			
					playerPageScraper.scrape(urls[index],function(player){
						playerDb.save(player);
						setTimeout(function(){internalOrderFunc(index + 33);},1500);
					},function(error){
						if(error === lastFailedUrl){
							console.log("2nd attempt at scraping " + error +" failed!!\n-------------------------");
							setTimeout(function(){internalOrderFunc(index + 33);},1500);
						}else{
							lastFailedUrl = error;
							setTimeout(function(){internalOrderFunc(index);},1500);
						}
					});	
				}else{
					return;
				}
			}
			
			internalOrderFunc(0);
		};
	
	});


	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/todos', function(req, res) {

		// use mongoose to get all todos in the database
		Todo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(todos); // return all todos in JSON format
		});
	});

	// create todo and send back all todos after creation
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});

	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});



	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};