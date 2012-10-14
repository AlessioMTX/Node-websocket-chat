/***
** Client Chat build with node.js
** @author: Claudio Ludovico Panetta
** @version: 0.1 
** @copyright: GPLv3 licence
***/
$(function(){
	"use strict" ; 
	// Caching the DOM for speed purpose
	/****** GLOBAL VAR *******/
	var content = $("#content") ; 
	var input = $("#input") ; 
	var status = $("#status") ; 
	var myColor = false ; 
	var myName = false ; 
	var maxTimeout = 3000 ; 
	//****************/
	window.WebSocket = window.WebSocket || window.MozWebSocket ; 
	// If you use an obsolete browser you are out
	if(!window.WebSocket){
		content.html($('<p>',{ text: 'Ci dispiace ma il tuo browser è primitivo\t '
		+	' Non supporta i WebSocket.</p>'}));
		input.hide() ; 
		$("span").hide() ; 
		return ; 
	} else {
		// Open the connection
		var connection = new WebSocket('ws://127.0.0.1:8000') ; 
		connection.onopen = function() {
			// Ask for the username
			input.removeAttr('disabled') ; 
			status.text('Please grab an username:') ; 
		} ; 

		// Handle connection problem
		connection.onerror = function(error){
			content.html($('<p>',{text:'We are sorry but there\'s a provlem with the connection.</p>'}))
		} ; 

		// This is the most importan part, messages! 
		connection.onmessage = function(message){
			/**
			* Parsing the JSON
			*/
			try{
				var json = JSON.parse(message.data) ; 
			} catch (e){
				console.log("Damn it doen't work, JSON not received",message.data) ; 
				reurn ; 
			}
			// Handle the type so we can user different actions
			switch(json.type){
				case 'color' :
					myColor = json.data ; 
					status.text(myName +': ').css('color',myColor) ; 
					input.removeAttr('disabled').focus() ; 
				break ; 
				case 'history' : 
					for(var i=0; i < json.data.length; i++){
						addMessage(json.data[i].author,json.data[i].text,
							json.data[i].color, new Date(json.data[i].time)) ; 
					}
				break ; 
				case 'message' :
					input.removeAttr('disabled') ; 
					addMessage(json.data.author,json.data.text,
						json.data.color, new Data(json.data.time)) ; 
				break ; 
				default : 
					console.log("I can't unserstand this JSON :-/",json) ; 
				break ; 
			} 
		} ;

		/**
		* When user press "enter" (carriage return) he sends the message
		**/ 
		input.keydown(function(e){
			if(e.KeyCode === 13) {
				var msg = $(this).val() ; 
				if(!msg){
					return ; 
				} 
				// Send the message in plaintext
				connection.send(msg) ; 
				$(this).val('') ; 
				// Until the server doesn't responde we disable text input
				input.attr('disabled','disabled') ; 
				// We already know that the first message is the username
				if(myName === false){
					myName = msg ; 
				} 
			}
		}) ; 
		/***
		* Check the timeout response from the server.
		***/
		setInterval(function(){
			if(connection.readyState != 1){
				status.text("Error :-(") ; 
				input.attr('disabled','disabled').val('Server is out :C ') ; 
			}
		},maxTimeout) ; 
		/**
		* Add the message to the chat
		**/
		function addMessage(author,message,color,date){
			content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
		}
	}
}) ; 