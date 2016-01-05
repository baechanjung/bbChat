var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var userNm,roomNm;
var imgSize  = 0;
var imgIndex = 0;
var imgPath  = [];

var websocketChat = {
	send: function(message) {
		rtc._socket.send(message);
	},
	recv: function(message) {
		return message;
	},
	event: 'receive_chat_msg'
};

var websocketDraw = {
	send: function(message) {
		rtc._socket.send(message);
	},
	recv: function(message) {
		return message;
	}
};

var dataChannelChat = {
	send: function(message) {
		for(var connection in rtc.dataChannels) {
			var channel = rtc.dataChannels[connection];
			channel.send(message);
		}
	},
	recv: function(channel, message) {
		return JSON.parse(message).data;
	},
	event: 'data stream data'
};

var websocketConvert = {
		send: function(message) {
			rtc._socket.send(message);
		},
		recv: function(message) {
			return message;
		}
	};

function initChat() {
	
	var chat;
	if(rtc.dataChannelSupport) {
		console.log('initializing data channel chat');
		chat = dataChannelChat;
	} else {
		console.log('initializing websocket chat');
		chat = websocketChat;
	}

	var input = document.getElementById("chatinput");
	var btn   = document.getElementById("btn-chat" );
	//var room = window.location.hash.slice(1);
	var room = roomNm;
	var user = userNm;
	var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

	input.addEventListener('keydown', function(event) {
		var key = event.which || event.keyCode;
		if(key === 13 && input.value != "") {
			chat.send(JSON.stringify({
				"eventName": "chat_msg",
				"data": {
					"messages": input.value,
					"room"    : room,
					"user"    : user,
					"color"   : color
				}
			}));
			addToChat(input.value);
			input.value = "";
		}
	}, false);
	
	btn.addEventListener('click', function(event) {
		if( input.value != "" ) {
			chat.send(JSON.stringify({
				"eventName": "chat_msg",
				"data": {
					"messages": input.value,
					"room"    : room,
					"user"    : user,
					"color"   : color
				}
			}));
			addToChat(input.value);
			input.value = "";
		}
	}, false);
	
	// receive_chat_msg ����
	rtc.on(chat.event, function() {
		var data = chat.recv.apply(this, arguments);
		addToChat(data.messages, data.color.toString(16),data.user);
	});
	
}

function initFileConvert(){
	
	var convert = websocketConvert;

	rtc.on("imgList",function(){
		var data = convert.recv.apply(this, arguments);
		imgListLoad(data);
	});

	rtc.on("imgChange",function(){
		var data    = convert.recv.apply(this, arguments);
		var canvas  = document.getElementById("canvasDraw");
		var	context = canvas.getContext("2d");
		
		$("#canvasDraw").show();
		/*
		var image 	= new Image();
		image.src = "/" + data.PATH;
		image.onload = function(){
			context.drawImage(image, 0,0,980,370);
		};
		*/
		$("#canvasImg" ).attr("src"  ,data.PATH);
		$("#canvasDraw").attr("width",$("#canvasDraw").attr("width"));
		
	});

	rtc.on("showLoding",function(){
		showLoding();
	});

	rtc.on("hideLoding",function(){
		hideLoding();
	});
	
	rtc.on('closePT', function() {
		closePT();
	});
	
}

function initSlide(size){
	$("#slideList").lightSlider({
		vertical:true
		,item:6
		,slideMove:6
		,enableTouch:false
		,enableDrag:false
	});
}

function changeFile(o){
	var allowImgType = ['ppt'];

	var fileExt  = o.files[0]["name"].substring(o.files[0]["name"].lastIndexOf(".")+1);
	var imgCheck = false;
	for(var z = 0; z < allowImgType.length; z++){
		if( allowImgType[z] == fileExt.toLowerCase() ){
			imgCheck = true;
			break;
		}
	}
	if(imgCheck == false){
		alert("현재 ppt 파일 업로드만 가능 합니다.");
		return;
	}

	showLoding();

	
	websocketConvert.send(JSON.stringify({
		"eventName" : "showLoding",
		"data" : {
			"ROOM"       : roomNm
		}
	}));
	
	var fd  = new FormData();
	var xhr = new XMLHttpRequest();
	fd.append('uploadingFile', o.files[0]          );

	xhr.open("POST","/fileconvert");
	
	xhr.send(fd);
	
	xhr.onreadystatechange = function(){

		hideLoding();
		
		websocketConvert.send(JSON.stringify({
			"eventName" : "hideLoding",
			"data" : {
				"ROOM"       : roomNm
			}
		}));
		
		if(xhr.readyState == 4 && xhr.status == 200){
			//console.log(xhr.responseText);
			var jsonObj = JSON.parse(xhr.responseText);
			console.log(jsonObj);

			if(jsonObj["RES_CD"] == "0000"){
				
				if( jsonObj["SIZE"] > 0 ){

					imgListLoad(jsonObj);
					
					websocketConvert.send(JSON.stringify({
						"eventName" : "fileConvertSend",
						"data" : {
							"ROOM"       : roomNm
						  ,	"SIZE"       : jsonObj["SIZE"]
						  ,	"FILE_NM"    : jsonObj["FILE_NM"]
						}
					}));
					
				}
			}

		}
	};

}

function imgListLoad( jsonObj ){
	$("#menu-toc").find("center").html("<ul id=\"slideList\"></ul>");
	imgPath = [];
	for(var i = 0; i < jsonObj["SIZE"] ; i++){
		$("#slideList").append("<li><img style='height: 100px;width: 150px' src='/"+jsonObj["FILE_NM"]+"_"+i+".jpg ' /></li>");
		
		imgPath[i] = jsonObj["FILE_NM"]+"_"+i+".jpg ";
		
		if( i == 0){
			var mainW = window.innerWidth  - 470;
			var mainH = window.innerHeight - 310;
			$("#canvasDraw"    ).show();
			//initDraw();
		   	$("#canvasImg").attr("src"   ,"/" + jsonObj["FILE_NM"]+"_0.jpg");
		   	$("#canvasImg").show();
		   	$("#share-screen").hide();
		   	//$("#you"      ).hide();
		   	$("#userListArea").show();
		   	subdivideVideos();
		   	moveVideos();
		}
		$("#slideList").find("li:last").data("imgIndex", i );
		$("#slideList").find("li:last").bind("click",function(){
			imgIndex = $(this).data("imgIndex");
			
			if( imgIndex == imgSize-1){
				$("#pre" ).show();
				$("#next").hide();
			}else if( imgIndex == 0 ){
				$("#pre" ).hide();
				$("#next").show();
			}else{
				$("#pre" ).show();
				$("#next").show();
			}
			
		   	$("#canvasImg").attr("src"   , $(this).find("img").attr("src") );
		   	
		   	websocketConvert.send(JSON.stringify({
		   		"eventName" : "imgListClick",
		   		"data" : {
		   				"ROOM"       : roomNm
		   			,	"PATH"       : $(this).find("img").attr("src")
		   		}
		   	}));
		});
		
		
		
	}
	
	imgSize = jsonObj["SIZE"];
	$("#next" ).show();
	$("#exit" ).show();
	initSlide( jsonObj["SIZE"] );
}



function preBtn() {
	
	imgIndex--;
	
	if( imgIndex < imgSize){
		$("#next").show();
	}
	
	if( imgIndex == 0 ){
		$("#pre").hide();
	}
	
	$("#canvasImg" ).attr("src"   , imgPath[imgIndex] );
	$("#canvasDraw").attr("width" , $("#canvasDraw").attr("width"));
   	websocketConvert.send(JSON.stringify({
   		"eventName" : "imgListClick",
   		"data" : {
   				"ROOM"       : roomNm
   			,	"PATH"       : imgPath[imgIndex]
   		}
   	}));
	
}

function nextBtn() {
	
	imgIndex++;
	
	if( imgIndex == imgSize-1){
		$("#next").hide();
	}
	
	$("#pre").show();
	
	$("#canvasImg" ).attr("src"   , imgPath[imgIndex] );
	$("#canvasDraw").attr("width" , $("#canvasDraw").attr("width"));
   	websocketConvert.send(JSON.stringify({
   		"eventName" : "imgListClick",
   		"data" : {
   				"ROOM"       : roomNm
   			,	"PATH"       : imgPath[imgIndex]
   		}
   	}));
	
}


function showLoding(){
	var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
	var scrollTop  = document.body.scrollTop  || document.documentElement.scrollTop;
	var left = (scrollLeft + (document.documentElement.clientWidth  - 400) / 2);
	var top  = ((scrollTop  + (document.documentElement.clientHeight - 300) / 2)-150);
	if(document.body.scrollHeight < document.documentElement.clientHeight){
		document.getElementById("ProcessLayer"        ).style.height  = document.documentElement.clientHeight+"px";	
	}else{
		document.getElementById("ProcessLayer"        ).style.height  = document.body.scrollHeight+"px";
	}
	document.getElementById("ProcessLayer").style.width   = document.body.clientWidth +"px";
	document.getElementById("ProcessLayer").style.display = "block";	
	document.getElementById("ProcessBox"  ).style.display = "block";
//	document.getElementById("ProcessBox"  ).style.top     = top+"px";
	document.getElementById("ProcessBox"  ).style.left    = left+"px";
}

function hideLoding (){
	document.getElementById("ProcessLayer").style.display = "none";	
	document.getElementById("ProcessBox"  ).style.display = "none";
}



// 배열로 변경 후 주석 해제 각각의 소켓에대한 draw 오브젝트를 가지고잇는다
var eventObject = {
		mode  : 0,
		click : false,
		x     : 0,
		y     : 0
};
var picture = {
		canvas  : null,
		context : null
};


function initDraw() {
	var draw;
	console.log('initializing websocket draw');
	draw = websocketDraw;
	
	$("#canvasDraw").css("cursor","url(/pen_cursor.png), auto");
	
	//var input = document.getElementById("canvasDraw");
	//var room  = window.location.hash.slice(1);
	var room = roomNm;
	var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

	
	$("#canvasDraw").bind('contextmenu', function(e) {
		if( eventObject.mode == "0" ){
			alert('지우개 모드!!');
			$("#canvasDraw").css("cursor","url(/Cursor_Eraser.png), auto");
			eventObject.mode = "1";
			return false;
		}else{
			alert('지우개 해제!!');
			$("#canvasDraw").css("cursor","url(/pen_cursor.png), auto");
			eventObject.mode = "0";
			return false;
		}
		
	});
	
	$("#canvasDraw").bind('mousedown', function(e) {
		eventObject.click = true;
		var offset, type, x, y;
		type = e.handleObj.type;
		offset = $(this).offset();
		eventObject.x = e.offsetX;// - offset.left;
		eventObject.y = e.offsetY;// - offset.top;
		
		draw.send(JSON.stringify({
			"eventName": "mousedown",
			"data": {
				"room": room,
				'x'   : eventObject.x,
				'y'   : eventObject.y,
				'sendX': $("#canvasDraw"   ).attr ("width" ).replace("px",""),
				'sendY': $("#canvasDraw"   ).attr ("height").replace("px",""),
				'click': true
			}
		}));
		
	});
	$("#canvasDraw").bind('mouseup'  , function(e) {
		eventObject.click = false;
		
		draw.send(JSON.stringify({
			"eventName": "mouseup",
			"data": {
				"room": room,
				"click": false
			}
		}));
	});
	$("#canvasDraw").bind('mousemove', function(e) {
		if (eventObject.click) {
			var offset, type, x, y;
			type = e.handleObj.type;
			offset = $(this).offset();
			x = e.offsetX;// - offset.left;
			y = e.offsetY;// - offset.top;
			
			if( eventObject.mode == "1" ){
				cleardrawing(x,y);
			}else{
				drawing(x, y ,color);
			}
			
			draw.send(JSON.stringify({
				"eventName": "drawClick",
				"data": {
					"room" : room,
					'x'    : x,
					'y'    : y,
					'mode' : eventObject.mode,
					'color': color,
					'sendX': $("#canvasDraw"   ).attr ("width" ).replace("px",""),
					'sendY': $("#canvasDraw"   ).attr ("height").replace("px","")
				}
			}));
		}
	});
	
	rtc.on('draw', function() {
		
		var data  = draw.recv.apply(this, arguments);
		var x     = data.x;
		var y     = data.y;
		var sX    = data.sendX;
		var sY    = data.sendY;
		var oX    = $("#canvasDraw"   ).attr ("width" ).replace("px","");
		var oY    = $("#canvasDraw"   ).attr ("height").replace("px","");
		x = x * ( oX / sX );
		y = y * ( oY / sY );
		
		if(data.mode == "1"){
			cleardrawing(x,y);
		}else{
			drawing(x, y, data.color);
		}
	});
	
	rtc.on('mDown', function() {
		var data = draw.recv.apply(this, arguments);
		var x    = data.x;
		var y    = data.y;
		var sX   = data.sendX;
		var sY   = data.sendY;
		var oX   = $("#canvasDraw"   ).attr ("width" ).replace("px","");
		var oY   = $("#canvasDraw"   ).attr ("height").replace("px","");
		x = x * ( oX / sX );
		y = y * ( oY / sY );
		eventObject.click = data.click;
		eventObject.x     = x;
		eventObject.y     = y;
	});
	
	rtc.on('mUp', function() {
		var data = draw.recv.apply(this, arguments);
		eventObject.click = data.click;
	});
	/*
	rtc.on('imgChange', function() {
		alert('???');
		var data = draw.recv.apply(this, arguments);
		imgChange(data.path);
	});
	*/
}

function closePT(){
	$("#exit"	  	 ).hide();
	$("#pre" 	  	 ).hide();
	$("#next"	  	 ).hide();
	$("#canvasImg"	 ).hide();
	$("#userListArea").hide();
	$("#canvasDraw"  ).hide();
	$("#ifile"       ).val("");
	$("#share-screen").show();
	$("#screen-share-video").remove();
	$("#menu-toc" 	 ).find("center").html("<ul id=\"slideList\"></ul>");
	$("#mainArea" 	 ).find("video").show();
	subdivideVideos();
}


function drawing(x, y, color){
	picture.canvas  = document.getElementById("canvasDraw");
	picture.context = picture.canvas.getContext("2d");
	picture.context.beginPath();
	picture.context.moveTo(eventObject.x , eventObject.y );
	eventObject.x = x;
	eventObject.y = y;
	picture.context.lineTo(x, y );
	picture.context.strokeStyle = color;
	picture.context.lineWidth = 5;
	picture.context.globalAlpha = 0.3;
	picture.context.stroke();
}

function cleardrawing(x, y){
	picture.canvas  = document.getElementById("canvasDraw");
	picture.context = picture.canvas.getContext("2d");
//	picture.context.beginPath();
	picture.context.clearRect(eventObject.x , eventObject.y , 15, 15);
	eventObject.x = x;
	eventObject.y = y;
//	picture.context.stroke();
}

function imgChange(path){
	var canvas  = document.getElementById("canvasDraw");
	var	context = canvas.getContext("2d");
   	context.beginPath();
   	var image 	= new Image();
   	image.src = "/" + path;
   	image.onload = function(){
   		context.drawImage(image, 0,0,300,300);
   	};
}

function init() {
	if(PeerConnection) {
		//미디어 스트림 생성
		rtc.createStream({
			"video": true,
			"audio": false
		}, function(stream) {
			document.getElementById('you').src = URL.createObjectURL(stream);
			videos.push(document.getElementById('you'));
			
			var request = new Request();
			/*
			roomNm    = request.getParameter('roomNm');
			userNm    = request.getParameter('userNm');
			*/
			roomNm = document.getElementById('roomNm').value;
			userNm = document.getElementById('userNm').value;
			
			rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], roomNm, userNm); // 시스널주소

			rtc.on('add remote stream', function(stream, socketId) {
				console.log("ADDING REMOTE STREAM...");
				var clone = cloneVideo('you', socketId);	
				document.getElementById(clone.id).setAttribute("class", "");
				rtc.attachStream(stream, clone.id);  
				subdivideVideos();
			});

			rtc.on('disconnect stream', function(data) {
				console.log('remove ' + data);
				removeVideo(data);
				subdivideVideos();
			});
			
			initChat();        // 채팅 설정
//			initDraw();      // canvas 설정
//			Page.init();       // 슬라이드 설정
			subdivideVideos(); // 비디오 크기 설정 
//			initFileConvert(); // 파일 변환 설정
			
			
			subdivideVideos();
		});
		
	} else {
		alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
	}

	
}

window.onresize = function(event) {
	subdivideVideos();
	moveVideos();
};


function getNumPerRow() {
	var len = videos.length;
	var biggest;

	// Ensure length is even for better division.
	if(len % 2 === 1) {
		len++;
	}

	biggest = Math.ceil(Math.sqrt(len));
	while(len % biggest !== 0) {
		biggest++;
	}
	return biggest;
}

function subdivideVideos() {
	var mainW = window.innerWidth;
	var mainH = window.innerHeight - $(".navbar").height();
	var userW = mainW;
	var msgH  = mainH;
	if($("#presentaionCnotainer").attr("class").indexOf("slideRight") > -1 ){
		mainW = mainW - 240;
		userW = userW - 240;
	}
	if($("#userListArea").is(":visible") ){
		mainH = mainH - 200;
	}
	if($("#chatbox").is(":visible") ){
		mainW = mainW - 400;
		userW = userW - 420;
	}

	$("#userListArea").css("width"  ,userW - 50 );
	/*
	$("#mainArea"    ).css("width"  ,mainW);
	$("#mainArea"    ).css("height" ,mainH);
	$("#you"		 ).attr("width" ,mainW - 50 );
	$("#you"		 ).attr("height",mainH - 50 );
	
	
	$("#messages"    ).css("height" ,msgH  - 150);
	
   	*/
	$("#canvasImg"   ).css ("width" ,mainW - 50);
	$("#canvasImg"   ).css ("height",mainH - 50);
	$("#canvasDraw"  ).attr("width" ,mainW - 50);
	$("#canvasDraw"  ).attr("height",mainH - 50);

	$("#messages"    ).css ("height",mainH - 110);

	if( !$("#userListArea").is(":visible")){
		switch (videos.length) {
		case 1:
			$("#you"		 ).attr("width" ,mainW - 90 );
			$("#you"		 ).attr("height",mainH - 90 );
			$("#you"		 ).attr("style"  ,"position:absolute;top:"+($(".navbar").height()+10)+"px;left:10px;" );
			break;
		case 2:
			/*
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( $(video).attr("id") == "you" ){
					$("#you"		 ).attr("width" ,"200" );
					$("#you"		 ).attr("height","200" );
					$("#you"		 ).attr("style","position:absolute;top:"+(mainH-184)+"px;left:"+(mainW-245)+"px;" );
				}else{
					$(video).attr("width"  ,"90%" );
					$(video).attr("height" ,"" );
					$(video).attr("style"  ,"position:absolute;" );
				}
			}
			*/
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( mainW / 2 > 480){
					$(video).attr("width"  ,mainW / 2 + "px");
					$(video).attr("height" ,"" );
					$(video).attr("style"  ,"position:absolute;left:"+(i*mainW*0.5)+"px;top:"+mainH*0.2+"px;" );
				}else{
					$(video).attr("width"  ,"" );
					$(video).attr("height" ,mainH / 2 +"px" );
					$(video).attr("style"  ,"position:absolute;top:"+(i*mainH*0.5+$(".navbar").height())+"px;left:"+(mainW*0.15)+"px;" );
				}
			}
			break;
		case 3:
			/*
			var z = 0;
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( $(video).attr("id") == "you" ){
					$("#you"		 ).attr("width" ,"200" );
					$("#you"		 ).attr("height","200" );
					$("#you"		 ).attr("style","position:absolute;top:"+(mainH - 184)+"px;left:"+(mainW-245)+"px;" );
				}else{
					$(video).attr("width"  ,"50%" );
					$(video).attr("height" ,"" );
					$(video).attr("style"  ,"position:absolute;" );
					video.style.left = z * mainW / 2 + "px";
					video.style.top  = mainH * 0.1 + "px";
					z++;
				}
			}
			*/
			var w = 0;
			var h = 0;
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( i == 2){
					w = 2;
					h = 1;
				}
				$(video).attr("width"  ,mainW / 2 + "px");
				$(video).attr("height" ,mainH / 2 + "px" );
				$(video).attr("style"  ,"position:absolute;left:"+((i-w)*mainW*0.5)+"px;top:"+(h*mainH*0.5+$(".navbar").height())+"px;" );
			}
			break;
		case 4:
			/*
			var w = 0;
			var h = 1;
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( $(video).attr("id") == "you" ){
					$("#you"		 ).attr("width" ,"200" );
					$("#you"		 ).attr("height","200" );
					$("#you"		 ).attr("style","position:absolute;top:"+(mainH - 184)+"px;left:"+(mainW-245)+"px;" );
				}else{
					$(video).attr("width"  ,"" );
					$(video).attr("height" ,"45%" );
					$(video).attr("style"  ,"position:absolute;" );
					if( w < 2){
						video.style.left = (w * mainW / 2 + mainW * 0.1)  + "px";
						video.style.top  = "60px";
						w++;
					}else{
						w = 0;
						h++;
						video.style.left = (w * mainW / 2 + mainW * 0.1)   + "px";
						video.style.top  = (mainH / 2 + 30) + "px";
					}
				}
			}
			*/
			
			var w = 0;
			var h = 0;
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( i == 2){
					w = 2;
					h = 1;
				}
				$(video).attr("width"  ,mainW / 2 + "px");
				$(video).attr("height" ,mainH / 2 + "px" );
				$(video).attr("style"  ,"position:absolute;left:"+((i-w)*mainW*0.5)+"px;top:"+(h*mainH*0.5+$(".navbar").height())+"px;" );
			}
			
			break;
		case 5:
			var w = 0;
			var h = 0;
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				if( $(video).attr("id") == "you" ){
					$("#you"		 ).attr("width" ,"200" );
					$("#you"		 ).attr("height","200" );
					$("#you"		 ).attr("style","position:absolute;top:"+(mainH - 184)+"px;left:"+(mainW-245)+"px;" );
				}else{
					$(video).attr("width"  ,"32%" );
					$(video).attr("height" ,"" );
					$(video).attr("style"  ,"position:absolute;" );
					if( w < 2){
					}else{
						w = 0;
						h = 1;
					}
					video.style.left = ( mainW * 0.36 / 2 ) + ( mainW * 0.36 * w )  + "px";
					video.style.top  = ( mainH / 2 * h ) + 60 + "px";
					w++;
				}
			}
			
			break;
	}
	}
	
	
	
}

function moveVideos(){
	if( $("#userListArea").is(":visible")){
		var offset = $("#userListArea").offset();
		for(var i = 0, len = videos.length; i < len; i++) {
			var video = videos[i];
			$(video).css("top"    , (offset.top  + 70) +"px");
			$(video).css("left"   , (offset.left + 10 + (i*200)) +"px");
			$(video).attr("width"  , "180");
			$(video).attr("height"  ,""   );
		}
	}

}

function cloneVideo(domId, socketId) {
	var video = document.getElementById(domId);
	var clone = video.cloneNode(false);
	clone.id = "remote" + socketId;
	clone.width  = "150";
	clone.height = "150";
//	document.getElementById('videos').appendChild(clone);
	document.getElementById('mainArea').appendChild(clone);
//	$("#userListArea").find(".panel-body").append(clone);
	videos.push(clone); 
	return clone;
}

function removeVideo(socketId) { 
	var video = document.getElementById('remote' + socketId);
	if(video) {
		videos.splice(videos.indexOf(video), 1);
		video.parentNode.removeChild(video);
	}
}

function addToChat(msg, color, user) {
	var messages = document.getElementById('messages');
	msg = sanitize(msg);
	// �޼��� �� ������
	var msgTag = "";
	if( !(color == "ENTER" || color == "EXIT") ){
		
		if(color) { // 다른사람꺼
		//	msg = '<span style="color: ' + color + '; padding-left: 15px">' + user + '>>' + msg + '</span>';
	        msgTag += "<li class=\"left clearfix\">                                                                    ";
		    msgTag += "    <span class=\"chat-img pull-left\">                                                         ";
		    msgTag += "        <img src=\"http://placehold.it/50/55C1E7/fff\" alt=\"User Avatar\" class=\"img-circle\" />   ";
		    msgTag += "    </span>                                                                                    ";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           ";
		    msgTag += "        <div class=\"header\">                                                                   ";
		    msgTag += "            <strong class=\"primary-font\">"+user+"</strong>                     ";
		    msgTag += "			   <small class=\"pull-right text-muted\">								";
		    msgTag += "			   <i class=\"fa fa-clock-o fa-fw\"></i> " +getToDay()+ " 					";
		    msgTag += " 		   </small>																";
		    msgTag += "        </div>                                                                                 ";
		    msgTag += "        <p>                                                                                    ";
		    msgTag += "            "+ msg+"                                                         ";
		    msgTag += "        </p>                                                                                   ";
		    msgTag += "    </div>                                                                                     ";
	        msgTag += "</li>                                                                                          ";
		} else { // 내꺼 
		//	msg = '<strong style="padding-left: 15px">' + userNm + '>>'  + msg + '</strong>';
	        msgTag += "<li class=\"right clearfix\">                                                                    ";
		    msgTag += "    <span class=\"chat-img pull-right\">                                                         ";
		    msgTag += "        <img src=\"http://placehold.it/50/FA6F57/fff\" alt=\"User Avatar\" class=\"img-circle\" />   ";
		    msgTag += "    </span>                                                                                    ";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           ";
		    msgTag += "        <div class=\"header\">                                                                   ";
		    msgTag += "		   <small class=\"text-muted\"> ";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>";
		    msgTag += "            <strong class=\"pull-right primary-font\">"+userNm+"</strong>                     ";
		    msgTag += "        </div>                                                                                 ";
		    msgTag += "        <p>                                                                                    ";
		    msgTag += "            "+ msg+"                                                         ";
		    msgTag += "        </p>                                                                                   ";
		    msgTag += "    </div>                                                                                     ";
	        msgTag += "</li>                                                                                          ";
		}
	}else{
		if(color == "ENTER"){
	        msgTag += "<li class=\"right clearfix\">                                                                    ";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           ";
		    msgTag += "        <div class=\"header\">                                                                   ";
		    msgTag += "		   <small class=\"text-muted\"> ";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>";
		    msgTag += "        </div>                                                                                 ";
		    msgTag += "        <p>                                                                                    ";
		    msgTag += "            "+ msg+"                                                         ";
		    msgTag += "        </p>                                                                                   ";
		    msgTag += "    </div>                                                                                     ";
	        msgTag += "</li>                                                                                          ";
		}else if(color == "EXIT"){
	        msgTag += "<li class=\"right clearfix\">                                                                    ";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           ";
		    msgTag += "        <div class=\"header\">                                                                   ";
		    msgTag += "		   <small class=\"text-muted\"> ";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>";
		    msgTag += "        </div>                                                                                 ";
		    msgTag += "        <p>                                                                                    ";
		    msgTag += "            "+ msg+"                                                         ";
		    msgTag += "        </p>                                                                                   ";
		    msgTag += "    </div>                                                                                     ";
	        msgTag += "</li>                                                                                          ";
		}
	}
	
	// ä��â�� �ֱ�
	messages.innerHTML = messages.innerHTML + msgTag;
	messages.scrollTop = 10000;
}

function getToDay (){
	var now  =new Date(); 
	var year =now.getFullYear();
	var month=now.getMonth();
	var date =now.getDate();
	var hour =now.getHours(); 
    var min  =now.getMinutes();
    var sec  =now.getSeconds();
	var m    = (month+1>9) ? month+1 : '0'+(month+1);
	var d    = (date>9) ? date : '0'+date;
	var currentDate=year+"/"+(m)+"/"+(d)+" ";//+(hour>9?hour:'0'+hour)+(min>9?min:'0'+min)+(sec>9?sec:'0'+sec);
	
	currentDate += String(hour>9?hour:'0'+hour)+":"+String(min>9?min:'0'+min)+":"+String(sec>9?sec:'0'+sec);
	 
	return currentDate;
}

function sanitize(msg) {
	return msg.replace(/</g, '&lt;');
}

var Request = function()
{
    this.getParameter = function( name )
    {
        var rtnval = '';
        var nowAddress = unescape(location.href);
        var parameters = (nowAddress.slice(nowAddress.indexOf('?')+1,nowAddress.length)).split('&');

        for(var i = 0 ; i < parameters.length ; i++)
        {
            var varName = parameters[i].split('=')[0];
            if(varName.toUpperCase() == name.toUpperCase())
            {
                rtnval = decodeURI(parameters[i].split('=')[1]);
                break;
            }
        }
        return rtnval;
    }
}


