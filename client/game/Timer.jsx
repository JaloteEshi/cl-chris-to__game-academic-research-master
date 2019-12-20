import React from "react";

import { StageTimeWrapper } from "meteor/empirica:core";

class timer extends React.Component {
  render() {
    const { remainingSeconds, stage } = this.props;

    const classes = ["timer"];
    if (remainingSeconds <= 5) {
      classes.push("lessThan5");
    } else if (remainingSeconds <= 10) {
      classes.push("lessThan10");
    }

    let secsMsg = remainingSeconds ? remainingSeconds : '--';

    if (stage.name == 'setting') {
      secsMsg = '--';
    }

    return (
      <div className={classes.join(" ")}>
        <h4>Timer</h4>
        <span className="seconds">{secsMsg}</span>
      </div>
    );
  }
}

export default (Timer = StageTimeWrapper(timer));
