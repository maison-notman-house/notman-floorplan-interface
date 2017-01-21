import React from 'react';
import ReactDOM from 'react-dom';
import building from './building.json';
import Floorplan from './Floorplan';
import './index.css';

const roomList = building.hospitalFloor2.rooms.map(r => {
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
    <div>
      {roomList}
      <svg>
        <Floorplan highlight={highlightRoomId} floor={building.hospitalFloor2} />
      </svg>
    </div>,
    document.getElementById('root')
  );

}

render();