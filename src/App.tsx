import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";

const Chess = require("chess.js");
const caroKannMoves: ShortMove[] = [
  { from: 'e2', to: 'e4' }, { from: 'c7', to: 'c6' },  { from: 'd2', to: 'd4' },  { from: 'd7', to: 'd5' },  { from: 'b1', to: 'd2' },  { from: 'd5', to: 'e4' },  { from: 'd2', to: 'e4' },  { from: 'c8', to: 'f5' },  { from: 'e4', to: 'g3' },  { from: 'f5', to: 'g6' },  { from: 'h2', to: 'h4' },  { from: 'h7', to: 'h6' },  { from: 'g1', to: 'f3' },  { from: 'b8', to: 'd7' },  { from: 'h4', to: 'h5' },  { from: 'g6', to: 'h7' },  { from: 'f1', to: 'd3' },  { from: 'h7', to: 'd3' },  { from: 'd1', to: 'd3' },  { from: 'g8', to: 'f6' },  { from: 'c1', to: 'd2' },  { from: 'e7', to: 'e6' },  { from: 'e1', to: 'c1' },  { from: 'f8', to: 'd6' }
];
let moveIndex = 0;

function makeCaroKannMove(chess: ChessInstance, setFen: React.Dispatch<React.SetStateAction<string>>) {
  chess.move(caroKannMoves[moveIndex++]);
  setFen(chess.fen());
}

function makeRandomMove(chess: ChessInstance, setFen: React.Dispatch<React.SetStateAction<string>>) {
  const moves = chess.moves();

  if (moves.length > 0) {
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    chess.move(computerMove);
    setFen(chess.fen());
  }
}

const App: React.FC = () => {
  const [chess] = useState<ChessInstance>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chess.fen());

  const handleMove = (move: ShortMove) => {
    if (chess.move(move)) {
      setTimeout(() => {
        if (move.to === caroKannMoves[moveIndex].to && move.from === caroKannMoves[moveIndex].from) {
          ++moveIndex;
          makeCaroKannMove(chess, setFen);
        } else {
          makeRandomMove(chess, setFen);
        }
      }, 300);

      setFen(chess.fen());
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