import { Opening } from "./Opening";
import { TrieNode } from "./TrieNode";
import { ChessInstance, ShortMove, Square } from "chess.js";

type TrieHandler = (node: TrieNode) => void;

export class OpeningsTrie {
    // Referenced to know the state of the board and the moves made
    chessBoard: ChessInstance;
    allOpenings: Opening[];
    rootNode: TrieNode = new TrieNode();
  
    constructor(openings: Opening[], chess: ChessInstance) {
      this.rootNode.isActive = false;
      this.allOpenings = openings;

      openings.forEach(value => {
          this.addOpening(value);
      });

      this.chessBoard = chess;
    }

    // Adds the opening to the rootNode trie
    private addOpening(opening: Opening) {
        let currentNode = this.rootNode;
        opening.moves.forEach(move => {
            if (!currentNode.nextMoves.has(`${move.from}${move.to}`)) {
                currentNode.nextMoves.set(`${move.from}${move.to}`, new TrieNode());
            }

            if (opening.isActive) {
              currentNode.isActive = true;
              currentNode.numberOfActiveOpeningsUnder++;
              currentNode.totalNumberOfOpeningsUnder++;
            }

            currentNode = currentNode.nextMoves.get(`${move.from}${move.to}`)!;
        });

        if (opening.isActive) {
          currentNode.isActive = true;
        }

        currentNode.openings.push(opening);
    }
  
    // Returns true if move is part of a valid opening
    isValidMove(move: ShortMove) {
      return this.getCurrentTrieNode().nextMoves
        .get(this.moveToString(move))?.isActive;
    }
  
    // Returns a computer move selected randomly from the available openings
    getNextMove(): ShortMove {
      const nextMoves = this.getCurrentTrieNode().nextMoves;

      let moveStrings = Array.from(this.getCurrentTrieNode().nextMoves.keys());
      moveStrings = moveStrings.filter(move => nextMoves.get(move)!.isActive);
      return this.stringToMove(moveStrings[Math.floor(Math.random() * moveStrings.length)]);
    }
  
    // Returns true if there are any remaining moves that follow saved openings lines
    hasMovesToMake() {
      const nextMoves = Array.from(this.getCurrentTrieNode().nextMoves.values());
      return nextMoves.filter(node => node.isActive).length > 0;
    }
  
    // Returns the list of (incomplete) openings that are possible from the current move sequence
    getPossibleOpeningsFromCurrentPosition(): Opening[] {
      const currentNode = this.getCurrentTrieNode();

      if (currentNode === this.rootNode) {
        // Optimized route to return all openings rather than building it recursively
        return this.allOpenings.filter(op => op.isActive);
      } else {
        return this.getPossibleOpeningsUnderNode(currentNode);
      }
    }
  
    // Returns the list of openings that are just completed from the current move sequence
    getCompletedOpeningsFromCurrentPosition(): Opening[] {
      return this.getCurrentTrieNode().openings.filter(op => op.isActive);
    }

    toggleOpening(opening: Opening) {
      this.setOpeningEnabledState(opening, !opening.isActive);
    }

    enableOpening(opening: Opening) {
      this.setOpeningEnabledState(opening, true);
    }

    disableOpening(opening: Opening) {
      this.setOpeningEnabledState(opening, false);
    }

    enableAllOpenings() {
      this.forEachNode(node => {
        node.isActive = true;
        node.numberOfActiveOpeningsUnder = node.totalNumberOfOpeningsUnder;
        node.openings.forEach(opening => {
          opening.isActive = true;
        });
      });
    }

    disableAllOpenings() {
      this.forEachNode(node => {
        node.isActive = false;
        node.numberOfActiveOpeningsUnder = 0;
        node.openings.forEach(opening => {
          opening.isActive = false;
        });
      });
    }

    private forEachNode(handler: TrieHandler) {
      this.forEachNodeHelper(this.rootNode, handler);
    }

    private forEachNodeHelper(node: TrieNode, handler: TrieHandler) {
      handler(node);
      for (let child of node.nextMoves.values()) {
        this.forEachNodeHelper(child, handler);
      }
    }

    private setOpeningEnabledState(opening: Opening, newisOpeningEnabled: boolean) {
      const nodeForOpening = this.getEndNodeForUpdatedOpening(opening, newisOpeningEnabled);

      // Find the specific opening at this node and set its active state
      nodeForOpening.openings.find(op => (op.name === opening.name) &&
        (op.fen === opening.fen))!.isActive = newisOpeningEnabled;

      // Set the active state of the entire node
      nodeForOpening.isActive = newisOpeningEnabled ||
        this.doesNodeHaveAnActiveOpening(nodeForOpening) ||
        this.doesNodeHaveAnActiveNextNode(nodeForOpening);
    }

    // Returns the node corresponding to the end of the specified opening that was just enabled
    // or just disabled. It updates the count of active openings under each node on the way down
    // to the opening and updates the active state of each node accordingly.
    private getEndNodeForUpdatedOpening(opening: Opening, isNewOpeningEnabled: boolean): TrieNode {
      let currentNode = this.rootNode;

      opening.moves.forEach(move => {
        if (isNewOpeningEnabled) {
          currentNode.isActive = true;
          currentNode.numberOfActiveOpeningsUnder++;
        } else if (--currentNode.numberOfActiveOpeningsUnder === 0 && !this.doesNodeHaveAnActiveOpening(currentNode)) {
          currentNode.isActive = false;
        }

        currentNode = currentNode.nextMoves.get(this.moveToString(move))!;
      });

      return currentNode;
    }
    
    private doesNodeHaveAnActiveOpening(node: TrieNode): boolean {
      return node.openings.find(op => op.isActive) !== undefined;
    }

    private doesNodeHaveAnActiveNextNode(node: TrieNode): boolean {
      return Array.from(node.nextMoves.values()).find(nextNode =>
        nextNode.isActive) !== undefined;
    }

    // Utility that returns the trie node given the current state of the board
    public getCurrentTrieNode(): TrieNode {
      let currentNode = this.rootNode;

      this.chessBoard.history({ verbose: true }).forEach(move => {
        currentNode = currentNode.nextMoves.get(this.moveToString(move))!;
      });

      return currentNode;
    }

    private getPossibleOpeningsUnderNode(currentNode: TrieNode): Opening[] {
      let openings: Opening[] = [];
      
      for (let node of currentNode.nextMoves.values()) {

        openings.push(...(node.openings).filter(op => op.isActive));

        if (node.isActive) {
          openings.push(...this.getPossibleOpeningsUnderNode(node));
        }
      }

      return openings;
    }

    private moveToString(move: ShortMove): string {
      return `${move.from}${move.to}`;
    }

    private stringToMove(str: string): ShortMove {
      return {
        from: str.substr(0, 2) as Square,
        to: str.substr(2, 2) as Square
      }
    }
  }