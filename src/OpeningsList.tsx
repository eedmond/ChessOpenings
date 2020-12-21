import React from 'react';
import { Opening } from './Opening';
import { OpeningItem, ToggleOpening } from './OpeningItem';

interface Props {
  openings: Opening[];
  toggleOpening: ToggleOpening;
}

export const OpeningsList: React.FC<Props> = ({ openings, toggleOpening }) => {
  return (
    <ul>
      {openings.map(opening => (
        <OpeningItem key={opening.eco + opening.name} opening={opening} toggleOpening={toggleOpening} />
      ))}
    </ul>
  );
};