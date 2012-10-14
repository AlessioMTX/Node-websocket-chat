/***
** Server Chat build with node.js
** @author: Claudio Ludovico Panetta
** @version: 0.1 
** @copyright: GPLv3 licence
***/
"use strict" ; // User Json Strict because we are json master
process.title = "Chat with me and Node" ;  // Fantasy Title
/*** Global Var ***/
var webSocketServerPort = 8000 ; // Server Socket port
var WebSocketServer = require('websocket').server ;  // The webstocket request 
var http = require('http') ; // Node.js require for web server
var history = [] ;  // Array for history
var clients = [] ;  // Array for clients
var colors = ['red','green','blue','magenta','purple','plum','orange'] ; // Array for colors
/*** Userfull Function ***/
function htmlEntities(str){
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
} ; 
function sortColor(){
	colors.sort(function(a,b){return Math.random() > 0.5}) ; 
}
function getColor(){
	sortColor() ; 
	return colors.shift() ; 
}
/*** Let's start build the server ***/
var server = http.createServer(function(req,res){
	  console.log((new Date()) + ' HTTP server. URL' + request.url + ' requested.');
    if (request.url === '/status') {
        response.writeHead(200, {'Content-Type': 'application/json'});
        var responseObject = {
            currentClients: clients.length,
            totalHistory: history.length
        }
        response.end(JSON.stringify(responseObject));
    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Sorry, unknown url');
    }
}) ; 
// Let's put the server on listen 
server.listen(webSocketServerPort,function() {
	console.log((new Date())+" Server online on port: "+webSocketServerPort) ; 
}) ; 
// webSocketServer here
var wsServer = new WebSocketServer({
	httpServer: server 
}) ; 
// Handler the request on the websocket
wsServer.on('request',function(request){
	// Let's log all the things !! 
	console.log((new Date())+" Connection from origin: "+request.origin) ; 
	var connection = request.accept(null,request.origin) ;
	// Identify the client
	var index = clients.push(connection)-1 ; 
	var userName = false ; 
	var userColor = false ; 
	console.log((new Date())+ " Connection accepted.") ; 
	// If there's a storyboard let show it
	if(history.length > 0){
		connection.sendUTF(JSON.stringify({type:'history',data:history})) ; 
	} 
	// Message handler
	connection.on('message',function(message){
		if(message.type == 'utf8') { // Only plain text in this chat 
			// Processing the message
			if(userName == false){ // if it's the first...
				userName = htmlEntities(message,utf8Data) ; 
				userColor = getColor() ; 
				connection.sendUTF(JSON.stringify({type:'color', data: userColor})) ; 
				connection.sendUTF(JSON.stringify({type:'name', data: userName})) ; 
				console.log((new Date()) + " User now is know as "+userName+" with color: "+userColor) ; 
			} else { // if it isn't the first
				console.log((new Date())+" Received from "+userName+ " color "*userColor) ; 
				// let's track the use
				var tracker = {
					time: (new Date()).getTime() ,
					text: htmlEntities(message.utf8Data),
					author: userName,
					color: userColor
				} ; 
				// And now we're writing the history :-D 
				history.phus(tracker) ; 
				history = history.slice(-150) ; // We flush it every 150 messages
				// And at the end let's show the message
				var messageToJson = JSON.stringify({type:'message',data: tracker}) ; 
				for (var i = 0; i < clients.length; i++) {
					clients[i].sendUTF(messageToJson) ; 
				};
			}
		} else {
			console.log("This is not a valid message") ; 
		}
	}) ; 
	// kill the connection
	connection.on('close',function(connection){
		// close the connection with the user
		if (userName !== false && userColor !== false) {
			console.log((new Date())+" Peer "+connection.remoteAddress+" says goodbye to all.") ; 
			clients.splice(index,1) ; 
			colors.push(userColor) ; 
		}
	}) ; 
}) ; 