import Orientation from "../../../definitions/Orientation"
import RotationSystem from "../../../schema/rotation/definitions/RotationSystem"
import TetroPiece from "../TetroPiece"
import RotationMethods from "../../../schema/rotation/rotationMethods"
import PieceIdentifier from "../../../definitions/PieceIdentifier"
import BoundingBoxOffsets from "../../../schema/rotation/definitions/BoundingBoxOffsets"
import PieceSpec from "../../../schema/definitions/PieceSpec"
import shapes from "../tetroShapes";
import initializeRs from "../../../schema/rotation/initializeRs"
import getSpawnInfo from "../../../schema/rotation/getSpawnInfo"

let buildSpec = (id: PieceIdentifier, optionalParams: PieceSpec.OptionalParams): PieceSpec => {
    return {
        id,
        shape: shapes[id],
        startLocation: optionalParams.startLocation ?? { x: 3, y: 19 },
        spawnOrientation: optionalParams.spawnOrientation ?? Orientation.North,
        offsets: optionalParams.offsets ?? BoundingBoxOffsets.None
    }
}

let iszOffsets: BoundingBoxOffsets = {
    [Orientation.North]: [0, 1],
    [Orientation.East]: [0, 0],
    [Orientation.South]: [0, 0],
    [Orientation.West]: [1, 0]
}

let pieces: { [id: PieceIdentifier]: PieceSpec } = {
    [TetroPiece.J]: buildSpec(TetroPiece.J, { spawnOrientation: Orientation.South }),
    [TetroPiece.L]: buildSpec(TetroPiece.L, { spawnOrientation: Orientation.South }),
    [TetroPiece.S]: buildSpec(TetroPiece.S, { offsets: iszOffsets }),
    [TetroPiece.Z]: buildSpec(TetroPiece.Z, { offsets: iszOffsets }),
    [TetroPiece.T]: buildSpec(TetroPiece.T, { spawnOrientation: Orientation.South }),
    [TetroPiece.I]: buildSpec(TetroPiece.I, { startLocation: { x: 3, y: 18 }, offsets: iszOffsets }),
    [TetroPiece.O]: buildSpec(TetroPiece.O, { startLocation: { x: 4, y: 20 } })
}

let rotationSystem: RotationSystem = {
    initialize: initializeRs(pieces),
    rotate: RotationMethods.basic(),
    getSpawnInfo: getSpawnInfo(pieces)
}

export default rotationSystem