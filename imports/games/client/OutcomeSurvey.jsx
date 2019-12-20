import React from "react";
import { RadioSurvey } from "./RadioSurvey";

export class OutcomeSurvey extends React.Component {
    render() {
        const { game, player } = this.props;

        return (
            <div>
                <RadioSurvey {...this.props} name='speaktimes_distributed' text="My team's speaking time was ___ distributed ..." items={['equally', '', '', '', 'unequally']}></RadioSurvey>
                <RadioSurvey {...this.props} name='team_performed' text="My team performed ..." items={['poorly', '', '', '', '', '', 'well']}></RadioSurvey>
                <RadioSurvey {...this.props} name='team_earned' text="My team earned a ____ bonus this round" items={['small', '', '', '', 'large']}></RadioSurvey>
            </div>
        );
    }
}
