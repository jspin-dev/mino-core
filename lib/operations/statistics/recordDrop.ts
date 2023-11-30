import Operation from "../../definitions/Operation";
import { DropScoreType, dropScoreMultipliers } from "../../definitions/scoring/scoringDefinitions";

export default (dropScoreType: DropScoreType, n: number) => Operation.Draft(({ state }) => {
    state.statistics.scoreState.score += dropScoreMultipliers[dropScoreType] * n;
})