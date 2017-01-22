import React from 'react';
import ReactDOM from 'react-dom';
import building from './building.json';
import Floorplan from './Floorplan';
import {sortBy, get} from 'lodash';
import './index.css';

import connect from './estimotes';

let sensors = {};
// console.log('connecting');
const sock = connect(e => {
  // console.log(e.location, '!!!', e);
  const sensorData = get(sensors, e.location, {});
  sensorData.temperature = e.temperature;
  sensorData.lastTemperatureTime = e.time;
  if (e.state === 'motion') {
    sensorData.lastMotionTime = e.time;
  }
  sensors[e.location] = sensorData;
  render();
});
console.log('sock', sock);

const roomList = sortBy(building.hospitalFloor2.rooms, 'id')
  .filter(r => {
    const tags = get(r, 'tags', []);
    return !tags.includes('bathroom') && !tags.includes('storage')
  })
  .map(r => {
  return <div onClick={handleClick.bind(this, r.id)}>
    <span>{r.label}</span>
    <span>{r.id}</span>
  </div>;
});

function handleClick(id) {
  highlightRoomId = id;
  render();
}

let highlightRoomId = '211';
function render() {

  ReactDOM.render(
    <div className="columns">
      <svg>
        <Floorplan sensors={sensors} highlight={highlightRoomId} floor={building.hospitalFloor3} />
      </svg>
      <svg>
        <Floorplan sensors={sensors} highlight={highlightRoomId} floor={building.hospitalFloor2} />
      </svg>
      <svg>
        <Floorplan sensors={sensors} highlight={highlightRoomId} floor={building.hospitalFloor1} />
      </svg>
    </div>,
    document.getElementById('root')
  );

}

render();