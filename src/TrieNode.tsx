import { Opening } from "./Opening";
import { ShortMove } from "chess.js";

export class TrieNode {
    openings: Opening[] = [];
    nextMoves: Map<ShortMove, TrieNode> = new Map();
    isActive = false;
}