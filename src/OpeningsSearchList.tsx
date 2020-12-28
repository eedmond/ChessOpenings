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
    const [isUsingStartsWithSearch, setIsUsingStartsWithSearch] = useState<boolean>(false);
    const [includeGambits, setIncludeGambits] = useState<boolean>(true);

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
    
    function selectOpenings(searchString: string) {
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
    
    function filterOpenings(searchString: string, startsWith = isUsingStartsWithSearch, useGambits = includeGambits) {
        let newOpenings = openingsTrie?.allOpenings.filter(opening => {
            if (startsWith) {
                return (opening.name.toLowerCase().startsWith(searchString.toLowerCase()));
            } else {
                return (opening.name.toLowerCase().includes(searchString.toLowerCase()));
            }
        });

        if (!useGambits) {
            newOpenings = newOpenings?.filter(opening => {
                return (!opening.name.includes("Gambit"));
            })
        }
    
        setSearchListOpenings(newOpenings!);
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchString(event.target.value);

        if (searchInputTimer) {
          clearTimeout(searchInputTimer);
        }

        searchInputTimer = setTimeout(() => {
            searchInputTimer = undefined;
            filterOpenings(event.target.value);
        }, 500);
    }

    function onStartsWithToggled() {
        setIsUsingStartsWithSearch(!isUsingStartsWithSearch);

        if ((searchString.length > 0) && searchInputTimer === undefined) {
            filterOpenings(searchString, !isUsingStartsWithSearch);
        }
    }

    function onIncludeGambitsToggled() {
        setIncludeGambits(!includeGambits);

        if ((searchString.length > 0) && searchInputTimer === undefined) {
            filterOpenings(searchString, isUsingStartsWithSearch, !includeGambits);
        }
    }

    return (
        <div>
        <h3>All Openings</h3>
        <OpeningsList openings={searchListOpenings} toggleOpening={toggleOpening} />
        <div className="horizontal-stack center-contents">
            <input type="text" value={searchString} onChange={handleChange} />
            <div className="horizontal-stack center-contents">
                <input type="checkbox" defaultChecked={isUsingStartsWithSearch} onClick={onStartsWithToggled} />
                <label>Starts with</label>
            </div>
            <div className="horizontal-stack center-contents">
                <input type="checkbox" defaultChecked={includeGambits} onClick={onIncludeGambitsToggled} />
                <label>Gambits</label>
            </div>
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