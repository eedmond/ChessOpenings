import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";
import fs from "fs";

const Chess = require("chess.js");

function InitializeOpenings(chessBoard: ChessInstance): OpeningsTrie {
  // Parse openings.tsv to create all the Opening variables
  let openings: Opening[] = [];
  let file = fs.readFileSync("openings.tsv", "utf8");
  file.split('\n').forEach(dataLine => {
    openings.push(new Opening(dataLine));
  });

  return new OpeningsTrie(openings, chessBoard);
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