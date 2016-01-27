var nonVideos = [];
var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var userNm,roomNm,fileOwner=false,mainView="remoteyou",supportYn="Y";
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
		$("#div_remote" + data.id).html("<div style='padding-left:5px;color:white;'>"+data.user+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon'>");
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
					"color"   : color,
					"img"	  : $("#userImgPath").val()
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
					"color"   : color,
					"img"	  : $("#userImgPath").val()
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
		var data 	 = convert.recv.apply(this, arguments);
		var appendYn = false;
		
		if(data["MODE"] == "U"){
			$(".file_box"	).find("ul").append("<li><a>"+data["ORG_FILE_NM"]+"</a></li>");
			$(".file_box"	).find("ul").find("li:last").data("FILE_LIST" , data);
			$(".file_box"	).find("ul").find("li:last").bind("click" ,function(){
				var obj = $(this).data("FILE_LIST");
				imgListLoad(obj);
				
				fileOwner = true;
				$(".filearea"			).hide();
				$("[name='shareIcon']"	).hide();
				$("#div_nonvideoyou"	).hide();
				$("#div_remoteyou"		).find("img").show();
				$("#exit"				).show();
				
				websocketConvert.send(JSON.stringify({
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
		
		imgListLoad(data);
		
		fileOwner = false;
		$("[name='shareIcon']"			).hide();
		$("#div_remoteyou"				).find("img").hide();
		$("#div_nonvideoyou"			).hide();
		$("#div_remote"+data["SHARE_ID"]).find("img").show();
		$("#exit"						).hide();
	});

	rtc.on("imgChange",function(){
		
		var data    = convert.recv.apply(this, arguments);

		$("#canvasDraw").show();
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
		
		var id 		= imgIndex + 1;
		var target  = document.getElementById("smove"+id).offsetTop;
		$('.small-list'	).animate({scrollTop:target}, 0);
		$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
		$( ".big-list" 	).scrollTop( 0 );
		
		//$("#canvasDraw").attr("width",$("#canvasDraw").attr("width"));
		
	});

	rtc.on("showLoding",function(){
		var data = convert.recv.apply(this, arguments);
		showLoding(data.user);
	});
	
	rtc.on("hideLoding",function(){
		hideLoding();
	});
	
	rtc.on("up_percentage",function(){
		var data = convert.recv.apply(this, arguments);
		upPercentage(data.per);
	});
	
	rtc.on("convert_percentage",function(){
		var data = convert.recv.apply(this, arguments);
		convertPercentage(data.totPage,data.curPage);
	});

	rtc.on("convertLoding",function(){
		convertLoding();
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
	
	$(".filearea").hide();
	
	showLoding(userNm);

	websocketConvert.send(JSON.stringify({
		"eventName" : "show_Loding",
		"data" : {
			 "ROOM"       : roomNm
			,"USER"       : userNm
		}
	}));
	
	var fd  = new FormData();
	var xhr = new XMLHttpRequest();
	
	xhr.upload.addEventListener('progress', function(e){

		if (e.lengthComputable) {
			uploaded = e.loaded;
			total    = e.total;
			var percentage = Math.round((e.loaded / e.total) * 100);
			
			
			websocketConvert.send(JSON.stringify({
				"eventName" : "up_percentage",
				"data" : {
					 "ROOM"       : roomNm
					,"PER"        : String(percentage)
				}
			}));
			
			upPercentage(percentage);
			
            if(percentage == 100){
            	convertLoding();
        		
        		websocketConvert.send(JSON.stringify({
        			"eventName" : "convert_Loding",
        			"data" : {
        				"ROOM"       : roomNm
        			}
        		}));
            }
		}				
	}, false);
	
	fd.append('ROOM'		 , roomNm	 );
	fd.append('uploadingFile', o.files[0]);

	xhr.open("POST","/fileconvert");
	
	xhr.send(fd);
	
	xhr.onreadystatechange = function(){
		
		if(xhr.readyState == 4 && xhr.status == 200){
			//console.log(xhr.responseText);
			var jsonObj = JSON.parse(xhr.responseText);

			if(jsonObj["RES_CD"] == "0000"){
				
				if( jsonObj["SIZE"] > 0 ){

					imgListLoad(jsonObj);
					
					fileOwner = true;
					$("[name='shareIcon']"	).hide();
					$("#div_nonvideoyou"	).hide();
					$("#div_remoteyou"		).find("img").show();
					$("#exit"				).show();
					
					$(".file_box"	).find("ul").append("<li><a>"+jsonObj["ORG_FILE_NM"]+"</a></li>");
					$(".file_box"	).find("ul").find("li:last").data("FILE_LIST" , jsonObj);
					$(".file_box"	).find("ul").find("li:last").bind("click" ,function(){
						var obj = $(this).data("FILE_LIST");
						imgListLoad(obj);
						
						fileOwner = true;
						$(".filearea"			).hide();
						$("[name='shareIcon']"	).hide();
						$("#div_nonvideoyou"	).hide();
						$("#div_remoteyou"		).find("img").show();
						$("#exit"				).show();
						
						websocketConvert.send(JSON.stringify({
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
					
					$("#canvasDraw"	).show();
					
					websocketConvert.send(JSON.stringify({
						"eventName" : "fileConvertSend",
						"data" : {
							"ROOM"       	: roomNm
						  ,	"SIZE"       	: jsonObj["SIZE"]
						  ,	"FILE_NM"    	: jsonObj["FILE_NM"]
						  ,	"ORG_FILE_NM"   : jsonObj["ORG_FILE_NM"]
						  ,	"MODE"   		: "U" // C : 변경 ,  U : 업로드
						}
					}));
				}
			}

		}
	};

}


function imgLoad(obj){
	var img_W = Number($(obj).css("width" ).replace("px",""));
	var img_H = Number($(obj).css("height").replace("px",""));
	var div_W = Number($(".big-list").css("width" ).replace("px",""));
	var div_H = Number($(".big-list").css("height").replace("px",""));
	var div_L = "";
	$("#canvasDraw").show();
	
	if( img_W > img_H ){
		div_W = div_W - 50;
		div_H = div_H - 20;
		$(obj).css("width" , div_W + "px");
		if( div_H >  div_W ){
			$(obj).css("height", "");
		}else{
			$(obj).css("height", div_H + "px");
		}
		$(".big-list"	 ).css("overflow-y" ,	"hidden");
		$("#canvasDraw"  ).css("left"		,	"32px");
	}else{
		div_L = Number($("#canvasImg").offset().left) - Number($(".big-list-div").offset().left);
		
		$(obj).css("height", img_H);
		$(".big-list"	 ).css("overflow-y" ,	"auto");
		$("#canvasDraw"  ).css("left",div_L+"px");
	}
	
	$("#canvasDraw"  ).attr("width" 	,	$("#canvasImg").width() );
	$("#canvasDraw"  ).attr("height"	,	$("#canvasImg").height());
}


function imgListLoad( jsonObj ){

	$("#fileShareUl").html("<ul id=\"slideList\"></ul>");
	imgPath = [];
	for(var i = 1; i < Number(jsonObj["SIZE"]) + 1 ; i++){
		
		$("#slideList").append("<li id='smove"+i+"'><div class='div-area'><div class='div-number' align='left'>"+i+"</div><img src='/file/img/"+jsonObj["FILE_NM"] +i+".gif ' ></div></li>");
		
		if( i == Number(jsonObj["SIZE"])){
			$(".big-list" ).find("ul").find("li:last").find(".big-list-div").css("padding-bottom","0px");
		}
		
		
		imgPath[i - 1] = "/file/img/" + jsonObj["FILE_NM"] +i+".gif ";
		
		
		if( i == 1){
			$("#canvasImg").attr("style" ,"");
		   	$("#canvasImg").attr("src"   ,"/file/img/" + jsonObj["FILE_NM"]+ i +".gif");
		}
		
		
		
		$("#slideList").find("li:last").data("imgIndex", i );
		$("#slideList").find("li:last").bind("click",function(){
			imgIndex 		= $(this).data("imgIndex") - 1;
			
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
			
		   	$("#canvasImg"	).attr("src"   , $(this).find("img").attr("src") );
		   	$("#filePage" 	).find("span:eq(0)").html(imgIndex + 1);
		   	$( ".big-list" 	).scrollTop( 0 );
		   	
		   	if(fileOwner){
			   	websocketConvert.send(JSON.stringify({
			   		"eventName" : "imgListClick",
			   		"data" : {
			   				"ROOM"       : roomNm
			   			,	"PATH"       : $(this).find("img").attr("src")
			   			,	"IDX"        : String(imgIndex)
			   		}
			   	}));
			}
		});
	}

	
	$("#fileShareArea"  ).css("height", window.innerHeight - 60 + "px");
	//$("#mainArea"		).hide();
	$("#fileShareArea"	).show();
	subdivideVideos();
	
	
	imgSize  = jsonObj["SIZE"];
	imgIndex = 0;
	
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

	/*
	 * 스크롤 페이지 넘김
	$(".big-list").bind("scroll",function(){
		var curTop       = Number($(this).scrollTop()); 				// 스크롤 위치
		var scrollHeight = Number($(".big-list").prop("scrollHeight"));	// 스크롤 총 길이
		
		if( (Number($(".big-list").height()) + Number(curTop)) >= (scrollHeight - 10) ){
			
			imgIndex++;
			
			if( imgIndex < imgSize){
				$("#next").show();
			}
			
			if( imgIndex == imgSize-1){
				$("#next").hide();
			}
			
			if( imgIndex == 0 ){
				$("#pre").hide();
			}else{
				$("#pre").show();
			}

			var id 		= imgIndex + 1;
			var target = document.getElementById("smove"+id).offsetTop;
			$('.small-list'	).animate({scrollTop:target}, 0);
			$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
			$("#canvasImg"	).attr("src"   , imgPath[imgIndex]	  );
			$( ".big-list" 	).scrollTop( 0 );
			if(fileOwner){
				websocketConvert.send(JSON.stringify({
					"eventName" : "imgListClick",
					"data" : {
							"ROOM"       : roomNm
						,	"PATH"       : imgPath[imgIndex]
						,	"IDX"        : String(imgIndex)
					}
				}));
			}
			
		}
		
	});
	*/
	
}



function preBtn() {
	
	imgIndex--;
	
	if( imgIndex < imgSize){
		$("#next").show();
	}
	
	if( imgIndex == 0 ){
		$("#pre").hide();
	}
	
	var id 		= imgIndex + 1;
	var target  = document.getElementById("smove"+id).offsetTop;
	$('.small-list'	).animate({scrollTop:target}, 0);
	$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
	$("#canvasImg"	).attr("src"   , imgPath[imgIndex]				 );
	$("#canvasDraw"	).attr("width" , $("#canvasDraw").attr("width")	 );
	$( ".big-list" 	).scrollTop( 0 );
	
    
	if(fileOwner){
		websocketConvert.send(JSON.stringify({
	   		"eventName" : "imgListClick",
	   		"data" : {
	   				"ROOM"       : roomNm
	   			,	"PATH"       : imgPath[imgIndex]
				,	"IDX"        : String(imgIndex)
	   		}
	   	}));
	}
	
}

function nextBtn() {
	imgIndex++;
	
	if( imgIndex == imgSize-1){
		$("#next").hide();
	}
	
	$("#pre").show();
	
	var id 		= imgIndex + 1;
	var target  = document.getElementById("smove"+id).offsetTop;
	$('.small-list'	).animate({scrollTop:target}, 0);
	$("#filePage"   ).find("span:eq(0)").html(imgIndex + 1);
	$("#canvasImg"	).attr("src"   , imgPath[imgIndex]				 );
	$("#canvasDraw"	).attr("width" , $("#canvasDraw").attr("width")	 );
	$( ".big-list" 	).scrollTop( 0 );
   	
	if(fileOwner){
		websocketConvert.send(JSON.stringify({
	   		"eventName" : "imgListClick",
	   		"data" : {
	   				"ROOM"       : roomNm
	   			,	"PATH"       : imgPath[imgIndex]
				,	"IDX"        : String(imgIndex)	
	   		}
	   	}));
	}
}


function showLoding(param){
	$(".statusmsg"	  ).find("span:eq(0)").html(param);
	$(".statuscontrol").show();
}

function hideLoding(){
	$(".progress"		).find("span:eq(0)").css("width","0%");
	$(".progress"		).find("span:eq(1)").css("width","0%");
	$(".statuscontrol"	).hide();
	$("#transfer"	  	).hide();
	$("#upload"		  	).hide();
}

function upPercentage(param){
	$("#upload" 	).show();
	$("#transfer"	).hide();
	$(".progress"	).find("span:eq(0)").css("width",param+"%");
	$(".statusmsg"	).find("span:eq(1)").html("업로드");
}

function convertPercentage(totPage,curPage ){
	var per = Number(curPage) / Number(totPage) * 100;
	$(".progress").find("span:eq(1)").css("width",per+"%");
	
	if( curPage == totPage){
		
		websocketConvert.send(JSON.stringify({
	   		"eventName" : "hideLoding",
	   		"data" : {
	   				"ROOM"       : roomNm
	   		}
	   	}));
		
	}
	
}

function convertLoding (){
	$("#transfer" ).show();
	$("#upload"	  ).hide();
	$(".progress" ).find("span:eq(1)").css("width","0%");
	$(".statusmsg").find("span:eq(1)").html("변환");
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
	var draw = websocketDraw;
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
		if(fileOwner){
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
		}
	});
	
	$("#canvasDraw").bind('mouseup'  , function(e) {
		if(fileOwner){
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
		}
	});
	
	$("#canvasDraw").bind('mousemove', function(e) {
		if(fileOwner){
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
}

function closePT(){
	
	$("#fileShareArea"	  ).hide();
	$("#next" 			  ).hide();
	$("#filePage"   	  ).hide();
	$("#exit" 	    	  ).hide();
	$("#ifile"            ).val("");
	$("[name='shareIcon']").hide();
	
	if( supportYn == "N"){
		$("#div_nonvideoyou"  ).show();
	}else{
		$("#div_nonvideoyou"  ).hide();
	}
	
	fileOwner 	= false;
	
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
		location.href="/bizmeet/main";
		return;
	}
	
	if( $("#userNm").val() == "" ){
		var btnlist = [
		               {btnNm : "확인" , btnCss : "cbtn-y"  , btnFn : "confirmFn"}
		];
		
		openLayer({href: "/bbChat/view/bb_info.jsp", header : "안내" , btn : btnlist , width: 400, height: 250, target : window , frm:$("#frm") , loading : "Y", closeBtn : "N"});
		
		openIframeLoad();
		return;
	}

	
	if(PeerConnection) {
		//미디어 스트림 생성
		rtc.createStream({
			"video": true,
			"audio": false
		}, function(stream) {
			var newDiv 		= document.createElement("div");
			var nonVideoDiv = document.createElement("div");
			var server 		= "";
			
			roomNm     		= decodeURI($("#roomNm").val());
			userNm     		= decodeURI($("#userNm").val());
			
			if(stream != null){
				document.getElementById('remoteyou').src = URL.createObjectURL(stream);
				videos.push(document.getElementById('remoteyou'));
			}else{
				supportYn = "N";	// 카메라 지원 여부
			}
			
			if( supportYn != "Y"){
				$("#div_nonvideoyou").show();
				$("#remoteyou"		).remove();
				//$("#div_nonvideoyou").attr("style"  ,"" );
			}else{
				newDiv.id     = "div_remoteyou";
				document.getElementById('mainArea').appendChild(newDiv);
				
				$("#div_remoteyou").attr("style"  ,"position:absolute;top:0;width:100%;height:100%;border: 1px solid rgba(84, 76, 76, 0.5);" );
				$("#div_remoteyou").append("<div style='padding-left:5px;color:white;display:none;'>"+userNm+"</div>");
			}

			
			if( window.location.protocol.indexOf("https") > -1 )
				server = "wss:" + window.location.href.substring(window.location.protocol.length+2).split('/')[0] + "/websocket/bbchat";
			else
				server = "ws:" + window.location.href.substring(window.location.protocol.length+2).split('/')[0] + "/websocket/bbchat";
			
			rtc.connect(server, roomNm, userNm , $("#userImgPath").val() , $("#joinGb").val(), stream); // 시스널주소

			rtc.on('add remote stream', function(stream, socketId) {
				console.log("ADDING REMOTE STREAM...");
				var clone = cloneVideo('remoteyou', socketId);	
				document.getElementById(clone.id).setAttribute("class", "");
				rtc.attachStream(stream, clone.id);  
				subdivideVideos();
				
				websocketUser.send(JSON.stringify({
					"eventName": "get_div_user",
					"data": {
						"id"    : socketId,
						"room"  : roomNm
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
	var cnt     = 0;
	
	if( supportYn == "Y" ){
		if( $("#fileShareArea").is(":hidden")){

			for(var i = 0, len = videos.length; i < len; i++) {
				var video   = videos[i];
				var divId   = "div_"+$(video).attr("id");
				var visible = "";
				if( !$("#chatbox").is(":hidden") && chatChk){
					right   = 410;
					chatChk = false;
				}

				if( $(video).attr("id") != mainView ){
					
					if( cnt > 0 ){
						right += 160;
					}
					
					if($(video).is(":hidden")){
						visible = "none;";
					}else{
						visible = "block;";
					}
					$("#"+divId ).find("div").show();
					$(video		).attr("width"  ,"150px;" );
					$(video		).attr("height" ,"150px;" );
					$(video		).attr("style"  ,"position:absolute;bottom:-10px;right:"+right+"px;display:"+visible );
					$("#"+divId	).attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);z-index:10;" );
					
					cnt++;
				}else if( $(video).attr("id") == mainView ){
					$("#"+divId).find("div").hide();
					$(video).attr("style"  ,"width: 100%; height: 100%;" );
					$("#"+divId).attr("style"  ,"position:absolute;top:0;width:100%;height:100%;border: 1px solid rgba(84, 76, 76, 0.5);z-index:5;" );
				}
			}
			
			nonVideoSortFn(right,cnt,chatChk);
			
		}else{
			for(var i = 0, len = videos.length; i < len; i++) {
				var video   = videos[i];
				var visible = "";
				var divId   = "div_"+$(video).attr("id");
				
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
				
				$("#"+divId ).find("div").show();
				
				if( $(video).attr("id") != "remoteyou" ){
					$("#"+divId	).attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);z-index:10;" );
				}else{
					$("#"+divId).attr("style"  ,"position:absolute;bottom:9px;right:"+right+"px;display:"+visible+";width:150px;height:112px;border: 1px solid rgba(84, 76, 76, 0.5);z-index:5;" );
					if( $("#"+divId).find("img").is(":hidden") ){
						$("#"+divId).html("<div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon' >");
					}else{
						$("#"+divId).html("<div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:inline;' name='shareIcon' >");
					}
				}
				cnt++;
			}
			
			nonVideoSortFn(right,cnt,chatChk);
		}
	}else{
		
		nonVideoSortFn(right,cnt,chatChk);
		
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
	document.getElementById('mainArea').appendChild(clone);
	document.getElementById('mainArea').appendChild(newDiv);
	videos.push(clone);
	return clone;
}

function removeVideo(socketId) {
	
	var video = document.getElementById('remote' + socketId);
	var div   = document.getElementById('div_remote' + socketId);
	if(video) {
		videos.splice(videos.indexOf(video), 1);
		video.parentNode.removeChild(video);
		div.parentNode.removeChild(div);
	}else if(div){
		for(var i = 0 ; i < nonVideos.length ; i++ ){
			if ( nonVideos[i].indexOf('div_remote' + socketId) > -1 ){
				nonVideos.splice(i, 1);
				$('#div_remote' + socketId).remove();
			}
		}
		
		console.log("remove nonVideos == " + nonVideos.length);
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
		    
		    if(img != ""){
		    	msgTag += "        <img src='"+img+"' alt=\"User Avatar\" class=\"img-circle\" style='width:50px;height:50px;'/>";
		    }else{
		    	msgTag += "        <img src=\"/bbChat/img/icon/person.png\" style='width:50px;height:50px;' class=\"img-circle\" />   		";
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
	        	var tempId    = id + "_" + rand();
	        	var tempHtml  = "";
	        	var tempW  	  = window.innerWidth  / 2 - 200;
	        	var tempH  	  = window.innerHeight / 2 - 50;
	        	
	        	if ( $(".instant-msg").length > 0 )
	        		$(".instant-msg").remove();
	        	
	        	tempHtml += "<div id='bubble"+tempId+"' class='instant-msg' style='top: "+tempH+"px;left: "+tempW+"px;'> 		";
	        	tempHtml += "	<div class='photo'>																				";
			    if(img != ""){
			    	tempHtml += "        <img src='"+img+"' >																	";
			    }else{
			    	tempHtml += "        <img src=\"/bbChat/img/icon/person.png\" />   											";
			    }
	        	tempHtml += "	</div>																							";
	        	tempHtml += "	<div class='msg-info'>																			"; 
	        	tempHtml += "		<div class='nickname'>"+user+"</div>														";
	        	tempHtml += "		<div class='message'>"+msg+"</div>															";
	        	tempHtml += "	</div>																							";
	        	tempHtml += "</div>																								";
	        	
	        	$("body"			).append(tempHtml);
	        	
	        	setTimeout(function(){
	        		removeBubbleFn("bubble"+tempId);
	        	}, 1500);//1.5초 후에 사라짐
	        }
	        
		} else { // 내꺼 
		//	msg = '<strong style="padding-left: 15px">' + userNm + '>>'  + msg + '</strong>';
	        msgTag += "<li class=\"right clearfix\">                                                                    		";
		    msgTag += "    <span class=\"chat-img pull-right\">                                                         		";
		    if(img != ""){
		    	msgTag += "        <img src='"+img+"' alt=\"User Avatar\" class=\"img-circle\" style='width:50px;height:50px;'/>";
		    }else{
		    	msgTag += "        <img src=\"/bbChat/img/icon/person.png\" style='width:50px;height:50px;' class=\"img-circle\" />   		";
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

function nonVideoSortFn(right,cnt,chatChk)
{
	$('#mainArea').find(".non-video").remove();
	
	if( !$("#chatbox").is(":hidden") && chatChk){
		right   = 410;
		chatChk = false;
	}
	
	for(var i = 0, len = nonVideos.length; i < len; i++) {
		if( cnt > 0 ){
			right += 160;
		}
		$('#mainArea').append(nonVideos[i]);
		$('#mainArea').find(".non-video:last").css("right",right+"px");
		cnt++;
	}
	
	if( !$("#fileShareArea").is(":hidden") && supportYn == "N" ){
		
		if( cnt > 0 ){
			right += 160;
		}
		
		$('#mainArea'	  ).append	("<div id='div_remoteyou'></div>");
		$("#div_remoteyou").attr	("class"  , "non-video" 		 );
		$("#div_remoteyou").css 	("right"  , right + "px" 		 );
		$("#div_remoteyou").css 	("width"  , "150px" 			 );
		$("#div_remoteyou").css 	("height" , "112px" 		 	 );
		$("#div_remoteyou").css 	("bottom" , "9px" 				 );

		$("#div_remoteyou").html("<div style='padding-left:5px;color:white;'>"+userNm+"</div><img src='/bbChat/img/icon/icon_share.png' style='margin-top:-35px;margin-left:120px;display:none;' name='shareIcon' >");
	}
	
	
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


