
/**
 * Define socket method for room
 */


/**
  *
  * @param {*} io socket.io instance
  */
function matchSocket(io) {
  const nsp = io.of('/match');
  nsp.on('connection', function(socket) {
    socket.on('create', function(room) {
      socket.join(room);
    });
    socket.on('quit', function(room) {
      socket.leave(room);
    });
    socket.on('agent-moved', (e) => {
      socket.to(e.room).emit('agent-moved', e);
    });
  });
  // console.log('a user connected');
}

module.exports = matchSocket;
