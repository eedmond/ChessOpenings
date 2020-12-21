import { ShortMove, Square } from "chess.js";

export class Opening {
    name: string;
    eco: string;
    fen: string;
    moves: ShortMove[];
    isActive = true;
  
    // Created from a line from openings.tsv
    constructor(data: string) {
      let splitData = data.split('\t');
      this.eco = splitData[0];
      this.name = splitData[1];
      this.fen = splitData[2];
  
      this.moves = splitData[3].split(' ').map(move => ({
          from: move.substr(0, 2) as Square,
          to: move.substr(2, 2) as Square
        }));
    }
  }
  