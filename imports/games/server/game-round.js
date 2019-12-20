import { appConfig } from "../../../server/config";
import { Rounds } from "meteor/empirica:core/api/rounds/rounds";
import { Stages } from "meteor/empirica:core/api/stages/stages";
import { PlayerStages } from "meteor/empirica:core/api/player-stages/player-stages";



//not work, it will not invoke after created
// const _hackGameCollector = null;
// const _hackRoundCollectors = {};

// export function saveGameCollector({ game }) {
//     _hackGameCollector = game;
// }

// export function saveRoundCollector(round) {
//     console.log('>>>save', round);
//     _hackRoundCollectors[round._id] = round;
// }

// const arr = Rounds.find({}).fetch();
// console.log('>>>>', arr);

export function wrapRoundCollector(round, { game }) {
    if (!round) {
        return false;
    }
    if (round.addStage) {
        return false;
    }

    round.addStage = function (stage) { addRoundStage(round, stage, { game }); };

    return true;
}

function dbAppendRoundStages(round, stages, { game }) {
    const roundId = round._id;
    const gameId = game._id;
    const batchId = game.batchId;
    //can not get this way
    // const currentStartStageIndex = round.stages[round.stages.length - 1].index + 1;
    const currentStartStageIndex = Stages.find({ gameId }).count();
    const stageIds = stages.map((stage, index) => {
        //stage index is in the value in all of the game's stages.
        const stageIndex = currentStartStageIndex + index;
        const sParams = _.extend({ gameId, roundId, index: stageIndex }, stage);
        const stageId = Stages.insert(sParams, {
            autoConvert: false,
            filter: false,
            validate: false,
            trimStrings: false,
            removeEmptyStrings: false
        });
        // stageIndex++;
        // if (!params.currentStageId) {
        //     firstRoundId = roundId;
        //     params.currentStageId = stageId;
        // }
        const playerStageIds = game.players.map(({ _id: playerId }) => {
            return PlayerStages.insert({
                playerId,
                stageId,
                roundId,
                gameId,
                batchId
            });
        });
        Stages.update(stageId, { $set: { playerStageIds } });

        // Rounds.update(roundId, { $push: { stageIds: stageId } });
        //have to ignore validation, otherwise will not update
        Rounds.update(roundId, { $push: { stageIds: stageId, stages: stage } }, {
            autoConvert: false,
            filter: false,
            validate: false,
            trimStrings: false,
            removeEmptyStrings: false
        });
        // console.log('>>', roundId, { $push: { stageIds: stageId, stages: stage } });
        return stageId;
    });
    // const playerRoundIds = game.players.map(({ _id: playerId }) => {
    //     return PlayerRounds.insert({
    //         playerId,
    //         roundId,
    //         gameId,
    //         batchId
    //     });
    // });
    // Rounds.update(roundId, { $set: { stageIds, playerRoundIds } });
    // Rounds.update(roundId, { $set: { stageIds } });
    return roundId;
}

export function buildFirstRoundViewCountSetting({
    speakTimes, players
}) {
    speakTimes = speakTimes || [];
    if (speakTimes.length < players.length) {
        console.warn(`factor speakTimes is not valid, use default.`);
    }
    // eg:speakTimes [2,3,1] means 2 times viewed for player1. 3 times for player 2. 1 times for player1. 
    const playerSpeakTimeSetting = [];
    // :issue 1 logic
    players.map(player => {
        let setting = 3;

        //player index is 1 based
        if (speakTimes.length >= player.index) {
            setting = speakTimes[player.index - 1];
        }
        // console.log('>>>', speakTimes.length, player.index, setting);

        playerSpeakTimeSetting.push({ player, timeCount: setting });
    });

    return playerSpeakTimeSetting;
}

export function addRoundStage(round, stageArgs, { game }) {
    const { name, displayName, durationInSeconds, data = {} } = stageArgs;
    const durationInSecondsAsInt = parseInt(durationInSeconds);
    const stage = {
        name,
        displayName,
        durationInSeconds: durationInSecondsAsInt
    };
    const iStage = { ...stage, data };
    round.stages.push(iStage);
    const wraper = {
        ...stage,
        get(k) {
            return data[k];
        },
        set(k, v) {
            data[k] = v;
        }
    };
    dbAppendRoundStages(round, [iStage], { game });

    return wraper;
}

export function setupRoundBogusFeedback({ game, round }) {
    const bogusFeedbackStr = game.treatment.bogusFeedback;

    const bogusFeedback = JSON.parse(bogusFeedbackStr);

    if (bogusFeedback.length != 2) {
        return;
    }

    const percentile = _.random(bogusFeedback[0], bogusFeedback[1]);
    round.set('bogusFeedbackPercentile', percentile);
}

export function setupRoundStage({ game, players, round, playerSpeakTimeSetting }) {


    //构建 middle stage
    let queue = [];
    const debugplayerSpeakTimeSetting = [];
    playerSpeakTimeSetting.map(({ timeCount, player }) => {
        _.times(timeCount, j => { queue.push({ player, index: j }); })
        debugplayerSpeakTimeSetting.push({ timeCount, player: player._id });
    });

    //shuffle
    queue = _.shuffle(queue);
    const debugQueue = queue.map(({ player, index }, i) => {
        return { index, player: player._id, i };
    });
    // console.log('shuffle result', debugplayerSpeakTimeSetting, debugQueue);
    queue.map(({ player, index }) => {
        round.addStage({
            name: player.get("name") + index,
            displayName:
                players.length > 1
                    ? "observe " + player.get("name")
                    : "Attempt: " + Math.round(index + 1),
            durationInSeconds: appConfig.DEBUG ? 1 : game.treatment.stageDuration,
            observe: player.get("_id")
        });
    });

    //at the end of each round (i.e., discussion) you show the correct answer
    round.addStage({
        name: "outcome",
        displayName: "outcome",
        durationInSeconds: appConfig.DEBUG ? 2000000 : game.treatment.stageDuration + 10 //adding 10 seconds in the round outcome
    });

    //last round need not setting
    // if (true) {
    if (game.treatment.nRounds != round.index + 1) {
        // console.log('>>> --', game.treatment.nRounds, round.index);
        round.addStage({
            name: "setting",
            displayName: "setting",
            //can not use Number.MAX_SAFE_INTEGER or -1
            // durationInSeconds: Number.MAX_SAFE_INTEGER,
            durationInSeconds: 3600000,
        });

        //only need for debug:add a auto stage for prepare the next round stages
        // round.addStage({
        //     name: "prepareNext",
        //     displayName: "Prepare Next",
        //     //can not use Number.MAX_SAFE_INTEGER or -1 or 0
        //     durationInSeconds: 1000000,
        // });
    }
}

// fix the first or last speaker (or keep them random).
//to learn more:
//https://stackoverflow.com/questions/50536044/swapping-all-elements-of-an-array-except-for-first-and-last
function customShuffle(players, treatment) {
    // Find and remove first and last:
    const firstSpeaker = treatment.firstSpeakerFixed ? players[0] : null;
    const lastSpeaker = treatment.lastSpeakerFixed
        ? players[players.length - 1]
        : null;

    const firstIndex = players.indexOf(firstSpeaker);

    if (firstIndex !== -1) {
        players.splice(firstIndex, 1);
    }

    const lastIndex = players.indexOf(lastSpeaker);

    if (lastIndex !== -1) {
        players.splice(lastIndex, 1);
    }

    // Normal shuffle with the remaining elements using ES6:

    for (let i = players.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));

        [players[i], players[j]] = [players[j], players[i]];
    }

    // Add them back in their new position:
    if (firstIndex !== -1) {
        players.unshift(firstSpeaker);
    }

    if (lastIndex !== -1) {
        players.push(lastSpeaker);
    }

    return players;
}

// old code
// let shuffledPlayers = null;
//         //构建stage
//         //three blocks per round, each block with k Speaking Stages
//         _.times(game.treatment.nBlocks, j => {
//             //if there is special order (i.e., fix first speaker or last speaker for each round) otherwise, it will remain random
//             if (j === 0) {
//                 shuffledPlayers = customShuffle(players, game.treatment);
//             } else {
//                 shuffledPlayers = _.shuffle(players);
//             }

//             shuffledPlayers.forEach(player => {
//                 round.addStage({
//                     name: player.get("name") + j,
//                     displayName:
//                         players.length > 1
//                             ? "observe " + player.get("name")
//                             : "Attempt: " + Math.round(j + 1),
//                     durationInSeconds: game.treatment.stageDuration,
//                     observe: player.get("_id")
//                 });
//             });
//         });
//         //at the end of each round (i.e., discussion) you show the correct answer
//         round.addStage({
//             name: "outcome",
//             displayName: "outcome",
//             // durationInSeconds: Number.MAX_SAFE_INTEGER,
//             // durationInSeconds: -1
//             durationInSeconds: game.treatment.stageDuration + 10 //adding 10 seconds in the round outcome
//         });

//         if (game.treatment.nRounds != i + 1) {
//             round.addStage({
//                 name: "setting",
//                 displayName: "setting",
//                 //can not use Number.MAX_SAFE_INTEGER or -1
//                 // durationInSeconds: Number.MAX_SAFE_INTEGER,
//                 durationInSeconds: 3600000,
//             });
//         }