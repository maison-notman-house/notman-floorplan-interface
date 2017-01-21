import React from 'react';
import ReactDOM from 'react-dom';
import building from './building.json';
import Floorplan from './Floorplan';
import {sortBy} from 'lodash';
import './index.css';
``
const roomList = sortBy(building.hospitalFloor2.rooms, 'id').map(r => {
  return <div onClick={handleClick.bind(this, r.id)}>
    <span>{r.label}</span>
    <span>{r.id}</span>
  </div>;
});

function handleClick(id) {
  highlightRoomId = id;
  render();
}

let highlightRoomId;
function render() {

  ReactDOM.render(
    <div className="columns">
      <div className="tenant-list">
      {roomList}
      </div>
      <svg>
        <Floorplan marker={[20, 30]} highlight={highlightRoomId} floor={building.hospitalFloor2} />
      </svg>
    </div>,
    document.getElementById('root')
  );

}

render();