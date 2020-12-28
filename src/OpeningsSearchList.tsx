import React from "react";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";
import { OpeningsList, ToggleOpening } from './OpeningsList';

interface Props {
    searchListOpenings: Opening[];
    setSearchListOpenings: React.Dispatch<React.SetStateAction<Opening[]>>;
    openingsTrie: OpeningsTrie | undefined;
    toggleOpening: ToggleOpening;
}
  
export const OpeningsSearchList: React.FC<Props> = ({ searchListOpenings, setSearchListOpenings, openingsTrie, toggleOpening }) => {
    function onClearOpenings() {
        openingsTrie!.disableAllOpenings();
        
        const newOpenings = searchListOpenings.map(opening => {
            return {
            ...opening,
            isActive: false,
            };
        });
    
        setSearchListOpenings(newOpenings);
    }
    
    function onSelectAllOpenings() {
        openingsTrie!.enableAllOpenings();
        
        const newOpenings = searchListOpenings.map(opening => {
          return {
            ...opening,
            isActive: true,
          };
        });
        setSearchListOpenings(newOpenings);
    }
    
    const selectOpenings = (searchString: string) => {
        openingsTrie!.disableAllOpenings();
        
        const newOpenings = searchListOpenings.map(opening => {
          if (opening.name.startsWith(searchString)) {
            openingsTrie?.enableOpening(opening);
            return {
              ...opening,
              isActive: true,
            };
          } else {
            openingsTrie?.disableOpening(opening);
            return {
              ...opening,
              isActive: false,
            };
          }
        });
    
        setSearchListOpenings(newOpenings);
    }

    return (
        <div>
        <h3>All Openings</h3>
        <OpeningsList openings={searchListOpenings} toggleOpening={toggleOpening} />
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
    );
}