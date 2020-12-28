import React from "react";
import { FixedSizeList } from 'react-window';
import { OpeningsTrie } from "./OpeningsTrie";
import { TrieNode } from "./TrieNode";
import { Opening } from "./Opening";

function GetItemFromData(index: number, data: OpeningsTrie): [string, TrieNode] {
    const currentNode: TrieNode = data.getCurrentTrieNode();
    let nextMoves = Array.from(currentNode.nextMoves.entries());
    nextMoves = nextMoves.sort((a, b) => {
        return b[1].numberOfActiveOpeningsUnder - a[1].numberOfActiveOpeningsUnder;
    });

    return nextMoves[index];
}

function ItemRenderer({ index, data, style }: { index: number, data: OpeningsTrie, style: React.CSSProperties | undefined }) {
    const item = GetItemFromData(index, data);

    return (
      <div style={style}>
        {item[0]} ({item[1].numberOfActiveOpeningsUnder})
      </div>
    );
}

function getFirstOpeningUnderNode(node: TrieNode): string | undefined {
    if (node.openings.length > 0) {
        return node.openings[0].name;
    } else {
        let firstOpeningName = undefined;

        for (let nextNode of node.nextMoves) {
            firstOpeningName = getFirstOpeningUnderNode(nextNode[1]);

            if (firstOpeningName !== undefined) {
                break;
            }
        }

        return firstOpeningName;
    }
}

function itemKey(index: number, data: OpeningsTrie) {
    const item = GetItemFromData(index, data);

    return item[0] + getFirstOpeningUnderNode(item[1]);
}

function getItemCount(openingsTrie: OpeningsTrie | undefined): number {
    let itemCount = 0;
    for (let nextNode of openingsTrie?.getCurrentTrieNode().nextMoves.values() ?? []) {
        if (nextNode.isActive) {
            ++itemCount;
        }
    }

    return itemCount;
}

interface Props {
    fen: string;
    searchListOpenings: Opening[];
    openingsTrie: OpeningsTrie | undefined;
  }
export const NextMoves: React.FC<Props> = ({ fen, searchListOpenings, openingsTrie }) => {  
    return (
      <div>
        <h3>Next Moves</h3>
            <FixedSizeList
            height={150}
            itemCount={getItemCount(openingsTrie)}
            itemSize={35}
            width={450}
            itemData={openingsTrie}
            itemKey={itemKey}
            >
            {({ index, data, style }: { index: number, data: OpeningsTrie, style: React.CSSProperties | undefined }) => (
                ItemRenderer({ index, data, style })
            )}
            </FixedSizeList>
      </div>
    );
  }