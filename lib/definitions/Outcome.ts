type Outcome<T> = Outcome.SuccessType<T> | Outcome.FailureType

namespace Outcome {

    export enum Classifier {
        Failure, Success
    }

    export interface SuccessType<T> {
        classifier: Classifier.Success,
        data: T
    }

    export interface FailureType {
        classifier: Classifier.Failure,
        error?: string
    }

}

// Builders
namespace Outcome {

    export let Success = <T>(data: T): Outcome.SuccessType<T> => {
        return { classifier: Classifier.Success, data }
    }

    export let Failure = (error?: string): Outcome.FailureType => {
        return { classifier: Classifier.Failure, error }
    }

}

// Type guards
namespace Outcome {

    export let isSuccess = <T>(outcome: Outcome<T>): outcome is Outcome.SuccessType<T> => {
        return outcome?.classifier == Outcome.Classifier.Success
    }

    export let isFailure = <T>(outcome: Outcome<T>): outcome is Outcome.FailureType => {
        return outcome?.classifier == Outcome.Classifier.Failure
    }

}

export default Outcome