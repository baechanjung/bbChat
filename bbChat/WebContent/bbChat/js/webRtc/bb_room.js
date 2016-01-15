$(function($){
	
	initClipBoard();
	
	$("#retroclockbox_xs").flipcountdown({
		size:"sm"
	});
	$("#chatbox" ).find(".chat-panel").css("height", window.innerHeight - 60 + "px");
	$("#messages").parent().css("height", window.innerHeight - 174 + "px");
	
	$("#cuyBtn").click(function(){
		if($("#chatbox").is(":hidden")){
			$("#chatbox").show("slide",function(){
				subdivideVideos();
			});
			$("#exit"	).css( "right" , "410px" );
		}else{
			$("#chatbox").hide("slide",function(){
				subdivideVideos();
			});
			$("#exit"	).css( "right" , "10px" );
		}
		
	});
	
	$("#shareBtn").click("click",function(){
		$("#ifile").click();	
	});
	
	$("#inviteBtn").click(function(){
		var btnlist = [];
		$("#invite_url").val("room="+roomNm);
		openLayer({href: "/bbChat/view/bb_invite.jsp", header : "초대하기" , btn : btnlist , width: 600, height: 190, target : window , frm:$("#frm") , loading : "Y"});
		
		openIframeLoad();
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
	
	// 브라우져 크기 조정
	window.onresize = function(event) {
		$("#fileShareArea"  ).css("height", window.innerHeight - 60 + "px");
		$("#chatbox" 		).find(".chat-panel").css("height", window.innerHeight - 60 + "px");
		$("#messages"		).parent().css("height", window.innerHeight - 174 + "px");
		subdivideVideos();
	};
	
	
	function initClipBoard(){
		ZeroClipboard.config({
			swfPath: '/bbChat/js/ZeroClipboard.swf',
			forceHandCursor: true
		});
		var clipboard = new ZeroClipboard($('#urlCopy'));
		clipboard.on('aftercopy', function(event) { alert('접속 URL이 복사되었습니다. \n'+event.data['text/plain']); });
		
	}
})