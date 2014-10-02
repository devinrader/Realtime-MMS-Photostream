var Hapi = require('hapi')
  , path = require('path')
  , socketio = require('socket.io')
  , twilio = require('twilio')
  , io;

var server = Hapi.createServer('0.0.0.0', 80);


/**
 * Handler for /log route
 */
var logRoute = function(req, reply) {
  
  var sid = req.payload.MessageSid;
  console.log("Received message with Sid="+sid);
  var client = new twilio.RestClient();
  client.messages(sid).media.list(function(err, response) {
    if (err) {
      reply({'status': 'Error'});
    }
    response.mediaList.forEach(function(media) {
      io.emit('new_media', "https://api.twilio.com/" + media.uri.replace('.json', ''));
    });
  });

  reply({'status': 'OK'});
};

/**
 * When a browser connects via socket.io, stream the current set of photos
 */
function streamImagesToNewUser(id) {
  var client = new twilio.RestClient();
  client.messages.get({
    to: process.env.TWILIO_CALLER_ID, 
    num_media: 1,
    PageSize: 100}, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        response.messages.forEach(function(message) {
          if (message.num_media != '0') {
            client.messages(message.sid).media.list(function(err, response) {
              if (err) {
                console.log(err);
              } else {
                response.mediaList.forEach(function(media) {
                  if (media.contentType !== null && media.contentType.indexOf('image') >= 0) {
                    url = "https://api.twilio.com/" + media.uri.replace('.json', '');
                    console.log("Sending this image URL to the browser: " + url);
                    io.to(id).emit('new_media', url);
                  }
                });
              }
            });
          }
        });
      }
  });
}

server.route([{
  method: 'POST', path: '/log', handler: logRoute }, {
  method: 'GET', path: '/{p*}',
    handler: {
      directory: { path: './static', listing: false, index: true }
    } 
  }
]);

server.start(function () {
  io = socketio.listen(server.listener);

  io.on('connection', function(socket){
    io.to(socket.id).emit('connected', 'Connected!');
    streamImagesToNewUser(socket.id); 
  });

  console.log("Listening on port 3000");
});

