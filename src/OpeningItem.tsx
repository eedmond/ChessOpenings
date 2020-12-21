import React from 'react';
import { Opening } from './Opening';

export type ToggleOpening = (toggleOpening: Opening) => void;

interface Props {
  opening: Opening;
  toggleOpening: ToggleOpening;
}

export const OpeningItem: React.FC<Props> = ({ opening, toggleOpening }) => {
  return (
    <li>
      {/* <label
        style={{ textDecoration: todo.complete ? 'line-through' : undefined }}
      > */}
        <input
          type="checkbox"
          checked={opening.isActive}
          onClick={() => {
            toggleOpening(opening);
          }}
        />{' '}
        {opening.name}
      {/* </label> */}
    </li>
  );
};