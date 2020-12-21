import React, { useState } from "react";
import "./App.css";
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";
import { OpeningsList } from './OpeningsList';

const Chess = require("chess.js");

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
  const [openings, setOpenings] = useState<Opening[]>([]);

  const [openingsTrie, setOpeningsTrie] = useState< OpeningsTrie | undefined>(undefined);
  const initializeOpenings = (chessBoard: ChessInstance): Promise<OpeningsTrie> => {
    // Parse openings.tsv to create all the Opening variables
    let localOpenings: Opening[] = [];
    return fetch("/openings.tsv").then(res =>
      res.text()).then(data => {
        data.split('\n').forEach(dataLine => {
          localOpenings.push(new Opening(dataLine));
        });

        setOpenings(localOpenings);
        return new OpeningsTrie(openings, chessBoard);
      });
  };

  initializeOpenings(chessBoard).then(data => {
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

  const toggleOpening = (toggledOpening: Opening) => {
    const newOpeningState = !toggledOpening.isActive;
    openingsTrie?.toggleOpening(toggledOpening);
    
    const newOpenings = openings.map(opening => {
      if (opening === toggledOpening) {
        return {
          ...opening,
          isActive: newOpeningState,
        };
      }
      return opening;
    });
    setOpenings(newOpenings);
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
      <OpeningsList openings={openings} toggleOpening={toggleOpening} />
    </div>
  );
};

export default App;