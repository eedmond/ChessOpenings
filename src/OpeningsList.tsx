import React from 'react';
import { FixedSizeList } from 'react-window';
import { Opening } from './Opening';

export type ToggleOpening = (toggleOpening: Opening) => void;

function ItemRenderer({ data, index, style }: { data: Opening[], index: number, style: React.CSSProperties | undefined },
  toggleOpening: ToggleOpening) {
  const item = data[index];

  return (
    <div style={style}>
      <input
        type="checkbox"
        defaultChecked={item.isActive}
        onClick={() => {
          toggleOpening(item);
        }}
      />{' '}
      {item.name}
    </div>
  );
}

function itemKey(index: number, data: Opening[]) {
  // Find the item at the specified index.
  // In this case "data" is an Array that was passed to List as "itemData".
  const item = data[index];
 
  // Return a value that uniquely identifies this item.
  // Typically this will be a UID of some sort.
  return item.name + item.fen;
}

interface Props {
  openings: Opening[];
  toggleOpening: ToggleOpening;
}

export const OpeningsList: React.FC<Props> = ({ openings, toggleOpening }) => {
  return (
    <FixedSizeList
      height={150}
      itemCount={openings.length}
      itemSize={35}
      width={450}
      itemData={openings}
      itemKey={itemKey}
    >
      {({ data, index, style }: { data: Opening[], index: number, style: React.CSSProperties | undefined }) => (
        ItemRenderer({ data, index, style }, toggleOpening)
      )}
    </FixedSizeList>
  );
};
