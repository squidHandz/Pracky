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

//oneAtATimeScraper(['/players/A/AndeDe00','/players/A/AdamDa01','/players/H/HartBr00','/players/A/AbduAm00','/players/A/AlleDw00/']);