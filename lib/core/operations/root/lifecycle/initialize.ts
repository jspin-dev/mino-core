import type { WritableDraft } from "immer/dist/internal"
import Operation from "../../../definitions/CoreOperation"
import type Settings from "../../../definitions/Settings"
import SideEffect from "../../../definitions/SideEffect"
import Cell from "../../../../definitions/Cell"
import { createEmptyGrid } from "../../../../util/sharedUtils"

let rootOperation = Operation.Resolve((_, { defaultSettings, schema }) => {
    let draftRnsRequest = Operation.Draft(({ sideEffectRequests }) => {
        sideEffectRequests.push(SideEffect.Request.Rng(schema.pieceGenerator.rnsRequirement))
    })
    let draftStateInitialization = Operation.Draft(({ state }) => {
        state.playfield = createEmptyGrid(schema.playfield.rows, schema.playfield.columns, Cell.Empty)
        state.settings = defaultSettings as WritableDraft<Settings>
    })
    return Operation.Sequence(draftStateInitialization, schema.rotationSystem.initialize, draftRnsRequest)
})

export default Operation.Export({ operationName: "initialize", rootOperation })