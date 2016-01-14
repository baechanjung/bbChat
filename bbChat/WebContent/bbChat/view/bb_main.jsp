<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="weauth.provider.PClient"%>
<%@ page import="weauth.cmo.UserData"%>
<%@ page import="org.json.simple.parser.JSONParser"%>
<%@ page import="org.json.simple.JSONObject"%>
<%@ page import="java.util.*"%>
<%@ page import="bbchat.util.StringUtil"%>
<%
String strUserNm      = "";
String strUserImgPath = "";
String strRoom        = StringUtil.null2void(request.getParameter("room") ,"");
if(session != null){
	strUserNm      = StringUtil.null2void((String)session.getAttribute("USER_NM") ,"");
	strUserImgPath = StringUtil.null2void((String)session.getAttribute("IMG_PATH"),"");
}
 

%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
<meta name="viewport" content="width=device-width, initial-scale=1.0"> 
<meta name="description" content="Fullscreen Pageflip Layout with BookBlock" />
<meta name="keywords" content="fullscreen pageflip, booklet, layout, bookblock, jquery plugin, flipboard layout, sidebar menu" />
<meta name="author" content="Codrops" />
<title>Biz Meeting</title>
<link rel="stylesheet" href="/bbChat/css/animate.css">
<script type="text/javascript" src="/bbChat/js/lib/jquery-1.8.3.js"></script>
<style>

	/*========================BASE========================*/
	html, body {
		height: 100%;
	}

	body {
		margin: 0;
		padding: 0;
		font-family: "돋움", Dotum, "굴림", Gulim, Arial, sans-serif;
		font-size: 12px;
		color: #666;
	    height: 100%;
	}

	.wrap {
		position: relative;
		display: block;
		min-width: 1020px;
		width: 100%;
		min-height: 650px;
		height: 100%;
		margin: 0;
		padding: 0;
	}


	.wrap.index {
		background-color: #4e5c66;
		background-image: url(/bbChat/img/bg/bg_banner.png);
		background-repeat: no-repeat;
		background-position: 50% 0;
		background-size: cover;
		-webkit-background-size: cover;
		-moz-background-size: cover;
		-o-background-size: cover;
		-ms-background-size: cover;
	}


	.content_wrap {
		display: block;
		margin: 0;
		padding: 0;
	}

	.content_wrap .content_inner {
		width: 1020px;
		margin: 0 auto;
		padding: 40px 0 92px;
		text-align: center;
	}
	/*========================BASE========================*/


	/*========================BUTTON========================*/
	.button {
		background-color: #4CAF50; /* Green */
		border: none;
		color: white;
		padding: 16px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 18px;
		margin: 4px 2px;
		-webkit-transition-duration: 0.4s; /* Safari */
		transition-duration: 0.4s;
		cursor: pointer;
		width: 350px;
		height: 70px;
	}

	.button1 {
		background-color: transparent; 
		color: white; 
		border: 2px solid #FFFFFF;
	}

	.button1:hover {
		background-color: #4CAF50;
		color: white;
	}
	/*========================BUTTON========================*/


	/*========================INPUT========================*/
	input               {
	  font-size:30px;
	  padding:10px 0px 10px 0px;
	  display:block;
	  width:300px;
	  border:none;
	  border-bottom:1px solid #FFFFFF;
	  background: transparent;
	  color: white;
	  text-align: center;
	}
	input:focus         { outline:none; }
	.bar    { position:relative; display:block; width:300px; }
	.bar:before, .bar:after     {
	  content:'';
	  height:5px; 
	  width:0;
	  bottom:1px; 
	  position:absolute;
	  background:#4CAF50; 
	  transition:0.2s ease all; 
	  -moz-transition:0.2s ease all; 
	  -webkit-transition:0.2s ease all;
	}
	.bar:before {
	  left:50%;
	}
	.bar:after {
	  right:50%; 
	}

	/* active state */
	input:focus ~ .bar:before, input:focus ~ .bar:after {
	  width:50%;
	}
	/*========================INPUT========================*/
	</style>



<script type="text/javascript">
$(function(){
	var a = [];
	var r = '<%=strRoom%>';
	/*html5video Check*/
	var b = function() {
        a.push({
            id: "html5video",
            name: "HTML 5 Video element",
            description: "Video element support",
            isSupported: !!document.createElement("video").canPlayType
        })
    };
    
    /*vp8codec Check*/
    var c = function() {
        a.push({
            id: "vp8codec",
            name: "VP8 Codec",
            description: "Video en-/decoding",
            isSupported: "probably" === document.createElement("video").canPlayType('video/webm; codecs="vp8", vorbis')
        })
    };
    
    /*getusermedia Check*/
    var d = function() {
        var b;
        b = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.oGetUserMedia || navigator.msGetUserMedia || navigator.getUserMedia ? !0 : !1, a.push({
            id: "getusermedia",
            name: "getUserMedia()",
            description: "Web camera access",
            isSupported: b
        })
    };
    
    /*RTCPeerConnection Check*/
    var e = function() {
        var b;
        b = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.oRTCPeerConnection || window.msRTCPeerConnection || window.RTCPeerConnection ? !0 : !1, a.push({
            id: "rtcpeerconnection",
            name: "RTCPeerConnection",
            description: "Peer to Peer connection",
            isSupported: b
        })
    };
    
    /*ICE Connection Check*/
    var f = function() {
        var b, c = {
            iceServers: [{
                url: "stun:stun.l.google.com:19302"
            }]
        };
        try {
            window.webkitRTCPeerConnection && (b = new webkitRTCPeerConnection(c)), window.mozRTCPeerConnection && (b = new mozRTCPeerConnection(c)), window.oRTCPeerConnection && (b = new oRTCPeerConnection(c)), window.msRTCPeerConnection && (b = new msRTCPeerConnection(c)), window.RTCPeerConnection && (b = new RTCPeerConnection(c))
        } catch (d) {}
        var e = {
            id: "iceconnection",
            name: "ICE Connection",
            description: "NAT traversal"
        };
        b && b.iceConnectionState ? e.isSupported = !0 : b && b.iceState ? (e.isSupported = !1, e.message = "Old, unsupported API detected.") : e.isSupported = !1, a.push(e)
    };
    
    b(),c(),d(),e()/*,f()*/;
    
    var supportBrowserCheck = true;
	$.each(a , function(i,v){
		if(!v.isSupported){
			supportBrowserCheck = false;
			return false;
		}
	});
	
	if(supportBrowserCheck){
		if(r != ""){
			$('#roomNum').val(r); 
			fnNext(null , "step4");
		}else{
			$("#step1").show();	
		}
	}else{
		$("#notSupportBrowser").show();
	}
});


/**
 * 버튼 이벤트 처리
 */
function fnNext( o , eleId ){
	/*회의실 개설*/
	if( eleId == "step3" ){
		$('#frm'    ).attr('action','/bizmeet/room');
		$('#joinGb' ).val ("S"	 );
		$('#roomNm' ).val (rand());
		$('#userNm' ).val (encodeURI($('#USER_NM').val()));
		document.getElementById("frm").submit();
	}
	/*회의참여*/
	else if( eleId == "step4" ){
		if ($('#roomNum').val() == "") {
			alert('회의실 코드를 입력해 주세요.');
			return;
		}
		
		$('#frm'    ).attr('action','/bizmeet/room');
		$('#joinGb' ).val ("J");
		$('#roomNm' ).val (encodeURI($('#roomNum').val()));
		document.getElementById("frm").submit();
	}
	/**/
	else{
		var $nextStep    = $("#"+eleId);
		var $currentStep = $(o).parent().parent();
		$currentStep.addClass('animated bounceOutLeft').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$currentStep.removeClass();
			$currentStep.hide();

			$nextStep.show();
			$nextStep.addClass('animated zoomInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				$nextStep.removeClass();
			});
		});
	}
}

/**
 * 방번호 랜덤채번(이거, 방 쫑나지는 않을까?)
 */
function rand(){
	var text = "";
	var possible = "0123456789";
	for (var i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random()* possible.length));
	return text;
}
</script>
</head>
<body>
	<form id='frm' method="post">
		<input type="hidden" id="joinGb"      name="joinGb"  />
		<input type="hidden" id="roomNm"      name="roomNm"  />
		<input type="hidden" id="userNm"      name="userNm"      value="<%=strUserNm%>"      />
		<input type="hidden" id="userImgPath" name="userImgPath" value="<%=strUserImgPath%>" />
	</form>
	<!-- wrap -->
	<div class="wrap index">
	
		<!-- content -->
		<div class="content_wrap">
	
			<!-- content_inner -->
			<div class="content_inner">

				<div style="padding:10px 0 0;color:white; display:none;" id="notSupportBrowser">
					<h1 style="font-size: 80px;">ㅠㅠ</h1>
					<h2 style="font-size: 30px;">접속하신 인터넷 브라우저에서는 Biz Meeting을 이용하실 수 없습니다.</h2>
					<!-- h2 style="font-size: 30px;">BizMeeting은 구글 크롬, 모질라 파이어폭스 브라우저에서만 실행 됩니다.</h2 -->
					<h2 style="font-size: 30px;">최신 크롬, 파이어폭스 브라우저로 재접속 바랍니다.</h2>
					<h2 style="font-size: 20px;margin-top: 50px;">크롬 또는 파이어폭스 브라우저가 없으시다면</h2>
					<h2 style="font-size: 20px;">아래의 다운로드 링크를 이용하여 다운로드 해주시기 바랍니다.</h2>
					<div style="margin-top: 30px;">
						<a style="width: 80px;display: inline-block;padding-right: 50px;color: white;" href="https://www.google.com/intl/ko/chrome/browser/" target="_blank"> 
							<h3>크롬</h3>
							<img src="/bbChat/img/chrome-128x128.png" style="width:70px;" />
						</a>
						&nbsp;&nbsp;&nbsp;
						<a style="width: 80px;display: inline-block;padding-left: 50px;color: white;" href="https://www.mozilla.org/ko/firefox/new/" target="_blank"> 
							<h3>파이어폭스</h3>
							<img src="/bbChat/img/firefox-128x128.png" style="width:70px;" />
						</a>
					</div>
				</div>

			
				<div style="padding:150px 0 0; color:white; display:none;"  id="step1">
					<h1 style="font-size: 40px;">참석할 회의실이 있습니까?</h1>
					<div style="margin-top: 50px;">
						<button class="button button1" onclick="fnNext(this,'step2');">네, 참석할 회의실이 있어요.</button>
						&nbsp;&nbsp;&nbsp;
						<button class="button button1" onclick="fnNext(this,'step3');">아니요, 회의실을 개설하려고요.</button>
					</div>
				</div>


				<div style="padding:150px 0 0;color:white; display:none;" id="step2" >
					<h1 style="font-size: 40px;">회의실 코드를 입력해 주세요.</h1>

					<div style="margin-top: 50px;width: 300px;display: inline-block;">
						<input type="text" id="roomNum" maxlength="6" required>
						<span class="bar"></span>
					</div>

					<div style="margin-top: 50px;">
						<button class="button button1" style="width: 250px;" onclick="fnNext(this,'step1');">뒤로가기</button>
						&nbsp;&nbsp;&nbsp;
						<button class="button button1" style="width: 250px;" onclick="fnNext(this,'step4');">입장</button>
					</div>
				</div>


			</div>
			<!-- //content_inner -->
	
		</div>
		<!-- //content -->
	

	
	</div>
	<!-- //wrap -->
</body>


</html>