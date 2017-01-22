import React, { Component } from 'react';
import classNames from 'classnames';
import {forEach, get, isArray} from 'lodash';

function getDoorLocation(floor, id) {
  let door = floor.doors.find(d => d.id === id);
  if (!door) {
    for (let room of floor.rooms) {
      for (let d of room.doors) {
        if (d.id === id) {
          door = d;
          break;
        }
      }
    }
  }

  if (!door) {
    return null;
  }
  let doorPoints;
  if (isArray(door)) {
    doorPoints = door;
  } else {
    doorPoints = door.points;
  }
  return getCenter(doorPoints);
}

class Marker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleAnimationTick = () => {
    this.setState({animationState: !this.state.animationState});
  }

  componentWillUnmount() {
    this.clearInterval(this.animationTimer);
  }

  componentDidMount() {
    this.animationTimer = setInterval(this.handleAnimationTick, 600)
  }

  render() {


    const position = transformPoints([this.props.position])[0];

    let strokeWidth = 3;
    if (this.props.alarm) {
      strokeWidth = this.state.animationState ? 3 : 9 ;
    return <g>
      <circle
        className="marker-inner"
        r={3}
        cx={position[0]}
        cy={position[1]}
        style={{fill: '#303030'}}
      />
      <circle
        className="marker-outer"
        r={8}
        cx={position[0]}
        cy={position[1]}
        style={{fill: 'transparent', strokeWidth, stroke: 'red'}}
      />
    </g>;
  } else {
    return <g>
      <circle
        className="temp-circle"
        cx={position[0]}
        cy={position[1]}
        r="11"
        />
      <text
          x={position[0]}
          y={position[1]}
          className="marker-text"
        >{this.props.value}</text>
    </g>
  }
  }
}

class Floorplan extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClickRoom = (id) => {
    console.log('Clicked on ', id);
    this.setState({highlight: id});
  }

  render() {
    // const marker = get(this.props, 'marker');
      let markerElements = [];

    forEach(this.props.sensors, (doorSensor, doorId) => {
      // const doorSensor = this.props.sensors[doorId];
      
      if (doorSensor) {
        let alarm = (Date.now() - doorSensor.lastMotionTime < 5000);

        // console.log('ARA')
        let position = getDoorLocation(this.props.floor, doorId);
        if (position) {
        let value = Math.round(doorSensor.temperature);
        markerElements.push(<Marker alarm={alarm} value={value} position={position}/>);
        }
    }
    });

    const outlineData = get(this.props, 'floor.outline', []);
    const outline = <polygon className="outline" points={makePointsString(outlineData)}/>

    const stairsData = get(this.props, 'floor.stairs', []);
    const stairs = stairsData.map(stairs => <Stairs stairs={stairs}/>);

    const roomsData = get(this.props, 'floor.rooms', []);
    const rooms = roomsData.map(room => <Room highlight={room.id === this.props.highlight || room.id === this.state.highlight}room={room} onClick={this.handleClickRoom.bind(null, room.id)}/>);

    const decorativesData = get(this.props, 'floor.decoratives', []);
    const decoratives = decorativesData.map(d => <Decorative decorative={d}/>);

    const doorsData = get(this.props, 'floor.doors');
    const doorElements = doorsData.map(door => {
      <Door points={door}/>
    });

    return (
      <g className="floorplan">
        {outline}
        {stairs}
        {rooms}
        {decoratives}
        {doorElements}
        {markerElements}
      </g>
    );
  }
}

function Decorative({decorative}) {
  return <polyline className="other-walls" points={makePointsString(decorative)} />;
}

function Stairs({stairs}) {
  const stairsLines = generateStairs(stairs[0], stairs[1], 6);
  const stairsLineElements = stairsLines.map(stairsLine =>
    <polygon className="stairs-line" points={makePointsString(stairsLine)}/>
  );

  return <g className="stairs">
    {stairsLineElements}
  </g>;
}

function Room({room, highlight, onClick}) {
  return renderRoom(room, highlight, onClick);
}

function Door({points, id}) {
  return <polygon className="room-door" id={'door-' + id} points={makePointsString(points)}/>
}

function generateStairs(a, b, steps) {
  var width = b[0] - a[0];
  var height = b[1] - a[1];

  // Assuming here that the direction is horizontal (left-right stairs)
  var stepsPerWidth = 1.2;
  steps = Math.min(stepsPerWidth * width);

  var stepSize = width / steps;
  var lines = [];
  for (var s = 0; s < steps; s++) {
      var x = a[0] + stepSize * s;
      lines.push([[x, a[1]], [x, b[1]]]);
  }
  return lines;
}

// -------- Coordinate transformations

function makePointsString(points) {
  points = transformPoints(points);
  var pointStrings = [];
  for (var i = 0, len = points.length; i < len; i++) {
    pointStrings.push(points[i][0] + ',' + points[i][1]);
  }
  return pointStrings.join(' ');
}

function scalePoint(p, n) {
  return [
    p[0] * n,
    p[1] * n

  ];
}

function scalePoints(points, n) {
  return points.map(function(p) {
    return scalePoint(p, n);
  });
}

function transformPoints(points) {
  points = scalePoints(points, 8);
  points = rotatePoints(points, [0, 0], 0);
  points = translatePoints(points, [0, 0]);
  return points;
}

function rotatePoints(points, c, angle) {
    return points.map(function(p) {
        return rotatePoint(p, c, angle);
    });
}

function rotatePoint(p, c, angle) {
  angle = deg2rad(angle);
    var x = c[0] + Math.cos(angle) * (p[0] - c[0]) - Math.sin(angle) * (p[1] - c[1]);
    var y = c[1] + Math.sin(angle) * (p[0] - c[0]) + Math.cos(angle) * (p[1] - c[1]);
    return [x, y];
}

function deg2rad(deg) {
    return (deg / 180) * Math.PI;
}


function translatePoint(p, o) {
    return [p[0] + o[0], p[1] + o[1]];
}

function translatePoints(points, offset) {
    var result= [];
    for (var i = 0, len = points.length; i < len; i++) {
        result.push(translatePoint(points[i], offset));
    }
    return result;
}




function renderRoom(roomObject, highlight, onClick) {
    var walls = get(roomObject, 'walls', []);
    var doors = get(roomObject, 'doors', []);

    // var groupElement = createSVGElement('g', roomObject.isMeetingRoom ? 'meeting-room' : '');

    // var wallsElement = createSVGElement('polygon');
    // wallsElement.setAttribute('points', makePointsString(walls));
    // wallsElement.setAttribute('class', 'room-walls');
    // wallsElement.setAttribute('id', 'walls-' + roomObject.id);
    // groupElement.appendChild(wallsElement);
    // groupElement.setAttribute('id', 'room-' + roomObject.id);

    const doorsElements = doors.map((door, i) => {
      let doorPoints;
      let id;
      if (isArray(door)) {
        doorPoints = door;
        id = roomObject.id + '-' + i;
      } else {
        doorPoints = door.points;
        id = door.id;
      }
      return <Door  points={doorPoints} id={id}/>;
    });

    // var text = createSVGElement('text', 'room-label');

    var center = getCenter(walls);
    center = transformPoints([center])[0];

    const textLabel = <text
      className='room-label'
      x={center[0]}
      y={center[1]}
    >
      {roomObject.label || roomObject.id}
    </text>;

    const wallsElement = <polygon id={'walls-' + roomObject.id} className="room-walls" points={makePointsString(walls)}/>
    const groupClassName = classNames({highlight: highlight});
    const clickMask = <polygon style={{fill: 'transparent'}} points={makePointsString(walls)} onClick={onClick.bind(roomObject.id)}/>;
    // console.log('highlight', roomObject.id, highlight);
    return <g id={'room-' + roomObject.id} data-highlight={highlight} className={groupClassName}>
      {wallsElement}
      {doorsElements}
      {textLabel}
      {clickMask}
    </g>;
}

function getCenter(points) {
    var bounds = getBounds(points);
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    return [x, y];
}


function getBounds(points) {
    var minX, minY, maxX, maxY;
    minX = minY = +Infinity;
    maxX = maxY = -Infinity;

    for (var i = 0, len = points.length; i < len; i++) {
      var p = points[i];

      minX = Math.min(p[0], minX);
      maxX = Math.max(p[0], maxX);

      minY = Math.min(p[1], minY);
      maxY = Math.max(p[1], maxY);

    }
    return [[minX, minY], [maxX, maxY]];
}

export default Floorplan;
