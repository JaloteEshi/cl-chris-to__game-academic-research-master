import React from "react";

export class PrepareNext extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { nextRoundSetting: {} };
  }

  componentDidMount() {
    // this.props.player.stage.submit();
  }

  handleSubmit = event => {
    this.props.player.stage.submit();
  };

  render() {
    const { stage, player, game } = this.props;

    return (<button onClick={this.handleSubmit}>Submit</button>);
  }
}

