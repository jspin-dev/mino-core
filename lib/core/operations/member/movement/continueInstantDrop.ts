import Operation from "../../../definitions/CoreOperation"
import DropType from "../../../../definitions/DropType"
import Input from "../../../../definitions/Input"

export default Operation.Resolve(({ state }, { operations }) => {
    const { settings, activePiece, activeInputs } = state
    const softDropActive = activeInputs.some(input => input.classifier == Input.ActiveGame.Classifier.SD)
    const shouldInstantDrop = settings.softDropInterval === 0 && activePiece.availableDropDistance > 0 && softDropActive
    return shouldInstantDrop ? operations.drop(DropType.Soft, activePiece.availableDropDistance) : Operation.None
})
