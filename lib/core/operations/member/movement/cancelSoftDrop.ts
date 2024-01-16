import Operation from "../../../definitions/CoreOperation"
import CorePreconditions from "../../../utils/CorePreconditions"
import TimerName from "../../../definitions/TimerName";
import SideEffectRequest from "../../../definitions/SideEffectRequest"

const rootOperation = Operation.Draft(({ state, sideEffectRequests }) => {
    sideEffectRequests.push(SideEffectRequest.TimerInterval({
        timerName: TimerName.Drop,
        delay: state.settings.dropMechanics.autoInterval
    }))
})

export default Operation.Export({
    operationName: "cancelSoftDrop",
    preconditions: [ CorePreconditions.activeGame, CorePreconditions.activePiece ],
    rootOperation
})