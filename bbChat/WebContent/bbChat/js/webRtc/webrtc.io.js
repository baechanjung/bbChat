//CLIENT

//Fallbacks for vendor-specific variables until the spec is finalized.
var PeerConnection 			= window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var URL 		   			= window.URL || window.webkitURL || window.msURL || window.oURL;
var getUserMedia1  			= navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
if(window.mozRTCPeerConnection){
	var RTCSessionDescription 	= window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.RTCSessionDescription;
	var RTCIceCandidate 		= window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.RTCIceCandidate;
}
(function() {

	var rtc;
	if ('undefined' === typeof module) {
		rtc = this.rtc = {};
	} else {
		//rtc = module.exports = {};
	}

	// Holds a connection to the server.
	rtc._socket = null;

	// Holds identity for the client
	rtc._me = null;

	// Holds callbacks for certain events.
	rtc._events = {};
	
	rtc.on = function(eventName, callback) {
		rtc._events[eventName] = rtc._events[eventName] || [];
		rtc._events[eventName].push(callback);
	};

	rtc.fire = function(eventName, _) {
		var events = rtc._events[eventName];
		var args = Array.prototype.slice.call(arguments, 1);

		if (!events) {
			console.log('not fire Event :: ' + eventName);
			return;
		}

		for (var i = 0, len = events.length; i < len; i++) {
			events[i].apply(null, args);
		}
	};

	// Holds the STUN/ICE server to use for PeerConnections.
    if (window.mozRTCPeerConnection) {
    	rtc.SERVER = {iceServers:[
    	                          {   url:"stun:23.21.150.121"}
    	                          ,{   url:"turn:numb.viagenie.ca:3478"
    	                        	  ,username:"lbjj1983@naver.com" 
    	                        		  ,credential:"qwer1234!" 
    	                          }
    	                          ]
    	};
    }else{
    	rtc.SERVER = {iceServers:[
    	                          {   url:"stun:stun.l.google.com:19302"}
    	                          ,{   url:"turn:numb.viagenie.ca:3478"
    	                        	  ,username:"lbjj1983@naver.com" 
    	                        		  ,credential:"qwer1234!" 
    	                          }
    	                          ]
    	};
    }

	// Reference to the lone PeerConnection instance.
	rtc.peerConnections = {};

	// Array of known peer socket ids
	rtc.connections = [];
	// Stream-related variables.
	rtc.streams = [];
	
	// Reference to the data channels
	rtc.dataChannels = {};

	// PeerConnection datachannel configuration
	rtc.dataChannelConfig = {optional: [ {RtpDataChannels: true} ] };


	// check whether data channel is supported.
	rtc.checkDataChannelSupport = function() {
		return false;
	};

	rtc.dataChannelSupport = rtc.checkDataChannelSupport();

	/**
	 * Connects to the websocket server.
	 */
	rtc.connect = function(server, room, user, img, gb, stream) {
		
		room = room || ""; // by default, join a room called the blank string
		rtc._socket = new WebSocket(server); 

		
		rtc._socket.onopen = function() {

			rtc._socket.send(JSON.stringify({ 	
				"eventName": "join_room",
				"data":{
					 "room" 	: room
					,"user" 	: user
					,"gb"   	: gb
					,"img"  	: img
					,"stream"   : stream
				}
			}));


			rtc._socket.onmessage = function(msg) {
				var json = JSON.parse(msg.data);
				rtc.fire(json.eventName, json.data);
			};

			rtc._socket.onerror = function(err) {  	
				console.error(err);
			};

			rtc._socket.onclose = function(data) {
				delete rtc.peerConnections[rtc._socket.id]; 
			};
			
			rtc.on('empty_room', function(data) {
				alert("현재 존재하지 않는 회의실 입니다.");
				location.href="/bizmeet/main";
			});
			
			rtc.on('room_file_append', function(data) {
				
				var file;
				for (var i = 0; i < data.FILE_LIST.length; i++) {
				    file = data.FILE_LIST[i];
				    
			    	if( i == 0 && data.FILE_SHOW == "Y" ){
						
						imgListLoad(file);
						//alert(data.FILE_SHARE_ID);
						fileOwner = false;
						$("#canvasDraw"						).css("cursor","");
						$("[name='shareIcon']"				).hide();
						$("#div_remoteyou"					).find("img").hide();
						$("#div_nonvideoyou"				).hide();
						$("#exit"							).hide();
						$(".csstransforms"					).hide();
						
						fileShareId = data.FILE_SHARE_ID;
						
						if( data.FILE_IDX > 0 ){
							
							$("#canvasImg" ).attr("src"  ,imgPath[data.FILE_IDX]);
							
							imgIndex = Number(data.FILE_IDX);
							
							if( imgIndex == imgSize-1){
								$("#next").hide();
							}else{
								$("#next").show();
							}
							
							if( imgIndex == 0 ){
								$("#pre").hide();
							}else{
								$("#pre").show();
							}
							
							var id 		= imgIndex + 1;
							var target  = document.getElementById("smove"+id).offsetTop;
							$('.small-list'	).animate({scrollTop:target}, 0);
							$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
							$( ".big-list" 	).scrollTop( 0 );
							
						}
						
					}
				    
				    $(".file_box"	).find("ul").append("<li><a>"+file.ORG_FILE_NM+"</a></li>");
				    $(".file_box"	).find("ul").find("li:last").data("FILE_LIST" , file);
					$(".file_box"	).find("ul").find("li:last").bind("click" ,function(){
						var obj = $(this).data("FILE_LIST");
						imgListLoad(obj);
						
						fileOwner = true;
						$("#canvasDraw"			).css("cursor","url(/bbChat/img/icon/icon_pen.png) 0 25, auto");
						$(".filearea"			).hide();
						$("[name='shareIcon']"	).hide();
						$("#div_nonvideoyou"	).hide();
						$("#div_remoteyou"		).find("img").show();
						$("#exit"				).show();
						$(".csstransforms"		).show();
						
						websocketBb.send(JSON.stringify({
							"eventName" : "fileConvertSend",
							"data" : {
								"ROOM"       	: roomNm
							  ,	"SIZE"       	: obj["SIZE"]
							  ,	"FILE_NM"    	: obj["FILE_NM"]
							  ,	"ORG_FILE_NM"   : obj["ORG_FILE_NM"]
							  ,	"MODE"   		: "C" // C : 변경 ,  U : 업로드
							}
						}));
					});
				}
				
				
				
			});

			rtc.on('get_peers', function(data) {
				
				if( data.stream != null ){
					rtc.connections = data.connections;
					rtc._me = data.you;
					
					var userInfo =	""; 
					var userNm 	 = 	"";
					var socId 	 =	"";
					
					rtc.fire('ready');
					
					for (var i = 0, len = data.notvideos.length; i < len; i++) {
						
						userInfo = data.notvideos[i];
						userNm 	 = userInfo["USER_NM"];
						socId 	 = userInfo["SOCKET_ID"];
						
						nonVideos.push("<div id='div_remote"+socId+"' class='non-video'><div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon'></div>");
					}
				}else{
					// 카메라 없을때 상대방 DIV 처리
					var userInfo =	""; 
					var userNm 	 = 	"";
					var socId 	 =	"";
						
					for (var i = 0, len = data.notvideos.length; i < len; i++) {
						userInfo = data.notvideos[i];
						userNm 	 = userInfo["USER_NM"];
						socId 	 = userInfo["SOCKET_ID"];
						
						nonVideos.push("<div id='div_remote"+socId+"' class='non-video'><div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon'></div>");
					}
					for (var i = 0, len = data.videos.length; i < len; i++) {
						userInfo = data.videos[i];
						userNm 	 = userInfo["USER_NM"];
						socId 	 = userInfo["SOCKET_ID"];
						
						nonVideos.push("<div id='div_remote"+socId+"' class='non-video'><div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon'></div>");
					}
					
				}
				
		        	
				setInterval(function(){
				console.log("alive_client");
		    	   rtc._socket.send(JSON.stringify({ 	
						"eventName": "alive_client"
					}));
		        }, 180000);//3분마다 알림
				
				
				console.log("nonVideos.length == " + nonVideos.length);
				subdivideVideos();
			});
			
			rtc.on('receive_ice_candidate', function(data) {
				var candidate = new RTCIceCandidate(data);
				rtc.peerConnections[data.socketId].addIceCandidate(candidate);
			});

			rtc.on('new_peer_connected', function(data) {
				if( data.stream != null && supportYn == "Y" ){
					var pc = rtc.createPeerConnection(data.socketId);
					
					for (var i = 0; i < rtc.streams.length; i++) {
						var stream = rtc.streams[i];
						pc.addStream(stream);
					}
				}else{
					var userNm 	 = 	data.user;
					var socId 	 =	data.socketId;
					nonVideos.push("<div id='div_remote"+socId+"' class='non-video'><div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon'></div>");
					console.log("nonVideos.length == " + nonVideos.length);
					subdivideVideos();
					
					if ( fileShareId != "" ){
						$("#div_remote"+fileShareId	).find("img").show();
						fileShareId = "";
					}
				}
				
			});

			rtc.on('remove_peer_connected', function(data) {
				rtc.fire('disconnect stream', data.socketId);
				if ( data.stream != null )
					delete rtc.peerConnections[data.socketId];
			});

			rtc.on('receive_offer', function(data) {
				rtc.receiveOffer(data.socketId, data.sdp);
			});

			rtc.on('receive_answer', function(data) {
				rtc.receiveAnswer(data.socketId, data.sdp);
			});
			
		};
	};


	rtc.sendOffers = function() {
		
		for (var i = 0, len = rtc.connections.length; i < len; i++) {
			var socketId = rtc.connections[i];
			rtc.sendOffer(socketId);
		}
	};
	
	rtc.sendOffer = function(socketId) {
		var pc = rtc.peerConnections[socketId];
		
		pc.createOffer( function(session_description) {
			
			pc.setLocalDescription(session_description);
			rtc._socket.send(JSON.stringify({
				"eventName": "send_offer",
				"data":{
					"socketId": socketId,
					"sdp"     : session_description
				}
			}));
		},function(e){alert(e);});
	};

	rtc.onClose = function(data) {
		rtc.on('close_stream', function() {
			rtc.fire('close_stream', data);
		});
	};

	rtc.createPeerConnections = function() {
		for (var i = 0; i < rtc.connections.length; i++) {
			rtc.createPeerConnection(rtc.connections[i]);
		}
	};

	rtc.createPeerConnection = function(id) {
		var config;
		if (rtc.dataChannelSupport)
			config = rtc.dataChannelConfig;

		var pc = rtc.peerConnections[id] = new PeerConnection(rtc.SERVER, config);
		
		//return;
		pc.onicecandidate = function(event) {
			if (event.candidate) {
				rtc._socket.send(JSON.stringify({
					"eventName": "send_ice_candidate",
					"data": {
						"label"		: event.candidate.label,
						"candidate" : event.candidate.candidate,
						"socketId"	: id
					}
				}));
			}
		};

		pc.onopen = function() {
			rtc.fire('peer connection opened');
		};

		pc.onaddstream = function(event) {
			rtc.fire('add remote stream', event.stream, id);
		};

		if (rtc.dataChannelSupport) {
			pc.ondatachannel = function (evt) {
				console.log('data channel connecting ' + id);
				rtc.addDataChannel(id, evt.channel);
			};
		}

		return pc;
	};


	rtc.receiveOffer = function(socketId, sdp) {
		var pc = rtc.peerConnections[socketId];
		
		pc.setRemoteDescription( new RTCSessionDescription( sdp ));
		
		rtc.sendAnswer(socketId);
	};

	rtc.sendAnswer = function(socketId) {
		var pc = rtc.peerConnections[socketId];
		pc.createAnswer( function(session_description) {
			pc.setLocalDescription(session_description);
			rtc._socket.send(JSON.stringify({
				"eventName": "send_answer",
				"data":{
					"socketId": socketId,
					"sdp"     : session_description
				}
			}));
			var offer = pc.remoteDescription;
		},function(e){alert(e);});
	};


	rtc.receiveAnswer = function(socketId, sdp) {
		var pc = rtc.peerConnections[socketId];
		pc.setRemoteDescription(new RTCSessionDescription(sdp));
	};

	
	rtc.createStream = function(opt, onSuccess, onFail) {
		
		var options;
		onSuccess = onSuccess || function() {};
		onFail    = onFail 	  || function() {};
		options = {
				video: {
				    mandatory: {
                        maxWidth  : 400,
                        maxHeight : 300,
                        minWidth  : 400,
                        minHeight : 300
				    }
				},
				audio: !!opt.audio
		};
		
		/*
		options = {
				video: !!opt.video,
				audio: !!opt.audio
		};
		 */
		
		if (getUserMedia1) {
			getUserMedia1.call(navigator, options, function(stream) {
				rtc.streams.push(stream);
				onSuccess(stream);
			}, function() {
				//onFail();
				//rtc.streams.push(null);
				onSuccess(null);
			});
		} else {
			alert('webRTC is not yet supported in this browser.');
		}
	};

	rtc.addStreams = function() {
		
		console.log(' rtc.streams.length :: ' + rtc.streams.length);
		for (var i = 0; i < rtc.streams.length; i++) {
			var stream = rtc.streams[i];

			if( stream != null ){
				for (var connection in rtc.peerConnections) {
					rtc.peerConnections[connection].addStream(stream);
				}
			}
		}
	};

	rtc.attachStream = function(stream, domId) {
		document.getElementById(domId).src = URL.createObjectURL(stream);
	};


	rtc.createDataChannel = function(pcOrId, label) {
		if (!rtc.dataChannelSupport) {
			alert('webRTC data channel is not yet supported in this browser,' +
			' or you must turn on experimental flags');
			return;
		}

		if (typeof(pcOrId) === 'string') {
			id = pcOrId;
			pc = rtc.peerConnections[pcOrId];
		} else {
			pc = pcOrId;
			id = undefined;
			for (var key in rtc.peerConnections) {
				if (rtc.peerConnections[key] === pc)
					id = key;
			}
		}

		if (!id)
			throw new Error ('attempt to createDataChannel with unknown id');

		if (!pc || !(pc instanceof PeerConnection))
			throw new Error ('attempt to createDataChannel without peerConnection');

		// need a label
		label = label || 'fileTransfer' || String(id);

		// chrome only supports reliable false atm.
		options = {reliable: false};

		try {
			console.log('createDataChannel ' + id);
			channel = pc.createDataChannel(label, options);
		} catch (error) {
			console.log('seems that DataChannel is NOT actually supported!');
			throw error;
		}

		return rtc.addDataChannel(id, channel);
	};

	rtc.addDataChannel = function(id, channel) {

		channel.onopen = function() {
			console.log('data stream open ' + id);
			rtc.fire('data stream open', channel);
		};

		channel.onclose = function(event) {
			delete rtc.dataChannels[id];
			console.log('data stream close ' + id);
			rtc.fire('data stream close', channel);
		};

		channel.onmessage = function(message) {
			console.log('data stream message ' + id);
			console.log(message);
			rtc.fire('data stream data', channel, message.data);
		};

		channel.onerror = function(err) {
			console.log('data stream error ' + id + ': ' + err);
			rtc.fire('data stream error', channel, err);
		};

		// track dataChannel
		rtc.dataChannels[id] = channel;
		return channel;
	};

	rtc.addDataChannels = function() {
		if (!rtc.dataChannelSupport)
			return;

		for (var connection in rtc.peerConnections)
			rtc.createDataChannel(connection);
	};


	rtc.on('ready', function() {
		rtc.createPeerConnections(); 
		rtc.addStreams();	         
		rtc.addDataChannels();
		rtc.sendOffers();            
	});

}).call(this);
