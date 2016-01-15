
function playerRanking(name){
  this.name = name;
  this.rank, this.position;
}

playerRanking.prototype = {
    constructor: playerRanking,
  greeting: function(){
    return "Name: " + this.name + ", rank: " + this.rank;
  },
  setRank: function(rank){
    this.rank = rank;
    return this.rank;
  },
  setPosition: function(position) {
    this.position = position;
    return this.position;
  }
}

var cheerio = require('cheerio');
var request = require('request');
var players = [];
var positions = ['qb', 'rb', 'wr', 'te', 'dst']
var root_url = "http://www.fantasypros.com/nfl/rankings/";
var position;
for (pos in positions) {
  position = positions[pos];
  var url = root_url + positions + '.php';
  console.log(url);
  request(url, function(err, res, body){
    if (err) {
      throw err;
    } else {
      $ = cheerio.load(body);
      // debugger
      $('.table').find('tbody').last().find('tr').each(function(index){
        // console.log($(this).find('td:nth-child(2)').text());

        var text = $(this).find('td:nth-child(2)').text().split(' ');
        var name = text[0] + ' ' + text[1];
        var player = new playerRanking(name);
        player.setRank(index + 1);
        player.setPosition(positions);
        players.push(position);
        
        players.push(player.greeting());
      });
    }
    

    console.log(playerRanking)
  });
}
