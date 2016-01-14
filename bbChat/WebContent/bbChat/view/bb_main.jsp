<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="weauth.provider.PClient"%>
<%@ page import="weauth.cmo.UserData"%>
<%@ page import="org.json.simple.parser.JSONParser"%>
<%@ page import="org.json.simple.JSONObject"%>
<%@ page import="java.util.*"%>
<%@ page import="bbchat.util.StringUtil"%>
<%
	// 공통 Util생성
	PClient pc 			= new PClient(request , response);
	String  strUserNm   = "";
	if( !"".equals( StringUtil.null2void(request.getParameter("RDM_KEY"),"") )){
		if( pc.keyVaildate(request.getParameter("RDM_KEY"))) {
			Map userData = pc.fnParse();
			
			strUserNm       = (String)userData.get( "USER_NM"        ); //시용자명
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
<script type="text/javascript">
	$(function(){
		$('#enterBtn').click(function(){
			if ($('#ROOM_NM').val() == "") {
				alert('접속코드를 입력해 주세요.');
				return;
			}
			if ($('#USER_NM').val() == "") {
				alert('닉네임을 입력해 주세요.');
				return;
			}
			
			$('#frm'    ).attr('action','/bizMeet/room');
			$('#joinGb' ).val ("J");
			$('#roomNm' ).val (encodeURI($('#ROOM_NM').val()));
			$('#userNm' ).val (encodeURI($('#USER_NM').val()));
			//$('#frm'    ).sumbit();			
			document.getElementById("frm").submit();
		}); 
		
		$('#startBtn').click(function(){
			if ($('#USER_NM').val() == "") {
				alert('닉네임을 입력해 주세요.');
				return;
			}
			
			$('#frm'    ).attr('action','/bizMeet/room');
			$('#joinGb' ).val ("S"	 );
			$('#roomNm' ).val (rand());
			$('#userNm' ).val (encodeURI($('#USER_NM').val()));
			document.getElementById("frm").submit();
		}); 
		
		var rand = function() {
			var text = "";
			var possible = "0123456789";

			for (var i = 0; i < 6; i++)
				text += possible.charAt(Math.floor(Math.random()* possible.length));

			return text;
		};


	});
</script>
</head>
<body>
<%=pc.getHeaderHtml() %> 
<header style='position: absolute;z-index:99; top: 50px; left: 150px;'>
	<h4>biz Meeting</h4>
	<h3>biz Meeting</h3>
	<h2>biz Meeting</h2>
	<h1>biz Meeting</h1>
</header>
<div id="dcMainView" style="width:100%;height: 100%;">
	<!-- container -->
	<div id="container" style="height: 100%;width: 100%; min-width: 1024px; position: relative;" >

		<!-- content -->
		<div style="position: relative; width:100%; min-height: 750px; height: 100% !important; background-size: cover; background-image: url(/bbChat/img/bg/bizMeet_main.png);background-repeat:no-repeat; background-position:50% 0%; background-color:#191919;">

				<!-- main -->
				<div style="position: fixed; right: 100px; top:45%;">
					<h1 style="font-weight:600;font-size: 2rem; color: rgb(28,173,64);margin-bottom: 5px;">소통의 시작</h1>
					<h3 style="font-weight:500;font-size: 2.5rem; color: rgb(6, 168, 232);">빠르고 쉬운 온라인 회의실</h3>
				</div>
				<div style="position: fixed; right: 233px; top:60%;">
					<form id='frm' method="post">
						<input id="joinGb"   name="joinGb"  type="hidden"></span> <!-- J : 기존회의참여 , S : 새로운회의시작 -->
						<div class="group">
							<input id="roomNm"   name="roomNm"  type="hidden"></span>
							<input id="ROOM_NM"  name="ROOM_NM" type="text" required maxlength="6"> <span class="highlight"></span>
							<span class="bar"></span> <label>접속코드</label>
						</div>
	
						<div class="group">
							<input id="userNm"   name="userNm" type="hidden"></span>
							<input id="USER_NM"  name="USER_NM" type="text" required value="<%=StringUtil.null2void(strUserNm, "")%>"> <span class="highlight"></span>
							<span class="bar"></span> <label>닉네임</label>
						</div>
						<div class="ipt_box" style="position:absolute; right:-125px;top:0px;">
							<a id="enterBtn" style="cursor:pointer;width: 112px;height: 45px; line-height:45px;background-color: rgb(28,173,64);" class="btn_login" >
								<span style="color:#2E3133;">회의참여</span>
							</a>
						</div>
						<div class="ipt_box" style="position:absolute; right:-125px;top:69px;">
							<a id="startBtn" style="cursor:pointer;width: 112px;height: 45px; line-height:45px;background-color: rgb(30, 168, 232);" class="btn_login" >
								<span style="color:#2E3133;">회의시작</span>
							</a>
						</div>
					</form>
				</div>
				<!-- //main -->

		</div>
		<!-- //content -->

	</div>
	<!-- //container -->

	<hr>

</div>
<%=pc.getFooterHtml()%>
</body>


</html>