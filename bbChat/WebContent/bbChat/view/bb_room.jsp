<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="bbchat.util.StringUtil"%>
<%@ page import="java.util.Map"%>
<%@ page import="java.util.List"%>
<%@ page import="bbchat.server.WebSocketServer"%>
<%


	boolean 				bMobileCheck	 = 	false;
	boolean 				roomExist		 = 	false;
	String 					ua				 =	request.getHeader("User-Agent").toLowerCase();
	Map<String, Object> 	roomList		 =  WebSocketServer.getRoomList();
	List 					strUserList 	 =  null;
	if (ua.matches(".*(android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino).*")||ua.substring(0,4).matches("1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|e\\-|e\\/|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\\-|2|g)|yas\\-|your|zeto|zte\\-")){
		bMobileCheck = true;
		System.out.println("##########################################");
		System.out.println("##########################################");
		System.out.println("모바일 OK");
		System.out.println("##########################################");
		System.out.println("##########################################");
	}else{
		bMobileCheck = false;
		System.out.println("##########################################");
		System.out.println("##########################################");		
		System.out.println("모바일 NO");
		System.out.println("##########################################");
		System.out.println("##########################################");		
	}
	
	if( roomList.size() > 0 ){
		
		System.out.println(request.getParameter("roomNm"));
		System.out.println(roomList.get(request.getParameter("roomNm")));
		
		if( roomList.get(request.getParameter("roomNm")) != null ){
			roomExist = true;
		}
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
<title>biz Meeting</title>
<%@ include file="/bbChat/inc/inc_0001_01.jsp" %>
<link href="/bbChat/css/bootstrap.css"   			rel="stylesheet">
<script type="text/javascript">
function callinit(data){
	$("#userNm").val(data["USER_NM"]);
	init();
}
</script>
<script type="text/javascript" src="/bbChat/js/webRtc/webrtc.io.js"></script>
<script type="text/javascript" src="/bbChat/js/webRtc/script.js"></script>
<script type="text/javascript" src="/bbChat/js/webRtc/bb_room.js"></script>
<script type="text/javascript" src="/bbChat/js/ZeroClipboard.min.js"></script>
</head>
<body style="margin: 0;overflow: hidden;" onload="init();">
<form id='shareForm' name="shareForm" enctype='multipart/form-data' method="post">
	<input id="ifile" type="file" style="display: none;" onchange="changeFile(this);" />
</form>
<form id="frm" method="post">
	<input type="hidden" id="invite_url" name="invite_url"	value=""/>
</form>
<input type="hidden"	id="roomEx"			name="roomEx"		value="<%=roomExist  	%>" />
<input type="hidden"	id="roomNm"			name="roomNm"		value="<%=StringUtil.null2void( request.getParameter("roomNm")  	, ""   )%>" />
<input type="hidden"	id="userNm"			name="userNm"		value="<%=StringUtil.null2void( request.getParameter("userNm")  	, ""   )%>" />
<input type="hidden"	id="userImgPath"	name="userImgPath"	value="<%=StringUtil.null2void( request.getParameter("userImgPath") , ""   )%>" />
<input type="hidden"	id="joinGb"			name="joinGb"		value="<%=StringUtil.null2void( request.getParameter("joinGb")  	, "J"  )%>" />

	<div id="header" class="header" style="width: 100%; position: absolute; opacity : 0.8; z-index:30;">
		<div class="header_inner" style="text-align: center;width: 100%;">
			<div class="join" style="width: 410px;float: none; ">
				<ul style="margin-top: 8px;">
					<%if(!bMobileCheck){ %>
					<li id="cuyBtn"    ><img title="대화하기" src="/bbChat/img/icon/icon-messenger1.png"   style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<%} %>
					<li id="inviteBtn" ><img title="초대하기" src="/bbChat/img/icon/icon-invite1.png" 	  style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="shareBtn"  ><img title="문서공유" src="/bbChat/img/icon/icon-doc-storage1.png" style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<li id="expandBtn" ><img title="확대"     src="/bbChat/img/icon/icon_expand.png"	 	  style="width: 45px;height: 45px; cursor: pointer;"> </li>
					<!-- 
					<li id="hideBtn"  ><img title="숨기기"   src="/bbChat/img/icon/icon-pip-hide1.png"	 style="width: 45px;height: 45px; cursor: pointer;"> </li>
					 -->
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
			<div id="uploadBtn" style="height: 45px; padding-top: 10px;">
				<div style="display: inline-block;"><img src="/bbChat/img/icon/upload95.png" style="width: 35px; margin-right: 5px;margin-top: -6px;" /></div>
				<div style="display: inline-block;"><a>발표자료 업로드</a></div>
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
			<span style="width:0%;" class="uploadbar"></span>
			<span style="width:0%;" class="transferbar"></span>
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
	
	<div id="chatbox" class="bbchat-area" >
		<div class="chat-panel panel panel-default" id="bbchat-panel">
			<div class="panel-heading" id="bbchat-heading">
				<i class="fa fa-comments fa-fw"></i> <img src="/bbChat/img/icon/message31.png" width="30" height="30"/> Message
			</div>
			<!-- /.panel-heading -->
			<div style="height: 87%; background-color: rgba(0,0,0,0.7);border-radius:0px;">
				<ul class="chat" id="messages" style="background-color: rgba(0,0,0,0.7);">
				</ul>
			</div>
			<!-- /.panel-body -->
			<div class="panel-footer" id="bbchat-footer">
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
	
		
	<div id="fileShareArea" class="file-share">
		<div id="fileShareUl" class="small-list">
		</div>
		<div class="btn-list">
			<div onclick="preBtn()" id="pre" style="display: none;background-image:url('/bbChat/img/controls.png'); background-position: 0 0; left: 0px; width: 32px;height: 32px; margin-top: 15px; margin-left: 250px; position: fixed;cursor: pointer;"></div>
			<div id="filePage" style="display: none;position: absolute;color: white;margin-top: 20px;margin-left: 95px;font-size: larger; ">
				<span></span><span></span>
			</div> 
			<div onclick="nextBtn ()"  id="next" style="display: none;position: fixed; background-image:url('/bbChat/img/controls.png'); background-position: -32px 0; width: 32px;height: 32px;    margin-top: 15px; margin-left: 150px; cursor: pointer;"></div>
			<div id="exit" style="display: none;width: 30px;height: 30px; margin-top: 17px; position: fixed;cursor: pointer; right: 10px;">
				<img title="문서공유종료" src="/bbChat/img/icon/icon-close.png" width="30px;">
			</div>
		</div>
		<div class="big-list">
			<ul>
				<li>
					<div class='big-list-div'>
						<img id="canvasImg" onload="imgLoad(this);" >
						<canvas id="canvasDraw" style="position: absolute;top: 0px;bottom: 0px;right: 0px;overflow: hidden; z-index: 100; display:none;" ></canvas>
					</div>
				</li>
			</ul>
		</div>
	</div>



	<div id="mainArea">
		<div id="div_nonvideoyou" style="display:none;background-color:black;background-image: Url(/bbChat/img/icon/non-video.png); background-repeat:no-repeat; background-position:center center;position:absolute;top:0;width:100%;height:100%;text-align: center;">
			<div style="padding-top:100px;;color:white;" id="notSupportBrowser">
				<h2 style="font-size: 30px;">접속하신 디바이스에 카메라가 지원되지 않습니다.</h2>
				<br>
				<h2 style="font-size: 30px;">현재 채팅 및 문서공유 기능만 이용 가능 합니다.</h2>
			</div>
		</div>
		<video  id="remoteyou" style="width: 100%; height: 100%" autoplay></video>
	</div>
	
	
</body>
</html>