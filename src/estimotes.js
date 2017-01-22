const SOCKET_URL = 'http://www.hyperlocalcontext.com/notman';
import io from 'socket.io-client';
import {get} from 'lodash';

const estimotes = {
  '35dd95220da1a184': 'M307',
  '82a3b63e3bf09d49': 'M305T',//'M301X',
  'e79ad1ae6d2127e4': 'M234',
  '201a1c507e60ee9c': 'M231X',
  'b2d5d73799044c80': 'M2-Freezer',
  'bd50e77c551f034c': 'M2-Fridge',
  '12130aa1975177df': 'M134',
  '0a5f7502b7b9788e': 'M139X',
  'b92cd7c1cd681566': 'M130X',
  'b4522194048a10a4': 'M031',
  '553fd581e00ee1ae': 'M031',
  '6d3ad3b00775baad': 'M036X',
  '0efca4f3710a0b8a': '???',
  '4dc96ec7ce962112': '???'
}

export default function connect(callback) {
  const socket = io.connect(SOCKET_URL);
  socket.on('message', m => {
    console.log('msg', m);
  });

  socket.on('appearance', handleSocketEvent)
  socket.on('disappearance', handleSocketEvent);
  socket.on('displacement', handleSocketEvent);
  socket.on('keep-alive', handleSocketEvent);

  function handleSocketEvent(e) {
    const nearable = get(e, 'tiraid.identifier.advData.manufacturerSpecificData.nearable');
    if (nearable) {
      // console.log('nearable', nearable);
      const nearableLocation = estimotes[nearable.id] || nearable.id;
  
     if (nearable.currentState !== 'still') {
        console.log('MOTION', nearable.currentState, nearable.id, nearableLocation);
      }
      callback({time: Date.now(), location: nearableLocation, state: nearable.currentState, temperature: nearable.temperature})
    }
  };
  
}