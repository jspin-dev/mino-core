import Operation from "../../../definitions/CoreOperation"
import CorePreconditions from "../../../utils/CorePreconditions"
import DropType from "../../../../definitions/DropType"
import SideEffectRequest from "../../../definitions/SideEffectRequest"
import TimerName from "../../../definitions/TimerName"

let resolveDrop = Operation.Resolve(({ state }, { operations }) => {
    let autoDrop = Operation.Draft(({ state, sideEffectRequests }) => {
        sideEffectRequests.push(SideEffectRequest.TimerInterval({
            timerName: TimerName.AutoDrop,
            delay: state.settings.softDropInterval
        }))
    })
    return state.settings.softDropInterval == 0
        ? operations.drop(DropType.Soft, state.activePiece.availableDropDistance)
        : autoDrop
})

let rootOperation = Operation.Resolve((_, { operations }) => Operation.Sequence(
    operations.drop(DropType.Soft, 1),
    resolveDrop
))

export default Operation.Export({
    operationName: "startSoftDrop",
    preconditions: [ CorePreconditions.activeGame, CorePreconditions.activePiece ],
    rootOperation: rootOperation
})