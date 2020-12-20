import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove, Square } from "chess.js";

const Chess = require("chess.js");

function InitializeOpenings(chessBoard: ChessInstance): OpeningsTrie {

  // TODO: Parse openings.tsv to create all the Opening variables
  return new OpeningsTrie([], chessBoard);
}

class OpeningsTrie {
  // Referenced to know the state of the board and the moves made
  chessBoard: ChessInstance;

  constructor(openings: Opening[], chess: ChessInstance) {
    // TODO: create trie from openings
    this.chessBoard = chess;
  }

  // Returns true if move is part of a valid opening
  isValidMove(move: ShortMove) {
    // TODO
    return true;
  }

  // Returns a computer move selected randomly from the available openings
  getNextMove(): ShortMove {
    // TODO
    return { from: 'a1', to: 'a2' };
  }

  // Returns true if there are any remaining moves that follow saved openings lines
  hasMovesToMake() {
    // TODO
    return true;
  }

  // Returns the list of (incomplete) openings that are possible from the current move sequence
  getPossibleOpeningsFromCurrentPosition(): Opening[] {
    // TODO
    return [];
  }

  // Returns the list of openings that are just completed from the current move sequence
  getCompletedOpeningsFromCurrentPosition(): Opening[] {
    // TODO
    return [];
  }
}

class Opening {
  name: string;
  eco: string;
  fen: string;
  moves: ShortMove[];

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

function makeMove(move: ShortMove, chessBoard: ChessInstance, setFen: React.Dispatch<React.SetStateAction<string>>) {
  chessBoard.move(move);
  setFen(chessBoard.fen());
}

const App: React.FC = () => {
  const [chessBoard] = useState<ChessInstance>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chessBoard.fen());
  const openingsTrie = InitializeOpenings(chessBoard);

  const handleMove = (move: ShortMove) => {
    if (openingsTrie.isValidMove(move) && chessBoard.move(move)) {
      setFen(chessBoard.fen());

      setTimeout(() => {
        if (openingsTrie.hasMovesToMake()) {
          move = openingsTrie.getNextMove();
          makeMove(move, chessBoard, setFen);
        }

        // TODO: Update the list of possible openings from current position
        // TODO: Update the list of completed openings from current position
      }, 300);
    }
  };

  return (
    <div className="flex-center">
      <h1>Random Chess</h1>
      <Chessboard
        width={400}
        position={fen}
        onDrop={(move) =>
          handleMove({
            from: move.sourceSquare,
            to: move.targetSquare,
            promotion: "q",
          })
        }
      />
    </div>
  );
};

export default App;