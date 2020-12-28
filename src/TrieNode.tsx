import { Opening } from "./Opening";

export class TrieNode {
    openings: Opening[] = [];
    nextMoves: Map<string, TrieNode> = new Map();
    isActive = false;
    numberOfActiveOpeningsUnder: number = 0;
    totalNumberOfOpeningsUnder: number = 0;
}