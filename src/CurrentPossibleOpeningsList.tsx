import React, { useState } from "react";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";
import { OpeningsList, ToggleOpening } from './OpeningsList';

interface Props {
    fen: string;
    searchListOpenings: Opening[];
    openingsTrie: OpeningsTrie | undefined;
    toggleOpening: ToggleOpening;
  }
  
export const CurrentPossibleOpenings: React.FC<Props> = ({ fen, searchListOpenings, openingsTrie, toggleOpening }) => {
    const [currentPossibleOpenings, setCurrentPossibleOpenings] = useState<Opening[]>([]);
    // Update the possible openings whenever a move is made (fen is changed)
    // or when the search list is modified
    React.useEffect(() => {
      if (openingsTrie !== undefined) {
        setCurrentPossibleOpenings(openingsTrie.getPossibleOpeningsFromCurrentPosition());
      }
    }, [fen, searchListOpenings, openingsTrie]);
  
    return (
      <div>
        <h3>Current possible openings</h3>
        <OpeningsList openings={currentPossibleOpenings} toggleOpening={toggleOpening} />
      </div>
    );
  }