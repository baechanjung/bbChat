var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var userNm,roomNm;
var imgSize  = 0;
var imgIndex = 0;
var imgPath  = [];

var websocketUser = {
	send: function(message) {
		rtc._socket.send(message);
	},
	recv: function(message) {
		return message;
	}
};

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


function initSocketUser() {
	
	var user = websocketUser;

	rtc.on("div_user", function() {
		var data = user.recv.apply(this, arguments);
		
		
		$("#div_remote" + data.id).html("<div style='padding-left:5px;color:white;'>"+data.user+"</div>");
		
		
		//alert(data.id);
		//alert(data.user);
	});
}

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
			addToChat(input.value ,$("#userImgPath").val());
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
			addToChat(input.value ,$("#userImgPath").val());
			input.value = "";
		}
	}, false);
	
	// receive_chat_msg ����
	rtc.on("receive_chat_msg", function() {
		var data = chat.recv.apply(this, arguments);
		addToChat(data.messages, data.img, data.id, data.color.toString(16),data.user);
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

		$("#canvasDraw").show();
		/*
		var	context = canvas.getContext("2d");
		
		var image 	= new Image();
		image.src = "/" + data.PATH;
		image.onload = function(){
			context.drawImage(image, 0,0,980,370);
		};
		*/
		$("#canvasImg" ).attr("src"  ,data.PATH);
		
		imgIndex = Number(data.IDX);
		
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
		
		$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
		
		//$("#canvasDraw").attr("width",$("#canvasDraw").attr("width"));
		
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
		 vertical : true
		,item:6
		,slideMove:6
		,enableTouch:false
		,enableDrag:false
		,verticalHeight:880
	});
}

function changeFile(o){
	
	var allowImgType = ['ppt','pptx','pdf'];

	var fileExt  = o.files[0]["name"].substring(o.files[0]["name"].lastIndexOf(".")+1);
	var imgCheck = false;
	for(var z = 0; z < allowImgType.length; z++){
		if( allowImgType[z] == fileExt.toLowerCase() ){
			imgCheck = true;
			break;
		}
	}
	if(imgCheck == false){
		alert("현재 ppt,pptx,pdf 파일만 가능 합니다.");
		return;
	}
	
	showLoding();

	websocketConvert.send(JSON.stringify({
		"eventName" : "show_Loding",
		"data" : {
			"ROOM"       : roomNm
		}
	}));
	
	var fd  = new FormData();
	var xhr = new XMLHttpRequest();
	fd.append('uploadingFile', o.files[0]);

	xhr.open("POST","/fileconvert");
	
	xhr.send(fd);
	
	xhr.onreadystatechange = function(){

		hideLoding();
		
		websocketConvert.send(JSON.stringify({
			"eventName" : "hide_Loding",
			"data" : {
				"ROOM"       : roomNm
			}
		}));
		
		if(xhr.readyState == 4 && xhr.status == 200){
			//console.log(xhr.responseText);
			var jsonObj = JSON.parse(xhr.responseText);

			if(jsonObj["RES_CD"] == "0000"){
				
				if( jsonObj["SIZE"] > 0 ){

					imgListLoad(jsonObj);
					$("#canvasDraw").show();
					
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

	$("#fileShareUl").html("<ul id=\"slideList\"></ul>");
	imgPath = [];
	for(var i = 1; i < Number(jsonObj["SIZE"]) + 1 ; i++){
		
		$("#slideList").append("<li><div style=\"padding-top: 9px;text-align:center;\"><div style=\"margin-left: 11%;\" align=\"left\">"+i+"</div><img src='/file/img/"+jsonObj["FILE_NM"] +i+".gif ' 		 style=\"width: 150px;height: 100px; cursor: pointer; border:2px solid black;\"></div></li>");
		
		
		imgPath[i - 1] = "/file/img/" + jsonObj["FILE_NM"] +i+".gif ";
		
		if( i == 1){
		   	$("#canvasImg").attr("src"   ,"/file/img/" + jsonObj["FILE_NM"]+ i +".gif");
		}
		
		$("#slideList").find("li:last").data("imgIndex", i );
		$("#slideList").find("li:last").bind("click",function(){
			imgIndex = $(this).data("imgIndex") - 1;
			
			if( imgIndex  == imgSize-1){
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
		   	
		   	$("#filePage" ).find("span:eq(0)").html(imgIndex + 1);
		   	
		   	
		   	websocketConvert.send(JSON.stringify({
		   		"eventName" : "imgListClick",
		   		"data" : {
		   				"ROOM"       : roomNm
		   			,	"PATH"       : $(this).find("img").attr("src")
		   			,	"IDX"        : String(imgIndex)
		   		}
		   	}));
		   	
		});
		
		
		
	}

	
	$("#fileShareArea"  ).css("height", window.innerHeight - 60 + "px");
	//$("#mainArea"		).hide();
	$("#fileShareArea"	).show();
	subdivideVideos();
	
	
	imgSize = jsonObj["SIZE"];
	
	if($("#chatbox").is(":hidden")){
		$("#exit"	).css( "right" , "10px" );
	}else{
		$("#exit"	).css( "right" , "410px" );
	}
	
	$("#filePage"   ).find("span:eq(0)").html("1");
	$("#filePage"   ).find("span:eq(1)").html(" / " + jsonObj["SIZE"]);
	$("#next" 		).show();
	$("#filePage"   ).show();
	$("#exit" 	    ).show();

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
	
	$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
	
	$("#canvasImg" ).attr("src"   , imgPath[imgIndex] );
	$("#canvasDraw").attr("width" , $("#canvasDraw").attr("width"));
   
	websocketConvert.send(JSON.stringify({
   		"eventName" : "imgListClick",
   		"data" : {
   				"ROOM"       : roomNm
   			,	"PATH"       : imgPath[imgIndex]
			,	"IDX"        : String(imgIndex)
   		}
   	}));
	
}

function nextBtn() {
	imgIndex++;
	
	if( imgIndex == imgSize-1){
		$("#next").hide();
	}
	
	$("#pre").show();
	
	$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
	
	$("#canvasImg" ).attr("src"   , imgPath[imgIndex] );
	$("#canvasDraw").attr("width" , $("#canvasDraw").attr("width"));
   	
	websocketConvert.send(JSON.stringify({
   		"eventName" : "imgListClick",
   		"data" : {
   				"ROOM"       : roomNm
   			,	"PATH"       : imgPath[imgIndex]
			,	"IDX"        : String(imgIndex)	
   		}
   	}));
}


function showLoding(){
	document.getElementById("ProcessLayer").style.display = "block";	
	document.getElementById("ProcessBox"  ).style.display = "block";
}

function hideLoding (){
	document.getElementById("ProcessLayer").style.display = "none";	
	document.getElementById("ProcessBox"  ).style.display = "none";
}



// 배열로 변경 후 주석 해제 각각의 소켓에대한 draw 오브젝트를 가지고잇는다
var eventObject = {
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

	draw = websocketDraw;
	
	//$("#canvasDraw").css("cursor","url(/pen_cursor.png), auto");
	
	var room = roomNm;
	
//	var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
	var color = "red";

	
	/*
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
	*/
	
	$("#canvasDraw").bind('mousedown', function(e) {
		eventObject.click = true;
		var offset, type, x, y;
		type = e.handleObj.type;
		offset = $(this).offset();
		eventObject.x = e.offsetX;
		eventObject.y = e.offsetY;
		
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
		
		picture.canvas  = document.getElementById("canvasDraw");
		picture.context = picture.canvas.getContext("2d");		
		picture.context.clearRect(eventObject.x , eventObject.y , 15, 15);
		
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
			
			drawing(x, y ,color);
			
			draw.send(JSON.stringify({
				"eventName": "drawClick",
				"data": {
					"room" : room,
					'x'    : x,
					'y'    : y,
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
		
		drawing2(x, y, data.color);
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
		
		picture.canvas  = document.getElementById("canvasDraw");
		picture.context = picture.canvas.getContext("2d");		
		picture.context.clearRect(eventObject.x -3 , eventObject.y -3, 20, 20);
	});
	/*
	rtc.on('imgChange', function() {
		alert('??');
		var data = draw.recv.apply(this, arguments);
		imgChange(data.path);
	});
	*/
}

function closePT(){
	
	
	$("#fileShareArea"	).hide();
	$("#next" 			).hide();
	$("#filePage"   	).hide();
	$("#exit" 	    	).hide();
	$("#ifile"          ).val("");
	
	/*
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
	*/
	subdivideVideos();
}


function drawing(x, y, color){
	picture.canvas  = document.getElementById("canvasDraw");
	picture.context = picture.canvas.getContext("2d");
	picture.context.beginPath();
	//picture.context.moveTo(eventObject.x , eventObject.y );
	picture.context.clearRect(eventObject.x , eventObject.y , 15, 15);
	eventObject.x = x;
	eventObject.y = y;
	picture.context.fillRect(x , y , 15, 15);
	//picture.context.lineTo(x, y );
	picture.context.strokeStyle = color;
	picture.context.lineWidth = 1;
	picture.context.globalAlpha = 0.3;
	picture.context.stroke();
}
function drawing2(x, y, color){
	picture.canvas  = document.getElementById("canvasDraw");
	picture.context = picture.canvas.getContext("2d");
	picture.context.beginPath();
	picture.context.clearRect(eventObject.x -3, eventObject.y -3, 20, 20);
	eventObject.x = x;
	eventObject.y = y;
	picture.context.fillRect(x , y, 15, 15);
	picture.context.strokeStyle = color;
	picture.context.lineWidth = 10;
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
	if( $("#roomNm").val() == "" ){
		alert("잘못된 접근 경로 입니다.");
		location.href="/bizMeet/main";
		return;
	}

	if( $("#userNm").val() == "" ){
		var btnlist = [
		               {btnNm : "확인" , btnCss : "cbtn-y"  , btnFn : "confirmFn"}
		];
		
		openLayer({href: "/bbChat/view/bb_info.jsp", header : "안내" , btn : btnlist , width: 400, height: 250, target : window , frm:$("#frm") , loading : "Y"});
		
		openIframeLoad();
		return;
	}
	
	if(PeerConnection) {
		//미디어 스트림 생성
		rtc.createStream({
			"video": true,
			"audio": false
		}, function(stream) {
			var newDiv = document.createElement("div");
			document.getElementById('you').src = URL.createObjectURL(stream);
			newDiv.id     = "div_remoteyou";
			document.getElementById('mainArea').appendChild(newDiv);
			
			$("#div_remoteyou").attr("style"  ,"position:absolute;top:0;width:100%;height:100%;border: 1px solid rgba(84, 76, 76, 0.5);" );
			
			
			videos.push(document.getElementById('you'));
			
			roomNm    = decodeURI($("#roomNm").val());
			userNm    = decodeURI($("#userNm").val());
			
			rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], roomNm, userNm , $("#userImgPath").val() , $("#joinGb").val()); // 시스널주소

			rtc.on('add remote stream', function(stream, socketId) {
				console.log("ADDING REMOTE STREAM...");
				var clone = cloneVideo('you', socketId);	
				document.getElementById(clone.id).setAttribute("class", "");
				rtc.attachStream(stream, clone.id);  
				subdivideVideos();
				
				websocketUser.send(JSON.stringify({
					"eventName": "get_div_user",
					"data": {
						"id"    : socketId,
					}
				}));
				
			});

			rtc.on('disconnect stream', function(data) {
				console.log('remove ' + data);
				removeVideo(data);
				subdivideVideos();
			});
			
			initChat();        	// 채팅 설정
			initDraw();      	// canvas 설정
			subdivideVideos(); 	// 비디오 크기 설정 
			initFileConvert(); 	// 파일 변환 설정
			initSocketUser(); 	
			
		});
		
	} else {
		alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
	}

	
}

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
	var right   = 10;
	var chatChk = true;
	if( $("#fileShareArea").is(":hidden")){
		for(var i = 0, len = videos.length; i < len; i++) {
			var video   = videos[i];
			var visible = "";
			if( !$("#chatbox").is(":hidden") && chatChk){
				right   = 400;
				chatChk = false;
			}
			if( i > 1){
				right += 160;
			}
			if( $(video).attr("id") != "you" ){
				var divId = "div_"+$(video).attr("id");
				
				if($(video).is(":hidden")){
					visible = "none;";
				}else{
					visible = "block;";
				}
				$(video		).attr("width"  ,"150px;" );
				$(video		).attr("style"  ,"position:absolute;bottom:-10px;right:"+right+"px;display:"+visible );
				$("#"+divId	).attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);" );
			}else if( $(video).attr("id") == "you" ){
				$(video).attr("style"  ,"width: 100%; height: 100%;" );
				$("#div_remoteyou").attr("style"  ,"position:absolute;top:0;width:100%;height:100%;border: 1px solid rgba(84, 76, 76, 0.5);" );
			}
		}
	}else{
		for(var i = 0, len = videos.length; i < len; i++) {
			var video   = videos[i];
			var visible = "";
			if( !$("#chatbox").is(":hidden") && chatChk){
				right   = 410;
				chatChk = false;
			}
			
			if( i > 0){
				right += 160;
			}
			
			if($(video).is(":hidden")){
				visible = "none;";
			}else{
				visible = "block;";
			}
			
			$(video).attr("width"   ,"150px;" );
			$(video).attr("height"  ,"150px;" );
			$(video).attr("style"  ,"position:absolute;bottom:-10px;right:"+right+"px;display:"+visible );
			
			if( $(video).attr("id") != "you" ){
				var divId = "div_"+$(video).attr("id");
				$("#"+divId	).attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);" );
			}else{
				$("#div_remoteyou").attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);" );
			}
			
		
		}
		
	}
	
	if( $("#canvasDraw").is(":visible")){
		$("#canvasDraw"  ).attr("width" 	,	$("#canvasImg").width() );
		$("#canvasDraw"  ).attr("height"	,	$("#canvasImg").height());
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
	var newDiv    = document.createElement("div");
	var video     = document.getElementById(domId);
	var clone     = video.cloneNode(false);
	clone.id      = "remote" + socketId;
	clone.width   = "150";
	clone.height  = "150";
	newDiv.id     = "div_remote" + socketId;
	newDiv.width  = "150";
	newDiv.height = "150";
//	document.getElementById('videos').appendChild(clone);
	document.getElementById('mainArea').appendChild(clone);
	document.getElementById('mainArea').appendChild(newDiv);
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

function addToChat(msg, img, id, color, user) {
	var messages = document.getElementById('messages');
	msg = sanitize(msg);
	// �޼��� �� ������
	var msgTag = "";
	if( !(color == "ENTER" || color == "EXIT") ){
		
		if(color) { // 다른사람꺼
		//	msg = '<span style="color: ' + color + '; padding-left: 15px">' + user + '>>' + msg + '</span>';
	        msgTag += "<li class=\"left clearfix\">                                                         	        	    ";
		    msgTag += "    <span class=\"chat-img pull-left\">                                                  		        ";
		    if(img != "" || img != null){
		    	msgTag += "        <img src='"+img+"' alt=\"User Avatar\" class=\"img-circle\" style='width:50px;height:50px;'/>";
		    }else{
		    	msgTag += "        <img src=\"/bbChat/img/icon/person_you.png\" alt=\"User Avatar\" class=\"img-circle\" />   ";
		    }
		    msgTag += "    </span>                                                                                    		    ";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           	    ";
		    msgTag += "        <div>                                                                   							";
		    msgTag += "            <strong style=\"color:white;\" class=\"primary-font\">"+user+"</strong>                      ";
		    msgTag += "			   <small class=\"pull-right text-muted\">														";
		    msgTag += "			   <i class=\"fa fa-clock-o fa-fw\"></i> " +getToDay()+ " 										";
		    msgTag += " 		   </small>																						";
		    msgTag += "        </div>                                                                                 			";
		    msgTag += "        <p style=\"color:white;\">                                                                       ";
		    msgTag += "            "+ msg+"                                                         							";
		    msgTag += "        </p>                                                                                   			";
		    msgTag += "    </div>                                                                                     			";
	        msgTag += "</li>                                                                                          			";
	        
	        if($("#chatbox").is(":hidden")){
	        	var offset    = $("#remote"+id).offset();
	        	var currTime  = new Date().getTime();
	        	var tempId    = id + "_" + rand();
	        	
	        	$("body"			).append("<div id='bubble"+tempId+"' class=\"bubble_box\" style=\"width:200px; position: absolute;\">"+msg+"</div>");
	        	$("#bubble"+tempId	).css("top"    , (offset.top  - 40) +"px");
	        	$("#bubble"+tempId	).css("left"   , (offset.left - 80) +"px");
	        	
	        	
	        	setTimeout(function(){
	        		removeBubbleFn("bubble"+tempId);
	        	}, 1500);//1.5초 후에 사라짐
	        	
	        }
	        
		} else { // 내꺼 
		//	msg = '<strong style="padding-left: 15px">' + userNm + '>>'  + msg + '</strong>';
	        msgTag += "<li class=\"right clearfix\">                                                                    		";
		    msgTag += "    <span class=\"chat-img pull-right\">                                                         		";
		    if(img != "" || img != null){
		    	msgTag += "        <img src='"+img+"' alt=\"User Avatar\" class=\"img-circle\" style='width:50px;height:50px;'/>";
		    }else{
		    	msgTag += "        <img src=\"/bbChat/img/icon/person_me.png\" alt=\"User Avatar\" class=\"img-circle\" />   ";
		    }
		    msgTag += "    </span>                                                                                    			";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           		";
		    msgTag += "        <div>                                                                   							";
		    msgTag += "		   <small class=\"text-muted\"> 																	";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>									";
		    msgTag += "            <strong style=\"color:white;\" class=\"pull-right primary-font\">"+userNm+"</strong>         ";
		    msgTag += "        </div>                                                                                 			";
		    msgTag += "        <p style=\"color:white;\">                                                                       ";
		    msgTag += "            "+ msg+"                                                         							";
		    msgTag += "        </p>                                                                                   			";
		    msgTag += "    </div>                                                                                     			";
	        msgTag += "</li>                                                                                          			";
		}
	}else{
		if(color == "ENTER"){
	        msgTag += "<li class=\"right clearfix\">                                                                    		";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           		";
		    msgTag += "        <div>                                                                   							";
		    msgTag += "		   <small class=\"text-muted\"> 																	";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>									";
		    msgTag += "        </div>                                                                                 			";
		    msgTag += "        <p style=\"color:white;\">                                                                       ";
		    msgTag += "            "+ msg+"                                                         							";
		    msgTag += "        </p>                                                                                   			";
		    msgTag += "    </div>                                                                                     			";
	        msgTag += "</li>                                                                                          			";
		}else if(color == "EXIT"){
	        msgTag += "<li class=\"right clearfix\">                                                                    		";
		    msgTag += "    <div class=\"chat-body clearfix\">                                                           		";
		    msgTag += "        <div>                                                                   							";
		    msgTag += "		   <small class=\"text-muted\"> 																	";
		    msgTag += "        <i class=\"fa fa-clock-o fa-fw\"></i> "+ getToDay() +"</small>									";
		    msgTag += "        </div>                                                                                 			";
		    msgTag += "        <p style=\"color:white;\">                                                                       ";
		    msgTag += "            "+ msg+"                                                        	 							";
		    msgTag += "        </p>                                                                                   			";
		    msgTag += "    </div>                                                                                     			";
	        msgTag += "</li>                                                                                          			";
		}
	}
	
	// ä��â�� �ֱ�
	messages.innerHTML = messages.innerHTML + msgTag;
	messages.scrollTop = 10000;
}

function removeBubbleFn(id)
{
	$("#"+id).remove();
}

function rand(){
	var text = "";
	var possible = "0123456789";
	for (var i = 0; i < 3; i++)
		text += possible.charAt(Math.floor(Math.random()* possible.length));
	return text;
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
	 
	return String(hour>9?hour:'0'+hour)+":"+String(min>9?min:'0'+min)+":"+String(sec>9?sec:'0'+sec);
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


