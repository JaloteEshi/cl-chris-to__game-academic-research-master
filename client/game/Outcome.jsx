import React from "react";

export default class Outcome extends React.Component {
  renderBogusFeedback() {
    const { game, player, round } = this.props;
    const percentile = round.get('bogusFeedbackPercentile');

    if (!percentile) {
      return null;
    }

    let avgCumulativeScore = 0;
    let scoreText = 0;
    game.players.map((player) => {
      avgCumulativeScore += player.get("cumulativeScore");
      scoreText += (player.round.get("score") || 0);
    });
    avgCumulativeScore = avgCumulativeScore / game.players.length;
    scoreText = scoreText / game.players.length;

    //making sure not to add "+" if the player score is negative because of not answering
    scoreText = scoreText >= 0 ? "+" + scoreText : scoreText;
    return (
      <div className="alter bp3-card bp3-elevation-2">
        <div className="info">
          <div className="left">
            {/* <img src={player.get("avatar")} className="profile-avatar" /> */}
            <h4 className="bp3-heading" style={{ color: 'black' }}>
              {avgCumulativeScore} and in {percentile}%
            </h4>
          </div>
          <div className="right">
            <span className="bp3-icon-standard bp3-icon-dollar" />
            <span className="score">{player.get("cumulativeScore") || 0}</span>
            <span
              className="variation"
              style={{ color: player.round.get("scoreColor") }}
            >
              <strong> ({scoreText})</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderPlayer = player => {
    let scoreText = player.round.get("score") || 0;
    //making sure not to add "+" if the player score is negative because of not answering
    scoreText = scoreText >= 0 ? "+" + scoreText : scoreText;
    return (
      <div className="alter bp3-card bp3-elevation-2" key={player._id}>
        <div className="info">
          <div className="left">
            <img src={player.get("avatar")} className="profile-avatar" />
            <h4 className="bp3-heading" style={{ color: player.get("arrowColor") }}>
              {player.get("name")}
            </h4>
          </div>
          <div className="right">
            <span className="bp3-icon-standard bp3-icon-dollar" />
            <span className="score">{player.get("cumulativeScore") || 0}</span>
            <span
              className="variation"
              style={{ color: player.round.get("scoreColor") }}
            >
              <strong> ({scoreText})</strong>
            </span>
          </div>
        </div>
      </div>
    );
  };

  renderIndividualScore() {
    const { game, player } = this.props;

    //other players sorted by their cumulative score
    const withoutCurrent = _.reject(game.players, p => p._id === player._id);
    const otherPlayers = _.sortBy(withoutCurrent, p =>
      p.get("cumulativeScore")
    ).reverse();

    return (
      <>
        <div className="outcome">
          <p>
            <strong>Your Score:</strong> Total (+/-increment)
          </p>
          {this.renderPlayer(player)}
        </div>
        {
          game.treatment.playerCount > 1 ? (
            <div className="outcome">
              <p>
                <strong>Other players score:</strong> Total (+/-increment)
            </p>
              {otherPlayers.map(otherPlayer => this.renderPlayer(otherPlayer))}
            </div>
          ) : null
        }
      </>
    );
  }
  render() {
    const { game, player } = this.props;

    const showIndividualScore = game.treatment.showIndividualScore;

    return (
      <div>
        {!showIndividualScore ? null :
          this.renderIndividualScore()
        }
        <div className="outcome">
          <p>
            <strong>Team Score:</strong> Average (+/-increment)
          </p>
          {this.renderBogusFeedback()}
        </div>

      </div>
    );
  }
}
