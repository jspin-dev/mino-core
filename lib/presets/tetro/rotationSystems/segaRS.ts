import Orientation from "../../../definitions/Orientation"
import RotationSystem from "../../../schema/rotation/definitions/RotationSystem"
import TetroPiece from "../TetroPiece"
import RotationMethods from "../../../schema/rotation/rotationMethods"
import PieceIdentifier from "../../../definitions/PieceIdentifier"
import BoundingBoxOffsets from "../../../schema/rotation/definitions/BoundingBoxOffsets"
import PieceSpec from "../../../schema/definitions/PieceSpec"
import shapes from "../tetroShapes"
import initializeRs from "../../../schema/rotation/initializeRs"
import getSpawnInfo from "../../../schema/rotation/getSpawnInfo"

let buildSpec = (id: PieceIdentifier, optionalParams?: PieceSpec.OptionalParams): PieceSpec => {
    return {
        id,
        shape: shapes[id],
        startLocation: optionalParams?.startLocation ?? { x: 3, y: 19 },
        spawnOrientation: optionalParams?.spawnOrientation ?? Orientation.South,
        offsets: optionalParams?.offsets ?? offsets[id]
    }
}

let offsets: { [id: PieceIdentifier]: BoundingBoxOffsets } = {
    [TetroPiece.O]: BoundingBoxOffsets.None,
    [TetroPiece.T]: BoundingBoxOffsets.None,
    [TetroPiece.J]: {
        [Orientation.North]: [0, 1],
        [Orientation.East]: [0, 0],
        [Orientation.South]: [0, 0],
        [Orientation.West]: [0, 0]
    },
    [TetroPiece.L]: {
        [Orientation.North]: [0, 1],
        [Orientation.East]: [0, 0],
        [Orientation.South]: [0, 0],
        [Orientation.West]: [0, 0]
    },
    [TetroPiece.S]: {
        [Orientation.North]: [0, 1],
        [Orientation.East]: [-1, 0],
        [Orientation.South]: [0, 0],
        [Orientation.West]: [0, 0]
    },
    [TetroPiece.Z]: {
        [Orientation.North]: [0, 1],
        [Orientation.East]: [0, 0],
        [Orientation.South]: [0, 0],
        [Orientation.West]: [1, 0]
    },
    [TetroPiece.I]: {
        [Orientation.North]: [0, 0],
        [Orientation.East]: [0, 0],
        [Orientation.South]: [0, -1],
        [Orientation.West]: [1, 0]
    }
}

let pieces: { [id: PieceIdentifier]: PieceSpec } = {
    [TetroPiece.J]: buildSpec(TetroPiece.J),
    [TetroPiece.L]: buildSpec(TetroPiece.L),
    [TetroPiece.S]: buildSpec(TetroPiece.S),
    [TetroPiece.Z]: buildSpec(TetroPiece.Z),
    [TetroPiece.T]: buildSpec(TetroPiece.T),
    [TetroPiece.I]: buildSpec(TetroPiece.I),
    [TetroPiece.O]: buildSpec(TetroPiece.O, { startLocation: { x: 4, y: 20 } })
}

let rotationSystem: RotationSystem = {
    initialize: initializeRs(pieces),
    rotate: RotationMethods.basic(),
    getSpawnInfo: getSpawnInfo(pieces)
}

export default rotationSystem