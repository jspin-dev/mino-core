import type { Provider, Actionable, Operation } from "../definitions/operationalDefinitions";
import type { Grid } from "../definitions/sharedDefinitions";
import type { State } from "../definitions/stateDefinitions";
import { Settings, Randomization } from "../definitions/settingsDefinitions";
import { GameStatus } from "../definitions/metaDefinitions";

import { Spawn } from "./playfield";
import PreviewDrafters from "../drafters/previewDrafters";
import MetaDrafters from "../drafters/metaDrafters";

import { shuffle } from "../util/sharedUtils";
import { PreviewGridSettings, copyPreviewGridSettings } from "./previewGrid";

let syncGrid: Provider = {
    log: "Syncing preview grid with the piece ids in the queue",
    provide: ({ preview, settings }: State): Actionable => {
        let grid = generatePreviewGrid(preview.queue, settings);
        return PreviewDrafters.Makers.setGrid(grid)
    }    
}

export namespace Prepare {

    let enqueueFull = {
        log: "Providing a queue based on randomization settings",
        provide: ({ settings }: State): Actionable => {
            switch(settings.randomization) {
                case Randomization.Classic:
                    return enqueueFullClassic;
                case Randomization.Bag:
                    return enqueueFullBag;
            }
        } 
    }

    let enqueueFullClassic: Provider = {
        log: "Preparing classic-randomization queue",
        provide: ({ settings }: State): Actionable => {
            let previewSize = settings.nextPreviewSize;
            let n = settings.rotationSystem[0].shapes.length;
            let queue: number[] = [];
            for (let i = 0; i < previewSize; i++) {
                queue.push(Math.floor(Math.random() *  n) + 1);
            }
            return [
                PreviewDrafters.clear,
                PreviewDrafters.Makers.enqueue(...queue),
                syncGrid
            ];
        }
    }

    let enqueueFullBag: Provider = {
        log: "Preparing n-bag randomization queue",
        provide: ({ settings }: State): Actionable => {
            let previewSize = settings.nextPreviewSize;
            let n = settings.rotationSystem[0].shapes.length;
            let bagCount = Math.ceil(previewSize / n);
            return [
                PreviewDrafters.clear,
                ...[...Array(bagCount)].map(() => insertBag),
                syncGrid
            ];
        }
    }

    export let operations: Operation[] = [
        PreviewDrafters.clear,
        enqueueFull,
        syncGrid
    ]

}

let performPreviewChange = (...operations: Operation[]): Operation[] => [
    PreviewGridSettings.validate,
    ...operations,
    syncGrid,
    MetaDrafters.Makers.updateStatus(GameStatus.Ready)
]

let insertBag: Provider = {
    log: "Inserting a random bag of n pieces",
    provide: ({ preview, settings }: State): Actionable => {
        if (preview.queue.length >= settings.nextPreviewSize) {
            return [];
        }
        let n = settings.rotationSystem[0].shapes.length;  
        if (preview.randomNumbers.length < n-1) {
            throw "Insufficient random numbers to queue a new bag";
        }

        let randomNumbers = preview.randomNumbers.slice(1-n); // Takes the last n-1 numbers

        // [1, 2, 3, ...n]
        let unshuffled = Array.from(Array(n).keys()).map(i => i + 1);
        let shuffled = shuffle(unshuffled, randomNumbers);
        
        return [
            PreviewDrafters.Makers.enqueue(...shuffled),
            PreviewDrafters.Makers.RandomNumbers.remove(randomNumbers.length),
            MetaDrafters.Makers.insertAddRandomNumbersInstruction(randomNumbers.length)
        ];
    }
}

export let init: Provider = {
    provide: ({ settings }) => {
        return performPreviewChange(
            PreviewDrafters.init,
            MetaDrafters.Makers.insertAddRandomNumbersInstruction(settings.rotationSystem[0].shapes.length - 1)
        );
    }
}

export namespace Next {

    let insertClassic = {
        log: "Enqueing a random piece",
        provide: ({ preview, settings }: State): Actionable => {
            if (preview.randomNumbers.length == 0) {
                throw "Insufficient random numbers to queue a new piece";
            }
            let randomNumber = preview.randomNumbers[0];
            let numberOfPieces = settings.rotationSystem[0].shapes.length;
            let randomPiece = Math.floor(randomNumber * numberOfPieces) + 1;
            return PreviewDrafters.Makers.enqueue(randomPiece);
        }
    }
    let enqueue = {
        log: "Enqueing a random bag",
        provide: ({ settings }: State): Actionable => {
            switch(settings.randomization) {
                case Randomization.Classic:
                    return insertClassic;
                case Randomization.Bag:
                    return insertBag;
            }
        }
    }
    let spawnProvider: Provider = { 
        provide: state => Spawn.spawn(state.preview.dequeuedPiece) 
    }

    export let provider: Provider = {
        provide: () => [          
            PreviewDrafters.dequeue,
            enqueue,
            syncGrid,
            spawnProvider
        ]
    }

}

let generatePreviewGrid = (queue: readonly number[], settings: Settings): Grid => {
    let previewGridSettings = copyPreviewGridSettings(settings);

    let adjustedQueue: number[] = [ ...queue ];
    let delta = settings.nextPreviewSize - queue.length;
    if (delta > 0) {
        adjustedQueue = queue.concat(new Array(delta).fill(0));
    } else if (delta < 0) {
        adjustedQueue.splice(adjustedQueue.length + delta, -delta);
    }

    let grid: Grid = adjustedQueue
        .map(pieceId => previewGridSettings[pieceId])
        .reduce((accum, piecePreview) => {
            piecePreview.forEach(row => {
                accum.push(row)
            });
            return accum
        }, []);
    let bufferSpace = new Array(grid[0].length).fill(0);
    grid.push(bufferSpace);

    return grid;
}
