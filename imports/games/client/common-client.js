export function isObservedPlayer({
    game, playerId, stage
}) {
    const otherPlayer = game.players.find(
        p => stage.name.charAt(0) === p.get("name")
    );
    if (!otherPlayer) {
        //response stage have no observer
        return false;
    }
    return otherPlayer._id === playerId;
}