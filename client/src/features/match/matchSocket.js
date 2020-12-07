import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import io from 'socket.io-client';
import {applyMoveFromSocket} from './matchSlice';

function MatchSocket(props) {
  const {roomId} = props;
  const [socket, setSocket] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      socket.emit('quit', roomId);
      if (roomId) {
        socket.emit('create', roomId);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [roomId]);

  /* Watch socket to check when it is disconnected
   */
  useEffect(() => {
    try {
      socket.emit('create', roomId);
    } catch (e) {
      console.warn(e);
    }
  }, [socket.id]);


  /* Init socket when mount element
   */
  useEffect(() => {
    const roomSocket = io('/match', {
      transports: ['polling'],
      path: '/socket.io',
    });
    setSocket(roomSocket);
    roomSocket.on('agent-moved', (e) => {
      // console.log(e);
      dispatch(applyMoveFromSocket(e));
    });
    return () => {
      try {
        roomSocket.emit('quit', roomId);
      } catch (e) {
        console.warn('Can\'t leave...');
        console.error(e);
      }
    };
    // }, []);
  }, []);

  // add event handler
  useEffect(() => {
    const eventHandler = (e) => {
      socket.emit('agent-moved', {
        ...e.detail,
        room: roomId,
      });
    };
    document.addEventListener('agent-moved', eventHandler);
    return (() => {
      document.removeEventListener('agent-moved', eventHandler);
    });
  }, [socket.id]);

  return null;
}

export default MatchSocket;
