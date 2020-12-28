import { Opening } from "./Opening";

export class TrieNode {
    openings: Opening[] = [];
    nextMoves: Map<string, TrieNode> = new Map();
    isActive = false;
    numberOfActiveOpeningsUnder: number = 0;
    totalNumberOfOpeningsUnder: number = 0;

    public numberOfActiveOpeningsHereAndUnder(): number {
        return this.numberOfActiveOpeningsUnder + this.openings.filter(op => op.isActive).length;
    }
}