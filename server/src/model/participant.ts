import {randomUUID} from 'node:crypto';

export class Participant {
    readonly id: string;

    constructor() {
        this.id = randomUUID();
    }
}
