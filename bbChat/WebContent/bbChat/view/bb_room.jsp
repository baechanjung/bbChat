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
<script type="text/javascript" src="/bbChat/js/ZeroClipboard.min.js"></script>
<script type="text/javascript">
function callinit(data){
	$("#userNm").val(data["USER_NM"]);
	init();
}
</script>
<style>
	/*========================BUBBLE========================*/
	.bubble_box {
		position: relative;
		background: rgba(0, 0, 0, 0.48);
		border: 2px solid #B04EF0;
		border-radius: 5px;
		color: white;
		font-size: 17px;
		padding:10px 10px 10px 10px;
		-webkit-transition-duration: 0.4s; /* Safari */
		transition-duration: 0.4s;
	}
	.bubble_box:after, .bubble_box:before {
		top: 100%;
		left: 50%;
		border: solid transparent;
		content: " ";
		height: 0;
		width: 0;
		position: absolute;
		pointer-events: none;
	}
	.bubble_box:after {
		border-color: rgba(0, 0, 0, 0);
		border-top-color: rgb(63, 46, 74);
		border-width: 10px;
		margin-left: -10px;
	}
	.bubble_box:before {
		border-color: rgba(176, 78, 240, 0);
		border-top-color: #B04EF0;
		border-width: 13px;
		margin-left: -13px;
	}

   .filearea{
      width: 100%; 
      position: absolute; 
      top: 74px; 
      height: 300px; 
      background:transparent; 
      z-index: 1000; 
      text-align:center;
   }
   .filearea a{cursor:pointer;color:white;}
   .filearea ul{list-style: none;/*height:225px;overflow-x: auto;*/}
   .filearea ul > li{height: 45px; border-top: 1px solid #ebedf2;height: 45px;padding-top: 8px;text-align:left;}
   .file_box {
      width:300px;
      display: inline-block;
      background: rgba(0, 0, 0, 0.48);
      border: 2px solid #B04EF0;
      border-radius: 5px;
      color: white;
      font-size: 17px;
      padding:10px 10px 10px 10px;
      -webkit-transition-duration: 0.4s; /* Safari */
      transition-duration: 0.4s;
   }
   .file_box:after, .file_box:before {
      bottom: 100%;
      left: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
   }
   .file_box:after {
      border-color: rgba(0, 0, 0, 0);
      border-bottom-color: rgb(63, 46, 74);
      border-width: 10px;
      margin-left: -10px;
   }
   .file_box:before {
      border-color: rgba(176, 78, 240, 0);
      border-bottom-color: #B04EF0;
      border-width: 13px;
      margin-left: -13px;
   }
   
   .statuscontrol{
      width: 100%; 
      position: absolute; 
      top: 60px; 
      height: 130px; 
      background: rgba(0, 0, 0, 0.76);
      z-index: 1000;
   }
   .statuscontrol > .progress{
      position: absolute;
      left: -2px; 
      right: 0px;
      height:3px;
   }   
   .statuscontrol > .progress span{
      background-color: #B04EF0; 
      position: absolute;
      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      -webkit-transition-duration: 0.4s;
      transition-duration: 0.4s;
   }      
   .statuscontrol > .statusbox{
      text-align:center; 
      margin-top:18px;
   }
   .statuscontrol > .statusbox > .statusmsg{
      color:white;
      font-size:20px;
      margin-top:13px;
   }
</style>
	
</head>
<body style="margin: 0;overflow: hidden;" onload="init();">
<form id='shareForm' name="shareForm" enctype='multipart/form-data' method="post">
	<input id="ifile" type="file" style="display: none;" onchange="changeFile(this);" />
</form>
<form id="frm" method="post">
	<input type="hidden" id="invite_url" name="invite_url"	value=""/>
</form>
<input type="hidden"	id="roomNm"			name="roomNm"		value="<%=StringUtil.null2void( request.getParameter("roomNm")  	, ""   )%>" />
<input type="hidden"	id="userNm"			name="userNm"		value="<%=StringUtil.null2void( request.getParameter("userNm")  	, ""   )%>" />
<input type="hidden"	id="userImgPath"	name="userImgPath"	value="<%=StringUtil.null2void( request.getParameter("userImgPath") , ""   )%>" />
<input type="hidden"	id="joinGb"			name="joinGb"		value="<%=StringUtil.null2void( request.getParameter("joinGb")  	, "J"  )%>" />

	<div id="header" class="header" style="width: 100%; position: absolute; opacity : 0.8; ">
		<div class="header_inner" style="text-align: center;width: 100%;">
			<div class="join" style="width: 410px;float: none; ">
				<ul style="margin-top: 8px;">
					<li id="cuyBtn"   ><img title="대화하기" src="/bbChat/img/icon/icon-messenger1.png"   style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="inviteBtn"><img title="초대하기" src="/bbChat/img/icon/icon-invite1.png" 	 style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="shareBtn" ><img title="문서공유" src="/bbChat/img/icon/icon-doc-storage1.png" style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="hideBtn"  ><img title="숨기기"   src="/bbChat/img/icon/icon-pip-hide1.png"	 style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="exitBtn"  ><img title="회의종료" src="/bbChat/img/icon/icon-exit1.png" 		 style="width: 45px;height: 45px; cursor: pointer;"> </li>
				</ul>
			</div>
		</div>
		<div id="retroclockbox_xs" style="margin-top: -50px;margin-left: 10px;"></div>
		<div id="urlCopy_container" style="position:absolute; top:20px;right: 10px;">
			<b><font id="urlCopy" data-clipboard-text="https://www.brobb.co.kr/bizmeet/main?room=<%=StringUtil.null2void( request.getParameter("roomNm")  , ""   )%>" color="#FFFFFF" size="4">URL <%=StringUtil.null2void( request.getParameter("roomNm")  , ""   )%></font></b>
		</div>
	</div>

	<div class="filearea" style="display: none;">
		<div class="file_box">
			<div id="uploadBtn" style="height: 45px; padding-top: 3px;">
				<img src="/bbChat/img/icon/upload95.png" style="width: 35px; margin-right: 5px;" /><a>발표자료 업로드</a>
			</div>
			<ul style="margin-bottom:0px;">
			<!-- 
				<li><a>RTC소개자료.pptx</a></li>
				<li><a>RTC소개자료.pptx</a></li>
				<li><a>RTC소개자료.pptx</a></li>
				<li><a>RTC소개자료.pptx</a></li>
				<li><a>RTC소개자료.pptx</a></li>
				<li><a>RTC소개자료.pptx</a></li>
			 -->
			</ul>
		</div>
	</div>
	
	<div class="statuscontrol" style="display: none;">
		<div class="progress">
			<span style="width: 0%;"></span>
		</div>
		<div class="statusbox">
			<div id="transfer" style="display: none;">
				<img src="/bbChat/img/icon/transfer5.png" />
			</div>
			<div id="upload">
				<img src="/bbChat/img/icon/upload95.png" />
			</div>
			<div class="statusmsg">
				<span>sss</span>님의 발표자료를 <span>업로드</span> 하고 있습니다.
			</div>
		</div>
	</div>

	<div id="chatbox" style="right: 0px; position:fixed; top:60px; height: 100%; z-index:130; display: none;" >
		<div class="chat-panel panel panel-default" style="width: 400px;height: 877px;border-color:#322542;background-color:inherit;border-radius:0px;">
			<div class="panel-heading" style="color:rgb(255,255,255);background-color:black;border-bottom:1px solid #322542;border-radius:0px;">
				<i class="fa fa-comments fa-fw"></i> <img src="/bbChat/img/icon/message31.png" width="30" height="30"/> Message
			</div>
			<!-- /.panel-heading -->
			<div style="height: 87%; background-color: rgba(0,0,0,0.7);border-radius:0px;">
				<ul class="chat" id="messages" style="background-color: rgba(0,0,0,0.7);">
				</ul>
			</div>
			<!-- /.panel-body -->
			<div class="panel-footer" style="background-color:black;border-top:1px solid #322542;border-radius:0px;">
				<div class="input-group">
					<input id="chatinput" type="text" style="padding:20px;font-size: 16px;" class="form-control input-sm" placeholder="Type your message here..." /> 
					<span class="input-group-btn">
						<button class="btn btn-warning btn-sm" id="btn-chat" style="padding:11px;background-color:#B04EF0;border-color:#B04EF0;">Send</button>
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
			<div onclick="preBtn  ()" id="pre" style="display: none;background-image:url('/bbChat/img/controls.png'); background-position: 0 0; left: 10px; width: 32px;height: 32px; margin-top: 15px; margin-left: 250px; position: fixed;cursor: pointer;"></div>
			<div id="filePage" style="display: none;position: absolute;color: white;margin-top: 20px;margin-left: 80px;font-size: larger; ">
				<span></span><span></span>
			</div> 
			<div onclick="nextBtn ()"  id="next" style="display: none;position: fixed; background-image:url('/bbChat/img/controls.png'); background-position: -32px 0; width: 32px;height: 32px;    margin-top: 15px; margin-left: 150px; cursor: pointer;"></div>
			<div id="exit" style="display: none;width: 30px;height: 30px; margin-top: 17px; position: fixed;cursor: pointer; right: 10px;">
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
	
	
</body>
</html>