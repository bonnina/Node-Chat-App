
$(function() {
  $('#login').click(function() {
    $('.loginForm').toggle('slow');
    $('.registration').hide('slow');
  });

  $('#register').click(function() {
    $('.registration').toggle('slow');
    $('.loginForm').hide('slow');
  });

  const socket = io();
    
  socket.on('user count', data => {
    let users = data.currentUsers + (data.currentUsers > 1 ? ' users online' : ' user online');
    $('#num-users').text(users);
    let message = data.name;
    data.connected ? message += ' has joined the chat.' :  message += ' has left the chat.';
    $('#messages').append($('<p>').html('<b>'+ message +'<\/b>'));
  });
  
  socket.on('chat message', data => {
    $('#messages').append($('<p>').text(data.name+': '+data.message));
  });

  $('form').submit(function(){
    const messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });

});

