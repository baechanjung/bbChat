<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="bbchat.util.StringUtil"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
<meta name="viewport" content="width=device-width, initial-scale=1.0"> 
<meta name="description" content="Fullscreen Pageflip Layout with BookBlock" />
<meta name="keywords" content="fullscreen pageflip, booklet, layout, bookblock, jquery plugin, flipboard layout, sidebar menu" />
<meta name="author" content="Codrops" />
<title>biz Meeting</title>
<%@ include file="/bbChat/inc/inc_0001_01.jsp" %>
<link href="/bbChat/css/bootstrap.css"   			rel="stylesheet">
<script type="text/javascript" src="/bbChat/js/webRtc/webrtc.io.js"></script>
<script type="text/javascript" src="/bbChat/js/webRtc/script.js"></script>
<script type="text/javascript" src="/bbChat/js/webRtc/bb_room.js"></script>
<script type="text/javascript">
function callinit(data){
	$("#userNm").val(data["USER_NM"]);
	init();
}
</script>
</head>
<body style="margin: 0;overflow: hidden;" onload="init();">
<form id='shareForm' name="shareForm" enctype='multipart/form-data' method="post">
	<input id="ifile" type="file" style="display: none;" onchange="changeFile(this);" />
</form>
<form id="frm" method="post">
	<input type="hidden" id="invite_url" name="invite_url"	value=""/>
</form>
<input type="hidden"	id="roomNm"		name="roomNm"	value="<%=StringUtil.null2void( request.getParameter("roomNm")  , ""   )%>" />
<input type="hidden"	id="userNm"		name="userNm"	value="<%=StringUtil.null2void( request.getParameter("userNm")  , ""   )%>" />
<input type="hidden"	id="joinGb"		name="joinGb"	value="<%=StringUtil.null2void( request.getParameter("joinGb")  , "J"  )%>" />

	<div id="header" class="header" style="width: 100%; position: absolute; opacity : 0.8; ">
		<div class="header_inner">
			<div class="join" style="position:fixed; width: 600px;right: 30px;">
				<ul style="margin-top: 8px;">
					<li id="cuyBtn"   ><img title="대화하기" src="/bbChat/img/icon/icon-messenger.png"   style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="shareBtn" ><img title="문서공유" src="/bbChat/img/icon/icon-doc-storage.png" style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="hideBtn"  ><img title="숨기기"   src="/bbChat/img/icon/icon-pip-hide.png"	style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="inviteBtn"><img title="초대하기" src="/bbChat/img/icon/icon-invite.png" 	 	style="width: 70px;height: 60px; margin-top:-5px;margin-left:-5px;cursor: pointer;"> </li>
					<li id="exitBtn"  ><img title="회의종료" src="/bbChat/img/icon/icon-exit.png" 		 style="width: 45px;height: 45px; cursor: pointer;"> </li>
				</ul>
				<div id="retroclockbox_xs" style="margin-top: 13px;"></div>
			</div>
		</div>
	</div>


	<div id="chatbox" style="padding-top: 5px; right: 0px; position:fixed; top:55px; height: 100%; z-index:130; display: none;" >
		<div class="chat-panel panel panel-default" style="width: 400px;height: 877px;border-color:#322542;background-color:inherit;">
			<div class="panel-heading" style="color:rgb(255,255,255);background-color:#322542">
				<i class="fa fa-comments fa-fw"></i> Chat
			</div>
			<!-- /.panel-heading -->
			<div style="height: 86%; background-color: rgba(50,37,66,0.7);">
				<ul class="chat" id="messages" style="background-color: rgba(50,37,66,0.7);">
				</ul>
			</div>
			<!-- /.panel-body -->
			<div class="panel-footer" style="background-color:#322542;">
				<div class="input-group">
					<input id="chatinput" type="text" style="height: 30px;" class="form-control input-sm" placeholder="Type your message here..." /> 
					<span class="input-group-btn">
						<button class="btn btn-warning btn-sm" id="btn-chat">Send</button>
					</span>
				</div>
			</div>
			<!-- /.panel-footer -->
		</div>
	</div>
	
		
	<div id="fileShareArea" style="position: absolute; top: 0px; width: 100%; top:60px; display:none;">
		<div id="fileShareUl" style="position: absolute; top: 0px;left: 0px;bottom: 0px;width: 240px;border-right: 5px solid #c0d0d9;overflow: hidden;overflow-x: hidden;overflow-y: auto; background-color: rgb(158,191,228);">
		</div>
		<div style="position: absolute;top: 0px;bottom: 0px;left: 0px;right: 0px;text-align: center;overflow: hidden; background-color: rgb(131,175,226); margin-left: 241px;">
			<div onclick="preBtn  ()" id="pre" style="display: none;background-image:url('../img/controls.png'); background-position: 0 0; left: 10px; width: 32px;height: 32px; margin-top: 15px; margin-left: 250px; position: fixed;cursor: pointer;"></div>
			<div id="filePage" style="display: none;position: absolute;color: white;margin-top: 20px;margin-left: 80px;font-size: larger; ">
				<span></span><span></span>
			</div> 
			<div onclick="nextBtn ()"  id="next" style="display: none;position: fixed; background-image:url('../img/controls.png'); background-position: -32px 0; width: 32px;height: 32px;    margin-top: 15px; margin-left: 150px; cursor: pointer;"></div>
			<div onclick="exitBtn  ()" id="exit" style="display: none;width: 30px;height: 30px; margin-top: 17px; position: fixed;cursor: pointer; right: 10px;">
				<img title="문서공유종료" src="/bbChat/img/icon/icon-close.png" width="30px;">
			</div>
		</div>
		<div style="position: absolute;top: 60px;bottom: 0px;left: 0px;right: 0px;text-align: left;overflow: hidden; background-color: rgb(131,175,226); margin-left: 241px;">
			<div style="height: 100%;">
				<img    id="canvasImg"  style="width: 97%;height: 90%; cursor: pointer;margin-left: 20px; border:2px solid black;">
			</div>
		</div>
	</div>

	<canvas id="canvasDraw" style="position: absolute;top: 120px;bottom: 0px;left: 0px;right: 0px;overflow: hidden; margin-left: 261px; z-index: 100;" ></canvas>


	<div id="mainArea">
		<video  id="you" style="width: 100%; height: 100%" autoplay></video>
	</div>
	
	<div id="ProcessLayer" style="opacity:0.5;width:100%;height:100%;z-index:1002;position:absolute;top:0;left:0;background-color:#fff;display: none;"></div>
	<div id="ProcessBox"   style="position:absolute;margin-top:15%; top:0px;z-index:1003;display:none; padding-left:42%;" >
		<img src="/bbChat/img/loading-2.gif">
	</div>
	
	
	
</body>
</html>