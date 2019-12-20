import React from "react";

export class RadioSurvey extends React.Component {
    handleChangeSurvey = event => {
        const { game, round, stage, player } = this.props;
        const value = event.target.value;
        const name = event.target.name;
        player.round.set('survey_' + name, value);
        this.props.onChange && this.props.onChange({ name, value });
    }

    render() {
        const { name, items, text, className = '' } = this.props;

        return (
            <div className={className}>
                <strong>
                    {text}
                </strong>
                <div>
                    {items.map((text, i) => {
                        return <div key={i}><input onChange={this.handleChangeSurvey} type="radio" name={name} value={i + 1} /> {text}</div>
                    })}

                </div>
            </div>);
    }
}
