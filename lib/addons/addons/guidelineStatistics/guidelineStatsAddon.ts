import GameEvent from "../../../coreOperations/definitions/GameEvent";
import Statistics from "../../definitions/GuidelineStatistics";
import { detectPC, detectTspin } from "./guidelineScoringUtils";
import Input from "../../../coreOperations/definitions/Input";
import finesseSettings from "./finesseSettings";
import Grid from "../../../definitions/Grid";
import OperationResult from "../../../coreOperations/definitions/CoreOperationResult";
import CoreState from "../../../coreOperations/definitions/CoreState";
import Operation from "../../../definitions/Operation";
import updateCoreStatistics from "../coreStatistics/coreStatsAddon";
import DropScoreType from "../../definitions/DropScoreType";
import LockScoreAction from "../../definitions/LockScoreAction";
import Score from "../../definitions/Score";
import ActivePiece from "../../../coreOperations/definitions/ActivePiece";
import Cell from "../../../coreOperations/definitions/Cell";
import TetroPiece from "../../../schemas/definitions/TetroPiece";

export default (coreResult: OperationResult<CoreState>) => {
    let operations = coreResult.events.map(event => updateStatisticsFromEvent(event));
    return Operation.Sequence(updateCoreStatistics(coreResult), ...operations)
}

let moveCounts = {
    [Input.ActiveGame.SD]: 0,
    [Input.ActiveGame.HD]: 0,
    [Input.ActiveGame.Hold]: 0,
    [Input.ActiveGame.ShiftLeft]: 1,
    [Input.ActiveGame.ShiftRight]: 1,
    [Input.ActiveGame.RotateCW]: 1,
    [Input.ActiveGame.RotateCCW]: 1,
    [Input.ActiveGame.Rotate180]: 2
}

let updateStatisticsFromEvent = (event: GameEvent) => {
    switch (event.classifier) {
        case GameEvent.Classifier.Drop:
            return onDrop(event);
        case GameEvent.Classifier.InputStart:
            return onInputStart(event);
        case GameEvent.Classifier.Lock:
            return onLock(event);
        case GameEvent.Classifier.Shift:
            return onShift(event);
        case GameEvent.Classifier.Rotate:
            return onRotation(event);
        default:
            return Operation.None();
    }
}

let onDrop = (event: GameEvent.DropType) => Operation.Draft<Statistics>(statistics => {
    statistics.scoreState.score += DropScoreType.multipliers[event.dropType] * event.dy;
    if (event.dy > 0) {
        statistics.rotationReferenceGrid = null;
    }
})

let onShift = (event: GameEvent.ShiftType) => Operation.Draft<Statistics>(statistics => {
    if (event.dx > 0) {
        statistics.rotationReferenceGrid = null;
    }
})

let onRotation = (event: GameEvent.RotateType) => Operation.Draft<Statistics>(statistics => {
    statistics.rotationReferenceGrid = event.previousPlayfield;
})

let onInputStart = (event: GameEvent.InputStartType) => Operation.Draft<Statistics>(statistics => {
    statistics.moveCount += moveCounts[event.input];
})

let onLock = (event: GameEvent.LockType) => {
    return Operation.Draft<Statistics>(statistics => {
        let lines = event.linesCleared.length;
        statistics.finesse += calculateFinesseOnLock(statistics, event.activePiece)
        let action = getScoreAction(lines, event.activePiece, event.playfield, statistics.rotationReferenceGrid);
        statistics.scoreState = createNewScoreStateOnLock(action, statistics.scoreState, statistics.level, lines);
        statistics.moveCount = 0;
        if (action) {
            if (action.key in statistics.actionTally) {
                statistics.actionTally[action.key]++;
            } else {
                statistics.actionTally[action.key] = 1;
            }
        }
    })
}

let calculateFinesseOnLock = (statistics: Statistics, activePiece: ActivePiece): number => {
    let coordinates = activePiece.coordinates;
    let index = coordinates.reduce((a, value) => value.x < a ? value.x : a, coordinates[0].x);
    let idealSteps = finesseSettings
        .find(set => set.pieces.includes(activePiece.id as TetroPiece))
        .info
        .find(info => info.orientations.includes(activePiece.orientation))
        .steps[index];
    return Math.max(statistics.moveCount - idealSteps.length, 0)
}

let getScoreAction = (
    lines: number, 
    activePiece: ActivePiece, 
    playfieldGrid: Grid<Cell>, 
    rotationReferenceGrid?: Grid<Cell>
): LockScoreAction => {
    if (lines > 0 && detectPC(playfieldGrid)) {
        return LockScoreAction.PC(lines);
    }
    if (rotationReferenceGrid != null) {
        let tspinType = detectTspin(activePiece, rotationReferenceGrid);
        switch (tspinType) {
            case LockScoreAction.Type.TSpin:
                return LockScoreAction.TSpin(lines);
            case LockScoreAction.Type.TSpinMini:
                return LockScoreAction.TSpinMini(lines);
        }
    }
    return lines > 0 ? LockScoreAction.LineClear(lines) : null;
}

let createNewScoreStateOnLock = (
    action: LockScoreAction, 
    previousState: Score.State,
    level: number,
    lines: number
): Score.State => {
    let combo = lines > 0 ? previousState.combo + 1 : -1;
    if (!action) {
        return { ...previousState, combo };
    }
    let actionInfo = LockScoreAction.defaultGuidelineScoringTable[action.key];
    let previousActionInfo = previousState.lastLockScoreAction 
        ? LockScoreAction.defaultGuidelineScoringTable[previousState.lastLockScoreAction.key] 
        : null;
    let b2b = previousActionInfo 
        && !previousActionInfo.breaksB2b 
        && previousActionInfo.difficult 
        && actionInfo.difficult;
    let b2bMultiplier = b2b ? actionInfo.b2bMultiplyer : 1;
    let comboScore = combo > 0 ? 50 * combo * level : 0;
    return {
        lastLockScoreAction: action,
        score: previousState.score + (actionInfo.basePointValue * b2bMultiplier) + comboScore,
        combo
    }
} 