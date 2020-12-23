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

let computerMoveTimer: NodeJS.Timer | undefined = undefined;
let isUsersTurn = true;

const App: React.FC = () => {
  const [chessBoard] = useState<ChessInstance>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chessBoard.fen());
  const [isLineCompleted, setIsLineCompleted] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [currentListOpenings, setCurrentListOpenings] = useState<Opening[]>([]);
  const [currentCompletedOpenings, setCurrentCompletedOpenings] = useState<Opening[]>([]);

  const initializeOpenings = (chessBoard: ChessInstance): Promise<[OpeningsTrie, Opening[]]> => {
    // Parse openings.tsv to create all the Opening variables
    let localOpenings: Opening[] = [];
    return fetch("/openings.tsv").then(res =>
      res.text()).then(data => {
        data.split('\n').forEach(dataLine => {
          localOpenings.push(new Opening(dataLine));
        });

        return [new OpeningsTrie(localOpenings, chessBoard), localOpenings];
      });
  };

  const [openingsTrie, setOpeningsTrie] = useState<OpeningsTrie | undefined>(undefined);

  React.useEffect(() => {
    initializeOpenings(chessBoard).then(val => {
      setOpeningsTrie(val[0]);
      setCurrentListOpenings(val[1]);
    });
  }, [chessBoard]);

  const displayCompletedOpenings = (movesCompletedOnMovePrior: Opening[]) => {
    // Display completed openings
    let completedOpenings = openingsTrie!.getCompletedOpeningsFromCurrentPosition();
    if (completedOpenings?.length > 0) {
      setCurrentCompletedOpenings([...completedOpenings, ...movesCompletedOnMovePrior, ...currentCompletedOpenings]);
    }

    // Announce end of line, if no more moves are left
    if (!openingsTrie?.hasMovesToMake()) {
      setIsLineCompleted(true);
    }
  }

  const makeComputerMove = (movesCompletedOnMovePrior: Opening[]) => {
    // Respond with computer move or display completed opening after delay
    isUsersTurn = false;
    computerMoveTimer = setTimeout(() => {
      if (isUsersTurn) return;
      isUsersTurn = true;

      if (openingsTrie?.hasMovesToMake()) {
        const move = openingsTrie.getNextMove();
        makeMove(move, chessBoard, setFen);
      } else {
        // Computer wasn't able to make a move, clear this value since the
        // "move prior" is still the current move
        movesCompletedOnMovePrior = [];
      }

      displayCompletedOpenings(movesCompletedOnMovePrior);
    }, 300);
  }

  const handleMove = (move: ShortMove) => {
    if (openingsTrie?.isValidMove(move) && chessBoard.move(move)) {
      setFen(chessBoard.fen());
      makeComputerMove(openingsTrie!.getCompletedOpeningsFromCurrentPosition());
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
      makeComputerMove([]);
    }
  };

  const onResetBoard = () => {
    chessBoard.reset();
    setFen(chessBoard.fen());
    setCurrentCompletedOpenings([]);
    setIsLineCompleted(false);

    if (computerMoveTimer) {
      clearTimeout(computerMoveTimer);
      computerMoveTimer = undefined;
    }

    isUsersTurn = (orientation === 'white');
    if (!isUsersTurn) {
      makeComputerMove([]);
    }  
  };

  const toggleOpening = (toggledOpening: Opening) => {
    const newOpeningState = !toggledOpening.isActive;
    openingsTrie?.toggleOpening(toggledOpening);
    
    const newOpenings = currentListOpenings.map(opening => {
      if (opening.name === toggledOpening.name && opening.eco === toggledOpening.eco) {
        return {
          ...opening,
          isActive: newOpeningState,
        };
      }
      return opening;
    });
    setCurrentListOpenings(newOpenings);
  };

  const onClearOpenings = () => {
    openingsTrie!.disableAllOpenings();
    
    const newOpenings = currentListOpenings.map(opening => {
      return {
        ...opening,
        isActive: false,
      };
    });
    setCurrentListOpenings(newOpenings);
  };

  const onSelectAllOpenings = () => {
    openingsTrie!.enableAllOpenings();
    
    const newOpenings = openingsTrie!.allOpenings.map(opening => {
      return {
        ...opening,
        isActive: true,
      };
    });
    setCurrentListOpenings(newOpenings);
  };

  const selectOpenings = (searchString: string) => {
    openingsTrie!.disableAllOpenings();
    
    const newOpenings = openingsTrie!.allOpenings.filter(opening => {
      return opening.name.startsWith(searchString);
    });

    newOpenings.forEach(opening => {
      openingsTrie?.enableOpening(opening);
    });

    setCurrentListOpenings(newOpenings);
  }

  return (
    <div className="horizontal-stack">
      <div>
        <h3>All Openings</h3>
        <OpeningsList openings={currentListOpenings} toggleOpening={toggleOpening} />
        <div className="horizontal-stack center-contents">
          <button onClick={() => onClearOpenings()}>Clear</button>
          <button onClick={() => onSelectAllOpenings()}>Select all</button>
        </div>
        <div className="horizontal-stack center-contents">
          <button onClick={() => selectOpenings("Caro-Kann")}>Caro-Kann</button>
          <button onClick={() => selectOpenings("Sicilian")}>Sicilian</button>
          <button onClick={() => selectOpenings("Italian Game")}>Italian</button>
          <button onClick={() => selectOpenings("Ruy Lopez")}>Ruy Lopez</button>
          <button onClick={() => selectOpenings("Queen's Gambit")}>Queen's Gambit</button>
        </div>
      </div>
      <div>
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
        <div className="horizontal-stack center-contents">
          <button onClick={() => onFlipBoard()}>Flip</button>
          <button onClick={() => onResetBoard()}>Reset</button>
        </div>
      </div>
      <div>
        <h3>Completed Openings</h3>
        <h4 style={{display: isLineCompleted ? "block" : "none"}}>No more moves to make!</h4>
        <OpeningsList openings={currentCompletedOpenings} toggleOpening={toggleOpening} />
      </div>
    </div>
  );
};

export default App;