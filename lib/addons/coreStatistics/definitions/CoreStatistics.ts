interface CoreStatistics {
    lines: number
    keysPressed: number
    piecesLocked: number
    spawnCount: number
    holdCount: number
    time: number
    pps: number
    kpp: number
}

namespace CoreStatistics {

    export let initial: CoreStatistics = {
        lines: 0,
        keysPressed: 0,
        piecesLocked: 0,
        spawnCount: 0,
        holdCount: 0,
        time: 0,
        kpp: 0,
        pps: 0
    }

}

export default CoreStatistics;