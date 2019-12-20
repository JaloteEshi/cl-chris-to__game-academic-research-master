import React from "react";
import { RadioSurvey } from "./RadioSurvey";

const MAX_VIEW_COUNT = 9;

export class RoundSetting extends React.Component {
  nextRoundSetting = { viewCount: {} };
  constructor(props) {
    super(props);
    // this.state = { nextRoundSetting: {} };
  }

  handleSubmit = event => {
    event.preventDefault();
    const { stage, player, game, round } = this.props;
    //sure this is not the last round
    const nextRound = game.rounds[round.index + 1];
    //nextRound have no set function while round(got from parent have the set function) 
    const key = 'round_setting';
    // console.log('key is ', key, round);
    //: validate
    let speakSum = 0;
    Object.keys(this.nextRoundSetting.viewCount).map(_id => {
      let v = this.nextRoundSetting.viewCount[_id];
      v = Math.min(MAX_VIEW_COUNT, v);
      this.nextRoundSetting.viewCount[_id] = v;
      speakSum += v;
    });
    // Force summation of choices == sum(initial speak times).
    const initSpeakTimes = game.get('initSpeakTimes');
    // console.log('======', initSpeakTimes);
    let initSpeaksSum = 0;
    initSpeakTimes.map(({ player, timeCount }) => {
      initSpeaksSum += timeCount;
    });
    if (speakSum != initSpeaksSum) {
      // TODO:UI message
      alert('Sum of your choose must equal ' + initSpeaksSum);
      return;
    }

    player.set(key, this.nextRoundSetting);
    player.round.set(key, this.nextRoundSetting);
    this.props.player.stage.submit();
  };

  handleViewCountChange = (player, value) => {
    this.nextRoundSetting.viewCount[player._id + ''] = value;
  };

  renderSubmitted() {
    return (
      <div className="task-response">
        <div className="bp3-callout bp3-icon-automatic-updates">
          <h5 className='bp3-heading'>Waiting on other players...</h5>
          Please wait until all players are ready
        </div>
      </div>
    );
  }

  renderSurvey() {
    const { game, player } = this.props;

    return (
      <div>
        <RadioSurvey {...this.props} name='one_player_speaktimes' text="I think we should give one player more speaking time." items={['Disagree', '', '', '', 'Agree']}></RadioSurvey>
        <RadioSurvey {...this.props} name='equal_speaktimes' text="I think we should have more equal speaking time." items={['Disagree', '', '', '', '', '', 'Agree']}></RadioSurvey>
      </div>
    );
  }

  render() {
    const { stage, player, game } = this.props;
    let message = "Choose viewed times plan";

    // if the player already submitted, don't show submit button
    if (player.stage.submitted) {
      return this.renderSubmitted();
    }

    // :get speakimes setting

    return (
      <div className="task-response">
        <form onSubmit={this.handleSubmit}>
          <label>View Count Plan of Next Round</label>
          <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column' }}>
            {game.players.map((p, i) => {
              return (
                <div key={i}>
                  <label>{p.get('name')} was viewed {p.get('currentSpeakTime')} last round. Next round, {p.get('name')} should be viewed</label>
                  {/* ignore max check  */}
                  <input style={{ width: '40px' }} type="number" step="1" min="1" _max={MAX_VIEW_COUNT} required onChange={(e) => { this.handleViewCountChange(p, e.target.value) }}></input>
                </div>
              );
            })}
          </div>
          {this.renderSurvey()}
          <div className="bp3-form-group">
            <button
              type="submit"
              className="bp3-button bp3-icon-tick bp3-large"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    );
  }
}

