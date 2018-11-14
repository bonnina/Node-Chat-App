$( document ).ready(function() {
  const socket = io();
    
  socket.on('user count', data => {
    $('#num-users').text(data.currentUsers + ' users online');
    let message = data.name;
    data.connected ? message += ' has joined the chat.' :  message += ' has left the chat.';
    $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
  });
  
  socket.on('chat message', data => {
    $('#messages').append($('<li>').text(data.name+': '+data.message));
  });

  $('form').submit(function(){
    const messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });

});