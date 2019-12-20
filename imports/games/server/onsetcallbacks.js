import Empirica from "meteor/empirica:core";

Empirica.onSet((
    game,
    round,
    stage,
    player, // Player who made the change
    target, // Object on which the change was made (eg. player.set() => player)
    targetType, // Type of object on which the change was made (eg. player.set() => "player")
    key, // Key of changed value (e.g. player.set("score", 1) => "score")
    value, // New value
    prevValue // Previous value
) => {
    // Example filtering
    if (key == "round_setting") {
        // console.log('sssss', value, player._id);

    }

    // Do some important calculation
});