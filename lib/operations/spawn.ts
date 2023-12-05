import type { Coordinate } from "../definitions/playfieldDefinitions";
import { Settings } from "../definitions/settingsDefinitions";
import { TimerName, TimerOperation, GameStatus, GameOverCondition, SideEffectRequest } from "../definitions/metaDefinitions";
import { LockdownStatus } from "../definitions/lockdownDefinitions";
import { gridToList } from "../util/sharedUtils";
import { 
    findInstantDropDistance, 
    findInstantShiftDistance, 
    shouldContinueInstantShift, 
    shouldContinueInstantSoftDrop 
} from "../util/stateUtils";
import { DropScoreType } from "../definitions/scoring/scoringDefinitions";
import Operation from "../definitions/CoreOperation";
import { Orientation } from "../definitions/rotationDefinitions";
import GameEvent from "../definitions/GameEvent";

/**
 * Spawns a piece (indicated by pieceId) at the top of the playfield,
 * If no collision, updates the active piece with new coordinates
 */ 
export default (pieceId: number) => {
    return Operation.Provide(({ state }, { operations }) => {
        let { coordinates, location } = getPieceInitializationInfo(pieceId, state.settings);
        // Detect game over
        if (coordinates.some(c => state.playfield.grid[c.y][c.x] > 0)) {
            return Operation.Draft(({ state }) => { state.meta.status = GameStatus.GameOver(GameOverCondition.Blockout) })
        }
        let resetLockdown = Operation.Draft(({ state }) => { 
            state.playfield.lockdownInfo = { status: LockdownStatus.NoLockdown, largestY: 0 }
        })    
        return Operation.Sequence(
            resetLockdown,
            setActivePiece(coordinates, pieceId, location),
            operations.refreshGhost,
            operations.drop(1, DropScoreType.Auto),
            conditionalShift,
            conditionalDrop
        )
    })
}

let getPieceInitializationInfo = (id: number, settings: Settings): { 
    location: Coordinate, 
    coordinates: Coordinate[] 
} => {
    let location = settings.rotationSystem
        .startLocations
        .find(info => info.pieces.includes(id))
        .location || { x: 0, y: 0 };
    let shapes =  settings.rotationSystem.rotationGrids.map(info => {
        return [...info[Orientation.North].map(it => [...it])] // copying each grid
    });

    let shape = shapes[id - 1];
    return {
        location,
        coordinates: gridToList(shape, location.x, location.y, 1)
    }
}

let conditionalDrop = Operation.Provide(({ state }, { operations }) => {
    if (!state.meta.softDropActive) {
        return Operation.None;
    }
    let timerOperation = Operation.Draft(({ sideEffectRequests }) => {
        sideEffectRequests.push(SideEffectRequest.TimerOperation(TimerName.AutoDrop, TimerOperation.Start))
    })
    return shouldContinueInstantSoftDrop(state) ? operations.drop(findInstantDropDistance(state), DropScoreType.Soft) : timerOperation;
})

let conditionalShift = Operation.Provide(({ state }, { operations }) => {
    let { meta, settings } = state;
    if (!meta.dasRightCharged && !meta.dasLeftCharged) {
        return Operation.None;
    }
    if (settings.dasPreservationEnabled) {
        return Operation.applyIf(shouldContinueInstantShift(state), operations.shift(findInstantShiftDistance(state)));
    } else {
        let unchargeDAS = Operation.Draft(({ state }) => {
            state.meta.dasRightCharged = false;
            state.meta.dasLeftCharged = false;
        })        
        return Operation.Sequence(operations.cancelAutoShift, unchargeDAS);
    }
})

let setActivePiece = (coordinates: Coordinate[], pieceId: number, location: Coordinate) => {
    return Operation.Draft(({ state, events }) => {
        coordinates.forEach(c => state.playfield.grid[c.y][c.x] = pieceId);
        state.playfield.activePiece = {
            id: pieceId,
            location: location,
            coordinates: coordinates,
            orientation: 0,
            ghostCoordinates: [],
            activeRotation: false
        }
        events.push(GameEvent.Spawn(state.playfield.activePiece));
    })
}

