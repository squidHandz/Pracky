var request = require('request'),
	cheerio = require('cheerio'),
  model = module.exports;

var proxyUrl = "http://192.241.181.108:8080";

var proxiedRequest = request.defaults({'proxy': proxyUrl});

var baseUrl = "http://www.pro-football-reference.com";
var playersUri = "/players/"

var scrapePlayerLinksFromPage = function(url, callback){
  
	console.log("Requesting page at: " + url);
  proxiedRequest(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
	  // scrape the links to grab positional page links
	  var $ = cheerio.load(body);
    var activeLinks = $('pre > b > a').map(function(i){
      //trim off the .htm from the url
      return this.attribs.href.substring(0, this.attribs.href.length - 4);
    });
    
    callback(activeLinks.toArray());
  }
  else{
	console.log("!!!! Error requesting page at: " + url);
  }});
  
};

model.getList = function(callback){
  proxiedRequest(baseUrl + playersUri, function (error, response, body) {
  if (!error && response.statusCode == 200) {
	  // scrape the links to grab positional page links
	  var $ = cheerio.load(body);
	  var qbLink = $('a:contains("QB")')[1].attribs.href;
	  var rbLink = $('a:contains("RB")')[0].attribs.href;
	  var wrLink = $('a:contains("WR")')[0].attribs.href;
	  var teLink = $('a:contains("TE")')[0].attribs.href;
    var links = [];
    scrapePlayerLinksFromPage(baseUrl + qbLink, function(urls){
        links = links.concat(urls);
        scrapePlayerLinksFromPage(baseUrl + rbLink, function(urls){
          links = links.concat(urls);
          scrapePlayerLinksFromPage(baseUrl + wrLink, function(urls){
            links = links.concat(urls);
            scrapePlayerLinksFromPage(baseUrl + teLink, function(urls){
              links = links.concat(urls);
              links.reduce(function(previous,current){
                if(previous.indexOf(current) === -1){
                  previous.push(current);
                  return previous;
                }
              },[]);
              callback(links);
    }); 
    });
    });
    });
  }else{
	 console.log("!!!! Error requesting page at: " + baseUrl + playersUri);
  }
});
};