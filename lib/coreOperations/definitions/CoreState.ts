import Grid from "../../definitions/Grid"
import PendingMovement from "./PendingMovement"
import Input from "./Input"
import Settings from "./Settings"
import ActivePiece from "./ActivePiece"
import LockdownInfo from "./LockdownInfo"
import GameStatus from "./GameStatus"
import ShiftDirection from "./ShiftDirection"
import Cell from "./Cell"
import PieceIdentity from "../../definitions/PieceIdentifier"
import PieceIdentifier from "../../definitions/PieceIdentifier"
import Orientation from "../../definitions/Orientation"
import BinaryGrid from "../../definitions/BinaryGrid"

interface CoreState {
    previewQueue: PieceIdentity[],
    activePiece: ActivePiece,
    playfieldGrid: Grid<Cell>,
    lockdownInfo: LockdownInfo,
    holdEnabled: boolean,
    holdPieceId?: PieceIdentity,
    settings: Settings,
    status: GameStatus,
    activeInputs: Input.ActiveGame[],
    pendingMovement?: PendingMovement,
    distanceToFloor?: number,
    softDropActive: boolean,
    dasRightCharged: boolean,
    dasLeftCharged: boolean,
    direction: ShiftDirection,
    randomNumbers: number[],
    generatedRotationGrids?: { [id: PieceIdentifier]: CoreState.GeneratedGrids } // Optional, generated at runtime
}

namespace CoreState {

    export let initial: CoreState = {
        previewQueue: [],
        activePiece: ActivePiece.initial,
        playfieldGrid: null,
        lockdownInfo: LockdownInfo.initial,
        holdEnabled: true,
        holdPieceId: null,
        settings: null,
        status: GameStatus.Ready,
        activeInputs: [],
        pendingMovement: null,
        softDropActive: false,
        dasRightCharged: false,
        dasLeftCharged: false,
        direction: null,
        randomNumbers: []
    }

    export interface GeneratedGrids {
        [Orientation.North]: BinaryGrid
        [Orientation.East]: BinaryGrid
        [Orientation.South]: BinaryGrid
        [Orientation.West]: BinaryGrid
    }

}

export default CoreState;