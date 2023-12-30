import type PieceIdentifier from "../../definitions/PieceIdentifier"

interface PieceGenerator {
    refill: (pieces: PieceIdentifier[], rns: number[]) => PieceGenerator.Result
    rnsRequirement: number
}

namespace PieceGenerator {

    export interface Result {
        pieces: PieceIdentifier[]
        rns: number[]
    }

}

export default PieceGenerator