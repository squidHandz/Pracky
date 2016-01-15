var request = require('request'),
	cheerio = require('cheerio'),
	model = module.exports;
1
var proxyUrl = "http://localhost:8080";

var proxiedRequest = request.defaults({ 'proxy': proxyUrl });

var baseUrl = "http://www.pro-football-reference.com";

model.scrape = function (url, callback, errorCallback) {
	console.log("Requesting page at: " + baseUrl + url + "/gamelog/");
	proxiedRequest(baseUrl + url + "/gamelog/", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			try{
			console.log("Got page at: " + baseUrl + url + "/gamelog/ ..... Scraping");
			// scrape the links to grab positional page links
			var $ = cheerio.load(body),
				heightRegex = /Height:\s(\d-\d?)/,
				weightRegex = /Weight:\s(\d{3})/,
				positionRegex = /Position:\s(\w{2})/,
				player = {};

			player.name = $('h1.float_left').text();

			var bio_info = $('strong:contains("Height")').parent().text();

			var heightCap = heightRegex.exec(bio_info),
				heightString = heightCap[1],
				heightPieces = heightString.split('-');
			player.height = parseInt(heightPieces[0]) + (parseInt(heightPieces[1]) / 12);

			var weightCap = weightRegex.exec(bio_info),
				weightString = weightCap[1];
			player.weight = parseInt(weightString);

			var positionCap = positionRegex.exec(bio_info);
			player.position = positionCap[1];

			switch (player.position) {
				case "QB":
					player = parseQBInfo($, player);
					break;
				case "RB":
					player = parseRBInfo($, player);
					break;
				case "WR":
					player = parseWRInfo($, player);
					break;
				case "TE":
					player = parseWRInfo($, player);
					break;
			}

			callback(player);
			} catch(e){
				console.log(e);
				errorCallback();
			}
		} else {
			console.log("!!!!! Failed page at: " + baseUrl + url + "/gamelog/ !!!!");
			errorCallback(url);
		}
	});
};

function parseQBInfo($, player) {
	var games = $('tr[id^="stats"]');
	player.games = [];
	games.each(function (index) {
		//console.log("Parsing Game: " + index + " for " + player.name);
		var game = {};
		game.year = parseInt($(this.children[1]).text());
		game.gamenumber = parseInt($(this.children[2]).text());
		game.team = $(this.children[5]).text();
		game.opponent = $(this.children[7]).text();
		game.started = $(this.children[9]).text().length !== 0;
		
		var passescompleted = parseInt($(this.children[10]).text());
		game.passescompleted = isNaN(passescompleted) ? 0 : passescompleted;
		
		var passesattempted = parseInt($(this.children[11]).text());
		game.passesattempted = isNaN(passesattempted) ? 0 : passesattempted;
		
		var passingyards = parseInt($(this.children[13]).text());
		game.passingyards = isNaN(passingyards) ? 0 : passingyards;
		
		var passingtouchdowns = parseInt($(this.children[14]).text());
		game.passingtouchdowns = isNaN(passingtouchdowns) ? 0 : passingtouchdowns;
		
		var passingInterceptions = parseInt($(this.children[15]).text());
		game.passingInterceptions = isNaN(passingInterceptions) ? 0 : passingInterceptions;
		
		var rushattempts = parseInt($(this.children[19]).text());
		game.rushattempts = isNaN(rushattempts) ? 0 : rushattempts;
		
		var rushyards = parseInt($(this.children[20]).text());
		game.rushyards = isNaN(rushyards) ? 0 : rushyards;
		
		var rushtouchdowns = parseInt($(this.children[22]).text());
		game.rushtouchdowns = isNaN(rushtouchdowns) ? 0 : rushtouchdowns;
		
		player.games.push(game);
	});

	return player;
};

function parseRBInfo($, player) {
	var games = $('tr[id^="stats"]');
	player.games = [];
	games.each(function (index) {
		//console.log("Parsing Game: " + index + " for " + player.name);
		var game = {};
		game.year = parseInt($(this.children[1]).text());
		game.gamenumber = parseInt($(this.children[2]).text());
		game.team = $(this.children[5]).text();
		game.opponent = $(this.children[7]).text();
		
		var rushattempts = parseInt($(this.children[9]).text());
		game.rushattempts = isNaN(rushattempts) ? 0 : rushattempts;
		
		var rushyards = parseInt($(this.children[10]).text());
		game.rushyards = isNaN(rushyards) ? 0 : rushyards;
		
		var rushtouchdowns = parseInt($(this.children[12]).text());
		game.rushtouchdowns = isNaN(rushtouchdowns) ? 0 : rushtouchdowns;
		
		var targets = parseInt($(this.children[13]).text());
		game.targets = isNaN(targets) ? 0 : targets;
		
		var receptions = parseInt($(this.children[14]).text());
		game.receptions = isNaN(receptions) ? 0 : receptions;
		
		var receptionyards = parseInt($(this.children[15]).text());
		game.receptionyards = isNaN(receptionyards) ? 0 : receptionyards;
		
		var receptiontouchdowns = parseInt($(this.children[17]).text());
		game.receptiontouchdowns = isNaN(receptiontouchdowns) ? 0 : receptiontouchdowns;
		
		player.games.push(game);
	});

	return player;
};

function parseWRInfo($, player) {
	var games = $('tr[id^="stats"]');
	player.games = [];
	games.each(function (index) {
		//console.log("Parsing Game: " + index + " for " + player.name);
		var game = {};
		game.year = parseInt($(this.children[1]).text());
		game.gamenumber = parseInt($(this.children[2]).text());
		game.team = $(this.children[5]).text();
		game.opponent = $(this.children[7]).text();
		
		var targets = parseInt($(this.children[9]).text());
		game.targets = isNaN(targets) ? 0 : targets;
		
		var receptions = parseInt($(this.children[10]).text());
		game.receptions = isNaN(receptions) ? 0 : receptions;
		
		var receptionyards = parseInt($(this.children[11]).text());
		game.receptionyards = isNaN(receptionyards) ? 0 : receptionyards;
		
		var receptiontouchdowns = parseInt($(this.children[13]).text());
		game.receptiontouchdowns = isNaN(receptiontouchdowns) ? 0 : receptiontouchdowns;
		
		if($('[data-stat="header_rush"]').length > 0){
			var rushattempts = parseInt($(this.children[14]).text());
			game.rushattempts = isNaN(rushattempts) ? 0 : rushattempts;
		
			var rushyards = parseInt($(this.children[15]).text());
			game.rushyards = isNaN(rushyards) ? 0 : rushyards;
			
			var rushtouchdowns = parseInt($(this.children[16]).text());
			game.rushtouchdowns = isNaN(rushtouchdowns) ? 0 : rushtouchdowns;
		}
		player.games.push(game);
	});

	return player;
};