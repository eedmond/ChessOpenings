import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";

const Chess = require("chess.js");

function InitializeOpenings(chessBoard: ChessInstance): Promise<OpeningsTrie> {
  // Parse openings.tsv to create all the Opening variables
  let openings: Opening[] = [];
  return fetch("/openings.tsv").then(res =>
    res.text()).then(data => {
      data.split('\n').forEach(dataLine => {
        openings.push(new Opening(dataLine));
      });

      return new OpeningsTrie(openings, chessBoard);
    });
}

// Test function for validating enabling/disabling openings
// function enableAndDisableOpenings(openingsTrie: OpeningsTrie, openings: Opening[]) {
//   openings.forEach(opening => {
//     openingsTrie.disableOpening(opening);
//   })

//   openingsTrie.enableOpening(openings[2]);
//   openingsTrie.enableOpening(openings[200]);
// }

function makeMove(move: ShortMove, chessBoard: ChessInstance, setFen: React.Dispatch<React.SetStateAction<string>>) {
  chessBoard.move(move);
  setFen(chessBoard.fen());
}

function announceOpeningAndReset(openingsTrie: OpeningsTrie, chessBoard: ChessInstance, setFen: React.Dispatch<React.SetStateAction<string>>) {
  document.writeln(openingsTrie?.getCompletedOpeningsFromCurrentPosition()[0].name!);

  setTimeout(() => {
    chessBoard.reset();
    setFen(chessBoard.fen());
  });
}

const App: React.FC = () => {
  const [chessBoard] = useState<ChessInstance>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chessBoard.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  let isUsersTurn = true;
  let computerMoveTimer: NodeJS.Timer | undefined = undefined;

  const [openingsTrie, setOpeningsTrie] = useState< OpeningsTrie | undefined>(undefined);
  InitializeOpenings(chessBoard).then(data => {
    setOpeningsTrie(data);
  });

  const makeComputerMove = () => {
    // Respond with computer move or display completed opening after delay
    isUsersTurn = false;
    computerMoveTimer = setTimeout(() => {
      if (isUsersTurn) return;
      isUsersTurn = true;

      if (openingsTrie?.hasMovesToMake()) {
        const move = openingsTrie.getNextMove();
        makeMove(move, chessBoard, setFen);
      } else {
        announceOpeningAndReset(openingsTrie!, chessBoard, setFen);
      }

      // Temporary: Add a delay if the computer ended the opening
      setTimeout(() => {
        if (!openingsTrie?.hasMovesToMake()) {
          announceOpeningAndReset(openingsTrie!, chessBoard, setFen);
        }
      }, 1000);

      // TODO: Display the list of possible openings from current position
      // TODO: Display the list of completed openings from current position
    }, 300);
  }

  const handleMove = (move: ShortMove) => {
    if (openingsTrie?.isValidMove(move) && chessBoard.move(move)) {
      setFen(chessBoard.fen());
      makeComputerMove();
    }
  };

  const onFlipBoard = () => {
    isUsersTurn = !isUsersTurn;
    setOrientation((orientation === 'white' ? 'black' : 'white'));
    
    if (computerMoveTimer) {
      clearTimeout(computerMoveTimer);
      computerMoveTimer = undefined;
    }
    if (!isUsersTurn) {
      makeComputerMove();
    }
  };

  return (
    <div className="flex-center">
      <h1>Random Chess</h1>
      <Chessboard
        orientation={orientation}
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
      <button onClick={() => onFlipBoard()}>Flip</button>
    </div>
  );
};

export default App;