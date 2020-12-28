import React, { useState } from "react";
import { OpeningsTrie } from "./OpeningsTrie";
import { Opening } from "./Opening";
import { OpeningsList, ToggleOpening } from './OpeningsList';

interface Props {
    searchListOpenings: Opening[];
    setSearchListOpenings: React.Dispatch<React.SetStateAction<Opening[]>>;
    openingsTrie: OpeningsTrie | undefined;
    toggleOpening: ToggleOpening;
}


let searchInputTimer: NodeJS.Timer | undefined = undefined;

export const OpeningsSearchList: React.FC<Props> = ({ searchListOpenings, setSearchListOpenings, openingsTrie, toggleOpening }) => {
    const [searchString, setSearchString] = useState<string>("");

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

    function onClearCurrent() {
        searchListOpenings.forEach(opening => {
            openingsTrie?.disableOpening(opening);
        });

        const newOpenings = searchListOpenings.map(opening => {
            return {
                ...opening,
                isActive: false,
            };
        });
    
        setSearchListOpenings(newOpenings);
    }

    function onSelectCurrent() {
        searchListOpenings.forEach(opening => {
            openingsTrie?.enableOpening(opening);
        });

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
          if (opening.name.toLowerCase().startsWith(searchString.toLowerCase())) {
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
    
    const filterOpenings = (searchString: string) => {
        const newOpenings = openingsTrie?.allOpenings.filter(opening => {
          return (opening.name.toLowerCase().startsWith(searchString.toLowerCase()));
        });
    
        setSearchListOpenings(newOpenings!);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchString(event.target.value);

        if (searchInputTimer) {
          clearTimeout(searchInputTimer);
        }

        searchInputTimer = setTimeout(() => {
            filterOpenings(event.target.value);
        }, 500);
    }

    return (
        <div>
        <h3>All Openings</h3>
        <OpeningsList openings={searchListOpenings} toggleOpening={toggleOpening} />
        <div className="horizontal-stack center-contents">
            <input type="text" value={searchString} onChange={handleChange} />
        </div>
        <div className="horizontal-stack center-contents">
          <button onClick={() => onClearOpenings()}>Clear all</button>
          <button onClick={() => onSelectAllOpenings()}>Select all</button>
          <div style={{display: searchString.length > 0 ? "block" : "none"}}>
            <button onClick={() => onClearCurrent()}>Clear current</button>
            <button onClick={() => onSelectCurrent()}>Select current</button>
          </div>
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