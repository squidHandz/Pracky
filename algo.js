var fs = require('fs');
var _ = require('lodash');

var filesRead = 0;
var quarterbackProjectionColumn = 15;
var tailbackProjectionColumn = 14;
var wideoutProjectionColumn = 14;
var tightEndProjectionColumn = 14;
var kickerProjectionColumn = 16;
var defenseProjectionColumn = 12;
var fanduelArray, allQuarterbacks, allTailbacks, allWideouts, allTightEnds, allKickers, allDefenses;
var salaryCap = 60000;
var bestTotalProjection = 0;
var bestTotalProjection2 = 0;
var lineups = 0;

// makeFanduelArray takes as its argument the contents of a .txt file scrubbed from FanDuel.com and
// returns an array. The array includes elements representing each player available to the user when
// playing the relevant FanDuel.com game. Each element is itself an array, consisting of the player's
// position, name, and salary on FanDuel.com.
var makeFanduelArray = function(dataString) {
	var json = JSON.parse(dataString);
	var fanduelArray = _.values(json).map(function(playerArray) {
		return [playerArray[0], playerArray[1], parseInt(playerArray[5])];
	});
	return fanduelArray;
};

// preparePlayersArray takes as its two arguments 1) the contents of a .txt file scrubbed from numberFire.com
// and 2) the "column" of the dataset that contains the fantasy projection for each player. preparePlayersArray
// returns an array that includes elements representing each player that both has a projection from
// numberFire.com and is available in the relevant FanDuel.com game. Each element is itself an array,
// consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
var preparePlayersArray = function(dataString, projectionColumn) {
	var playersArray = makePlayersArray(dataString, projectionColumn);
	// Only in the team defense file are fantasy projections found in the twelfth column.
	if (projectionColumn === 12) {
		playersArray = addDefenseSalaries(playersArray);
	} else {
		playersArray = addSalaries(playersArray);
	}
	// Player arrays are sorted by fantasy projection descending.
	playersArray.sort(function(a, b) {
		return b[1] - a[1];
	});
	playersArray = trimPlayersArray(playersArray);
	return playersArray;
};

// makePlayersArray takes as its two arguments 1) the contents of a .txt file scrubbed from numberFire.com
// and 2) the "column" of the dataset that contains the fantasy projection for each player. makePlayersArray
// returns an array that includes elements representing each player that has a projection from numberFire.com.
// Each element is itself an array, consisting of the player's name and fantasy projection for this
// week.
var makePlayersArray = function(dataString, projectionColumn) {
	// fliesRead is incremented each time this function is called so that the pickTeam function will
	// not fire until all six positional .txt files have been processed.
	filesRead++;
	var playerStrings = dataString.split('\r\n');
	return playerStrings.map(function(playerString) {
		var playerArray = playerString.split('\t');
		return [playerArray[0].split('(')[0].trim(), parseFloat(playerArray[projectionColumn - 1])];
	});
};

// addSalaries takes an array of players who are each represented by an array consisting of the player's
// name and fantasy projection for this week. addSalaries returns an array of players who are each represented
// by an array consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
var addSalaries = function(playersArray) {
	return playersArray.map(function(playerArray) {
		for (var i = 0; i < fanduelArray.length; i++) {
			var fanduelPlayerArray = fanduelArray[i];
			if (fanduelPlayerArray[1] === playerArray[0]) {
				playerArray.push(fanduelPlayerArray[2]);
				i = fanduelArray.length;
			}
		}
		return playerArray;
	});
};

// addDefenseSalaries performs the same function as addSalaries, except it specifically applies to team
// defenses rather than individual skill players.
var addDefenseSalaries = function(playersArray) {
	return playersArray.map(function(playerArray) {
		for (var i = 0; i < fanduelArray.length; i++) {
			var fanduelPlayerArray = fanduelArray[i];
			var indexOfLastSpace = fanduelPlayerArray[1].lastIndexOf(' ');
			var city = fanduelPlayerArray[1].slice(0, indexOfLastSpace);
			if (city.concat(' D/ST') === playerArray[0]) {
				playerArray.push(fanduelPlayerArray[2]);
				i = fanduelArray.length;
			}
		}
		return playerArray;
	});
};

// trimPlayersArray takes an array of players who are each represented by an array consisting of the
// player's name, fantasy projection for this week, and (unless the player is not eligible in the relevant
// FanDuel.com game) salary on FanDuel.com. trimPlayersArray returns the same array it received as an
// argument minus the arrays representing any players who did not have a salary and thus are not eligible
// in the relevant FanDuel.com game.
var trimPlayersArray = function(playersArray) {
	var trimmedPlayersArray = [];
	playersArray.forEach(function(playerArray) {
		if (playerArray.length === 3) {
			trimmedPlayersArray.push(playerArray);
		}
	});
	return trimmedPlayersArray;
};

// prepareEfficientArray takes an array of players at a particular position who are each represented
// by an array consisting of the player's name, fantasy projection for this week, and salary on FanDuel.com.
// prepareEfficientArray returns a new version of the same array that is missing certain players who
// could not possibly be of interest to the algorithm because there is at least one other player with
// BOTH a lower salary and a higher projection.
var prepareEfficientArray = function(playersArray) {
	var newArray = [playersArray[0]];
	for (var i = 1; i < playersArray.length; i++) {
		if (playersArray[i][2] < newArray[newArray.length - 1][2]) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

// removeOnePlayer takes two arguments. The first is an efficient array of players at a particular position.
// The second is a specific player represented by an array. removeOnePlayer returns a copy of the first
// argument with one difference: the second argument is not one of the elements of the copy.
var removeOnePlayer = function(playersArray, playerArray) {
	var newArray = [];
	for (var i = 0; i < playersArray.length; i++) {
		if (playersArray[i] !== playerArray) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

var removeTwoPlayers = function(playersArray, playerArray1, playerArray2) {
	var newArray = [];
	for (var i = 0; i < playersArray.length; i++) {
		if ((playersArray[i] !== playerArray1) && (playersArray[i] !== playerArray2)) {
			newArray.push(playersArray[i]);
		}
	}
	return newArray;
};

var takeTopOffPlayersArray = function(playersArray, fullArray, playerArray) {
	var newArray = [];
	var bool = false;
	for (var i = 0; i < fullArray.length; i++) {
		if (bool && _.contains(playersArray, fullArray[i])) {
			newArray.push(fullArray[i]);
		}
		if (fullArray[i] === playerArray) {
			bool = true;
		}
	}
	return newArray;
}

// pickTeam is a function that takes no arguments. Once all .txt files have been read and their data
// placed into arrays, the pickTeam function uses an algorithm to find optimized fantasy lineups based
// on fantasy projections from numberFire.com and salaries from FanDuel.com.
var pickTeam = function() {
	if (filesRead === 6) {
		// Efficient arrays are prepared for all positions.
		var quarterbacks = prepareEfficientArray(allQuarterbacks);
		var tailbacks = prepareEfficientArray(allTailbacks);
		var wideouts = prepareEfficientArray(allWideouts);
		var tightEnds = prepareEfficientArray(allTightEnds);
		var kickers = prepareEfficientArray(allKickers);
		var defenses = prepareEfficientArray(allDefenses);
		for (var quarterbackIndex = 0; quarterbackIndex < quarterbacks.length; quarterbackIndex++) {
			for (var tailbackOneIndex = 0; tailbackOneIndex < tailbacks.length; tailbackOneIndex++) {
				var allButOneTailback = removeOnePlayer(allTailbacks, tailbacks[tailbackOneIndex]);
				var tailbacksTwo = prepareEfficientArray(allButOneTailback);
				tailbacksTwo = takeTopOffPlayersArray(tailbacksTwo, allTailbacks, tailbacks[tailbackOneIndex]);
				for (var tailbackTwoIndex = 0; tailbackTwoIndex < tailbacksTwo.length; tailbackTwoIndex++) {
					for (var wideoutOneIndex = 0; wideoutOneIndex < wideouts.length; wideoutOneIndex++) {
						var allButOneWideout = removeOnePlayer(allWideouts, wideouts[wideoutOneIndex]);
						var wideoutsTwo = prepareEfficientArray(allButOneWideout);
						wideoutsTwo = takeTopOffPlayersArray(wideoutsTwo, allWideouts, wideouts[wideoutOneIndex]);
						for (var wideoutTwoIndex = 0; wideoutTwoIndex < wideoutsTwo.length; wideoutTwoIndex++) {
							var allButTwoWideouts = removeTwoPlayers(allWideouts, wideouts[wideoutOneIndex], wideoutsTwo[wideoutTwoIndex]);
							var wideoutsThree = prepareEfficientArray(allButTwoWideouts);
							wideoutsThree = takeTopOffPlayersArray(wideoutsThree, allWideouts, wideouts[wideoutOneIndex]);
							wideoutsThree = takeTopOffPlayersArray(wideoutsThree, allWideouts, wideoutsTwo[wideoutTwoIndex]);
							for (var wideoutThreeIndex = 0; wideoutThreeIndex < wideoutsThree.length; wideoutThreeIndex++) {
								for (var tightEndIndex = 0; tightEndIndex < tightEnds.length; tightEndIndex++) {
									for (var kickerIndex = 0; kickerIndex < kickers.length; kickerIndex++) {
										for (var defenseIndex = 0; defenseIndex < defenses.length; defenseIndex++) {
											var quarterback = quarterbacks[quarterbackIndex];
											var tailbackOne = tailbacks[tailbackOneIndex];
											var tailbackTwo = tailbacksTwo[tailbackTwoIndex];
											var wideoutOne = wideouts[wideoutOneIndex];
											var wideoutTwo = wideoutsTwo[wideoutTwoIndex];
											var wideoutThree = wideoutsThree[wideoutThreeIndex];
											var tightEnd = tightEnds[tightEndIndex];
											var kicker = kickers[kickerIndex];
											var defense = defenses[defenseIndex];
											var capSpace = salaryCap - quarterback[2] - tailbackOne[2] - tailbackTwo[2] - wideoutOne[2] - wideoutTwo[2] - wideoutThree[2] - tightEnd[2] - kicker[2] - defense[2];
											if (capSpace >= 0) {
												var totalProjection = quarterback[1] + tailbackOne[1] + tailbackTwo[1] + wideoutOne[1] + wideoutTwo[1] + wideoutThree[1] + tightEnd[1] + kicker[1] + defense[1];
												lineups++;
												if (totalProjection > bestTotalProjection) {
													console.log('totalProjection > bestTotalProjection');
													if (lineups > 1) {
														var bestQuarterback2 = bestQuarterback;
														var bestTailbackOne2 = bestTailbackOne;
														var bestTailbackTwo2 = bestTailbackTwo;
														var bestWideoutOne2 = bestWideoutOne;
														var bestWideoutTwo2 = bestWideoutTwo;
														var bestWideoutThree2 = bestWideoutThree;
														var bestTightEnd2 = bestTightEnd;
														var bestKicker2 = bestKicker;
														var bestDefense2 = bestDefense;
														var bestTeam2 = [bestQuarterback2, bestTailbackOne2, bestTailbackTwo2, bestWideoutOne2, bestWideoutTwo2, bestWideoutThree2, bestTightEnd2, bestKicker2, bestDefense2];
														bestTotalProjection2 = bestTotalProjection;
														var bestCapSpace2 = bestCapSpace;
													}
													var bestQuarterback = quarterback;
													var bestTailbackOne = tailbackOne;
													var bestTailbackTwo = tailbackTwo;
													var bestWideoutOne = wideoutOne;
													var bestWideoutTwo = wideoutTwo;
													var bestWideoutThree = wideoutThree;
													var bestTightEnd = tightEnd;
													var bestKicker = kicker;
													var bestDefense = defense;
													var bestTeam = [bestQuarterback, bestTailbackOne, bestTailbackTwo, bestWideoutOne, bestWideoutTwo, bestWideoutThree, bestTightEnd, bestKicker, bestDefense];
													bestTotalProjection = totalProjection;
													var bestCapSpace = capSpace;
												} else if (totalProjection > bestTotalProjection2) {
													console.log('totalProjection > bestTotalProjection2');
													var bestQuarterback2 = quarterback;
													var bestTailbackOne2 = tailbackOne;
													var bestTailbackTwo2 = tailbackTwo;
													var bestWideoutOne2 = wideoutOne;
													var bestWideoutTwo2 = wideoutTwo;
													var bestWideoutThree2 = wideoutThree;
													var bestTightEnd2 = tightEnd;
													var bestKicker2 = kicker;
													var bestDefense2 = defense;
													var bestTeam2 = [bestQuarterback2, bestTailbackOne2, bestTailbackTwo2, bestWideoutOne2, bestWideoutTwo2, bestWideoutThree2, bestTightEnd2, bestKicker2, bestDefense2];
													bestTotalProjection2 = totalProjection;
													var bestCapSpace2 = capSpace;
													if (defenseIndex === 0) {
														if (kickerIndex === 0) {
															if (tightEndIndex === 0) {
																if (wideoutThreeIndex === 0) {
																	if (wideoutTwoIndex === 0) {
																		if (wideoutOneIndex === 0) {
																			if (tailbackTwoIndex === 0) {
																				if (tailbackOneIndex === 0) {
																					if (quarterbackIndex === 0) {
																						console.log(bestTeam);
																						console.log(bestTotalProjection);
																						console.log('$' + bestCapSpace);
																					}
																					quarterbackIndex = quarterbacks.length;
																				}
																				tailbackOneIndex = tailbacks.length;
																			}
																			tailbackTwoIndex = tailbacksTwo.length;
																		}
																		wideoutOneIndex = wideouts.length;
																	}
																	wideoutTwoIndex = wideoutsTwo.length;
																}
																wideoutThreeIndex = wideoutsThree.length;
															}
															tightEndIndex = tightEnds.length;
														}
														kickerIndex = kickers.length;
													}
													defenseIndex = defenses.length;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		console.log(bestTeam);
		console.log(bestTotalProjection);
		console.log('$' + bestCapSpace);
		console.log(bestTeam2);
		console.log(bestTotalProjection2);
		console.log('$' + bestCapSpace2);
	}
};

(function(){

// fanduel-nfl.txt contains player salary data scrubbed from FanDuel.com.
	fs.readFile('data/fanduel-nfl.txt', { encoding: 'utf8' }, function(err, fanduelData) {
	fanduelArray = makeFanduelArray(fanduelData);
	// projections/nfl/qbs.txt contains fantasy projections for most if not all quarterbacks playing
	// in a given week.
	console.log(fanduelArray);
	})
	fs.readFile('data/qbs.txt', { encoding: 'utf8' }, function(err, quarterbackData) {
		allQuarterbacks = preparePlayersArray(quarterbackData, quarterbackProjectionColumn);
		console.log(allQuarterbacks);
		pickTeam();
	})
	// data/rbs.txt contains fantasy projections for most if not all running backs playing
	// in a given week.
	fs.readFile('data/rbs.txt', { encoding: 'utf8' }, function(err, tailbackData) {
		allTailbacks = preparePlayersArray(tailbackData, tailbackProjectionColumn);
		pickTeam();
	})
	// data/wrs.txt contains fantasy projections for most if not all wide receivers playing
	// in a given week.
	fs.readFile('data/wrs.txt', { encoding: 'utf8' }, function(err, wideoutData) {
		allWideouts = preparePlayersArray(wideoutData, wideoutProjectionColumn);
		pickTeam();
	})
	// data/tes.txt contains fantasy projections for most if not all tight ends playing in
	// a given week.
	fs.readFile('data/tes.txt', { encoding: 'utf8' }, function(err, tightEndData) {
		allTightEnds = preparePlayersArray(tightEndData, tightEndProjectionColumn);
		pickTeam();
	})
	// data/ks.txt contains fantasy projections for most if not all kickers playing in a
	// given week.
	fs.readFile('data/ks.txt', { encoding: 'utf8' }, function(err, kickerData) {
		allKickers = preparePlayersArray(kickerData, kickerProjectionColumn);
		pickTeam();
	})
	// data/ds.txt contains fantasy projections for most if not all team defenses playing
	// in a given week.
	fs.readFile('data/ds.txt', { encoding: 'utf8' }, function(err, defenseData) {
		allDefenses = preparePlayersArray(defenseData, defenseProjectionColumn);
		pickTeam();
	})

})();