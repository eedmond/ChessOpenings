import { Opening } from "./Opening";

export class TrieNode {
    openings: Opening[] = [];
    nextMoves: Map<string, TrieNode> = new Map();
    isActive = false;
}