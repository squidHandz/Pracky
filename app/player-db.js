var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	model = module.exports;
	
var uristring = 'mongodb://test:test@apollo.modulusmongo.net:27017/eMaxa9py';
// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});	
	
var GameSchema = new Schema({
	year : Number,
	gamenumber : Number,
	team : String,
	opponent : String,
		started : Boolean,
		passescompleted : Number,
		passesattempted : Number,
		passingyards : Number,
		passingtouchdowns : Number,
		passingInterceptions : Number,
		rushattempts : Number,
		rushyards : Number,
		rushtouchdowns : Number,
		targets : Number,
		receptions : Number,
		receptionyards : Number,
		receptiontouchdowns : Number
});
	
var PlayerSchema = new Schema({
	name: String,
	position: String,
	height: Number,
	weight: Number,
	games: [GameSchema]
});

var PlayerModel = mongoose.model('playerdata', PlayerSchema);

model.save = function(player){
	var newPlayer = new PlayerModel(player);
	newPlayer.save(function (err) {
        if (err) console.log('Error saving!');
    });
};