import React from "react";
import moment from 'moment';

import { Breadcrumb as Crumb, Classes } from "@blueprintjs/core";
import Timer from "../../../client/game/Timer";

export class MyBreadcrumb extends React.Component {
    render() {
        const { round, stage, player, ...rest } = this.props;

        // console.log(stage);

        // const now = moment(Date.now());
        // const startTimeAt = stage && moment(stage.startTimeAt);
        // const started = stage && now.isSameOrAfter(startTimeAt);
        // const endTimeAt =
        //     stage && startTimeAt.add(stage.durationInSeconds, "seconds");
        // const ended = stage && now.isSameOrAfter(endTimeAt);
        // const timedOut = stage && player && !player.stage.submitted && ended;
        // const roundOver = (stage && player && player.stage.submitted) || timedOut;
        // const remainingSeconds = stage && endTimeAt.diff(now, "seconds");

        // console.log('stage.durationInSeconds', stage.durationInSeconds);
        // console.log('ended', ended);
        // console.log('timedOut', timedOut);
        // console.log('roundOver', roundOver);
        // console.log('player.stage.submitted', player.stage.submitted);

        return (
            <nav className="round-nav">
                <ul className={Classes.BREADCRUMBS}>
                    <li>
                        <Crumb text={`Round ${round.index + 1}`} />
                    </li>
                    {round.stages.map(s => {
                        const disabled = s.name !== stage.name;
                        const current = disabled ? "" : Classes.BREADCRUMB_CURRENT;
                        return (
                            <li key={s.name}>
                                <Crumb
                                    text={s.displayName}
                                    disabled={disabled}
                                    className={current}
                                />
                            </li>
                        );
                    })}
                </ul>
                {/* <Timer stage={stage} /> */}
            </nav>
        );
    }
}
