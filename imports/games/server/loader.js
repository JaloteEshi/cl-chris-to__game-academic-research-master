import Empirica from "meteor/empirica:core";
import { taskData } from "./constants";
import "./callbacks.js";
import './onsetcallbacks'
import "./bots.js";
import {
    setupRoundStage,
    buildFirstRoundViewCountSetting,
    setupRoundBogusFeedback
} from './game-round';
import { appConfig } from "../../../server/config";


// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.
Empirica.gameInit((game, treatment, players) => {
    //for the players names (we will call them A, B, C etc)
    const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
    // similar to the color of the avatar .. to do more go to https://jdenticon.com/#icon-D3
    const arrowColors = ["#A5CC66", "#B975D1", "#DC8A92"];

    //shuffle the stimuli
    const taskSequence = _.shuffle(taskData);

    //generate the difficulty levels (i.e., how many good and how many bad performers
    let performance = Array(players.length).fill("bad");
    performance = performance.fill(
        "good",
        0,
        Math.ceil(game.treatment.nGoodPerformers * players.length)
    );
    performance = _.shuffle(performance);
    console.log("treatment: ", game.treatment, " will start with ", performance);

    players.forEach((player, i) => {
        player.set("avatar", `/avatars/jdenticon/${alphabet[i] + i}`);
        player.set("arrowColor", arrowColors[i]);
        player.set("cumulativeScore", 0);
        player.set("bonus", 0);
        player.set("name", alphabet[i]);
        player.set("performance", performance[i]);
    });

    //initial shuffle of the players .. this will effect the order of speaking
    players = _.shuffle(players);

    //构造round
    _.times(game.treatment.nRounds, i => {
        const round = game.addRound();
        //init the round index have not set yet 
        round.index = round.index || i;
        round.set("task", taskSequence[i]);
        //:setup bogus feedback
        setupRoundBogusFeedback({ game, round });

        //first the initial response
        round.addStage({
            name: "response",
            displayName: "Response",
            durationInSeconds: appConfig.DEBUG ? appConfig.DEBUG_STAGE_TIME : game.treatment.stageDuration + 5 //adding 10 seconds for the initial guess
        });

        if (i == 0) {
            //first round
            const playerSpeakTimeSetting = buildFirstRoundViewCountSetting({
                speakTimes: game.treatment.speakTimes ? JSON.parse(game.treatment.speakTimes) : null, players
            });
            game.set('initSpeakTimes', playerSpeakTimeSetting);

            setupRoundStage({
                game, players, round,
                playerSpeakTimeSetting
            });
        }
    });
});


