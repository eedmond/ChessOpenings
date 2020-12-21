import { Opening } from "./Opening";
import { TrieNode } from "./TrieNode";
import { ChessInstance, ShortMove } from "chess.js";

export class OpeningsTrie {
    // Referenced to know the state of the board and the moves made
    chessBoard: ChessInstance;
    rootNode: TrieNode = new TrieNode();
  
    constructor(openings: Opening[], chess: ChessInstance) {
      this.rootNode.isActive = true;

      openings.forEach(value => {
          this.addOpening(value);
      });

      this.chessBoard = chess;
    }

    // Adds the opening to the rootNode trie
    private addOpening(opening: Opening) {
        let currentNode = this.rootNode;
        opening.moves.forEach(move => {
            if (!currentNode.nextMoves.has(move)) {
                currentNode.nextMoves.set(move, new TrieNode());
            }

            currentNode = currentNode.nextMoves.get(move)!;

            if (opening.isActive) {
              currentNode.isActive = true;
            }
        });

        currentNode.openings.push(opening);
    }
  
    // Returns true if move is part of a valid opening
    isValidMove(move: ShortMove) {
      return this.getCurrentTrieNode().nextMoves.has(move);
    }
  
    // Returns a computer move selected randomly from the available openings
    getNextMove(): ShortMove {
      let moves = Array.from(this.getCurrentTrieNode().nextMoves.keys());
      return moves[Math.floor(Math.random() * moves.length)];
    }
  
    // Returns true if there are any remaining moves that follow saved openings lines
    hasMovesToMake() {
      return this.getCurrentTrieNode().nextMoves.size > 0;
    }
  
    // Returns the list of (incomplete) openings that are possible from the current move sequence
    getPossibleOpeningsFromCurrentPosition(): Opening[] {
      let currentNode = this.getCurrentTrieNode();
      return this.getPossibleOpeningsUnderNode(currentNode);
    }
  
    // Returns the list of openings that are just completed from the current move sequence
    getCompletedOpeningsFromCurrentPosition(): Opening[] {
      return this.getCurrentTrieNode().openings;
    }

    // Utility that returns the trie node given the current state of the board
    private getCurrentTrieNode(): TrieNode {
      let currentNode = this.rootNode;

      this.chessBoard.moves({ verbose: true }).forEach(move => {
        currentNode = currentNode.nextMoves.get(move)!;
      });

      return currentNode;
    }

    private getPossibleOpeningsUnderNode(currentNode: TrieNode): Opening[] {
      let openings: Opening[] = [];
      let iterator: IteratorResult<TrieNode, any>;

      do {
        iterator = currentNode.nextMoves.values().next();
        if (iterator.done) {
          break;
        }

        openings.push(...iterator.value.openings);
        openings.push(...this.getPossibleOpeningsUnderNode(iterator.value));
      } while(!iterator.done);

      return openings;
    }
  }