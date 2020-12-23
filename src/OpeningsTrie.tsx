import { Opening } from "./Opening";
import { TrieNode } from "./TrieNode";
import { ChessInstance, ShortMove, Square } from "chess.js";

type TrieHandler = (node: TrieNode) => void;

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
            if (!currentNode.nextMoves.has(`${move.from}${move.to}`)) {
                currentNode.nextMoves.set(`${move.from}${move.to}`, new TrieNode());
            }

            currentNode = currentNode.nextMoves.get(`${move.from}${move.to}`)!;

            if (opening.isActive) {
              currentNode.isActive = true;
            }
        });

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
      return this.getPossibleOpeningsUnderNode(currentNode);
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
        node.openings.forEach(opening => {
          opening.isActive = true;
        });
      });
    }

    disableAllOpenings() {
      this.forEachNode(node => {
        node.isActive = false;
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
      Array.from(node.nextMoves.values()).forEach(node => {
        this.forEachNodeHelper(node, handler);
      })
    }

    private setOpeningEnabledState(opening: Opening, newisOpeningEnabled: boolean) {
      const nodeForOpening = this.getEndNodeForOpening(opening, newisOpeningEnabled);

      // Find the specific opening at this node and set its active state
      nodeForOpening.openings.find(op => (op.name === opening.name) &&
        (op.eco === opening.eco))!.isActive = newisOpeningEnabled;

      // Set the active state of the entire node
      nodeForOpening.isActive = newisOpeningEnabled ||
        this.doesNodeHaveAnActiveOpening(nodeForOpening) ||
        this.doesNodeHaveAnActiveNextNode(nodeForOpening);

      if (!nodeForOpening.isActive) {
        this.validateDisabledNodesToOpening(opening);
      }
    }

    // Returns the node corresponding to the end of the specified opening.
    // Optionally sets all nodes to this opening as active. This is useful
    // if the opening is becoming active since all nodes leading to it then
    // must be set to active as well.
    private getEndNodeForOpening(opening: Opening, setAllToActive?: boolean): TrieNode {
      let currentNode = this.rootNode;

      opening.moves.forEach(move => {
        currentNode = currentNode.nextMoves.get(this.moveToString(move))!;

        // If we're getting a node for an opening we want to set to active,
        // then all nodes leading to this opening should also be set to active.
        if (setAllToActive?.valueOf()) {
          currentNode.isActive = true;
        }
      });

      return currentNode;
    }

    private validateDisabledNodesToOpening(opening: Opening) {
      const nodeStack = [this.rootNode];

      opening.moves.forEach(move => {
        const bottomNode = nodeStack[nodeStack.length - 1];
        nodeStack.push(bottomNode.nextMoves.get(this.moveToString(move))!);
      });

      while (nodeStack.length > 0) {
        const bottomNode = nodeStack.pop()!;

        bottomNode.isActive = this.doesNodeHaveAnActiveOpening(bottomNode) ||
          this.doesNodeHaveAnActiveNextNode(bottomNode);

        // Stop working up the stack when a node is active since this is just chaining disables
        if (bottomNode.isActive) {
          break;
        }
      }
    }
    
    private doesNodeHaveAnActiveOpening(node: TrieNode): boolean {
      return node.openings.find(op => op.isActive) !== undefined;
    }

    private doesNodeHaveAnActiveNextNode(node: TrieNode): boolean {
      return Array.from(node.nextMoves.values()).find(nextNode =>
        nextNode.isActive) !== undefined;
    }

    // Utility that returns the trie node given the current state of the board
    private getCurrentTrieNode(): TrieNode {
      let currentNode = this.rootNode;

      this.chessBoard.history({ verbose: true }).forEach(move => {
        currentNode = currentNode.nextMoves.get(this.moveToString(move))!;
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

        openings.push(...(iterator.value.openings).filter(op => op.isActive));

        if (iterator.value.isActive) {
          openings.push(...this.getPossibleOpeningsUnderNode(iterator.value));
        }
      } while(!iterator.done);

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