$(function($){
	if( $("#roomEx").val() == "false" && $("#joinGb").val() == "J" ){
		alert("현재 존재하지 않는 회의실 입니다.");
		location.href="/bizmeet/main";
		return;
	}
	
	if( $("#roomUserCnt").val() >= 4 ){
		alert("회의실의 정원이 초과 하였습니다.\n");
		location.href="/bizmeet/main";
		return;
	}
	initClipBoard();
	
	$("#retroclockbox_xs").flipcountdown({
		size:"sm"
	});
	$("#chatbox" ).find(".chat-panel").css("height", window.innerHeight - 60 + "px");
	$("#messages").parent().css("height", window.innerHeight - 174 + "px");
	
	$("#cuyBtn").click(function(){
		
		var chatDivSize = Number($("#bbchat-panel").width());
		
		if($("#chatbox").is(":hidden")){
			$("#chatbox").show("slide",function(){
				subdivideVideos();
			});
			$("#exit"		).css( "right" , (chatDivSize + 12) + "px" 	);
			$(".big-list"	).css( "right" , (chatDivSize + 2 ) + "px"  );
			fileAreaResize();
		}else{
			$("#chatbox").hide("slide",function(){
				subdivideVideos();
			});
			$("#exit"		).css( "right" , "10px" );
			$(".big-list"	).css( "right" , "0px" );
			fileAreaResize();
		}
		
	});
	
	$("#shareBtn").click("click",function(){
		
		if($(".statuscontrol").is(":hidden")){
			if($(".filearea").is(":hidden")){
				$(".filearea").show();
			}else{
				$(".filearea").hide();
			}
		}else{
			alert("업로드 중인 파일이 있습니다.");
		}
	});
	
	$("body").click("click",function(event){
		if("notClose" != $(event.target).attr("name")){
			$(".filearea").hide();
		}
	});
	
	$("#uploadBtn").click("click",function(){
		$("#ifile").click();	
	});
	
	$("#inviteBtn").click(function(){
		var btnlist = [];
		$("#invite_url").val("room="+roomNm);
		openLayer({href: "/bbChat/view/bb_invite.jsp", header : "초대하기" , btn : btnlist , width: 600, height: 190, target : window , frm:$("#frm") , loading : "Y"});
		
		openIframeLoad();
	});
	
	$("#expandBtn").click(function(){
		toggleFullScreen();
	});
	
	$("#hideBtn").click(function(){
		
		if( $("#fileShareArea").is(":hidden")){
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];

				if( $(video).attr("id") != "you" ){
					if( $( video ).is(":visible") )
						$( video ).hide( "down" );
					else
						$( video ).show( "up" );
				}
			}
		}else{
			for(var i = 0, len = videos.length; i < len; i++) {
				var video = videos[i];
				
				if( $( video ).is(":visible") )
					$( video ).hide( "down" );
				else
					$( video ).show( "up" );
			}
			
		}
	});
	
	$("#exitBtn").click(function(){
		location.href = "/bizmeet/main";
	});
	
	
	$("#exit").live("click",function(){
		closePT();
		
		websocketConvert.send(JSON.stringify({
			"eventName" : "closePT",
			"data" : {
				"ROOM"       : roomNm
			}
		}));
	});
	
	$("#mainArea").find("div").live("click",function(){
		if( $("#fileShareArea").is(":hidden")){
			var divId   = $(this).attr("id");
			
	
			if(divId == undefined)
				return;
			
			if($(this).attr("class") != undefined)
				return;
			
			mainView = divId.replace("div_","");
			subdivideVideos();
		}
	});
	
	// 브라우져 크기 조정
	window.onresize = function(event) {
		
		var chatDivSize = Number($("#bbchat-panel").width());
		
		if($("#chatbox").is(":visible")){
			$("#exit"		).css( "right" , (chatDivSize + 12) + "px" 	);
			$(".big-list"	).css( "right" , (chatDivSize + 2 ) + "px"  );
		}else{
			$("#exit"		).css( "right" , "10px" );
			$(".big-list"	).css( "right" , "0px" );
		}
		
		$("#fileShareArea"  ).css("height", window.innerHeight - 60 + "px");
		$("#chatbox" 		).find(".chat-panel").css("height", window.innerHeight - 60 + "px");
		$("#messages"		).parent().css("height", window.innerHeight - 174 + "px");
		subdivideVideos();
		fileAreaResize();
		
	};
	
	function fileAreaResize(){
		var div_LEFT 		= "";
		
		if($("#fileShareArea"  ).is(":visible")){
			div_LEFT = Number($("#canvasImg").offset().left) - Number($(".big-list-div").offset().left);
			$("#canvasDraw"  ).css("left",div_LEFT+"px");
			$("#canvasDraw"  ).attr("width" 	,	$("#canvasImg").width() );
			$("#canvasDraw"  ).attr("height"	,	$("#canvasImg").height());
			
		}
	}
	
	function initClipBoard(){
		ZeroClipboard.config({
			swfPath: '/bbChat/js/ZeroClipboard.swf',
			forceHandCursor: true
		});
		var clipboard = new ZeroClipboard($('#urlCopy'));
		clipboard.on('aftercopy', function(event) { alert('접속 URL이 복사되었습니다. \n'+event.data['text/plain']); });
	}
	
	
	function toggleFullScreen() {
		if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
				(!document.mozFullScreen && !document.webkitIsFullScreen)) {
			if (document.documentElement.requestFullScreen) {  
				document.documentElement.requestFullScreen();  
			} else if (document.documentElement.mozRequestFullScreen) {  
				document.documentElement.mozRequestFullScreen();  
			} else if (document.documentElement.webkitRequestFullScreen) {  
				document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
			}  
		} else {  
			if (document.cancelFullScreen) {  
				document.cancelFullScreen();  
			} else if (document.mozCancelFullScreen) {  
				document.mozCancelFullScreen();  
			} else if (document.webkitCancelFullScreen) {  
				document.webkitCancelFullScreen();  
			}  
		}  
	}
	
	
	
	
})
