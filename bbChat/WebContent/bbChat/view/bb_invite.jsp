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
<script type="text/javascript">
function ClipUrl(){
	var address = $(".single").find("p").html();
	var IE=(document.all)?true:false;
	if (IE) {
		if(confirm("초대하기 주소를 클립보드에 복사하시겠습니까?"))
			window.clipboardData.setData("Text", address);
	} else {
		temp = prompt("초대하기 주소입니다. Ctrl+C를 눌러 클립보드로 복사하세요", address);
	}
 
}
</script>
</head>
<body>

	<div class="pop_container" style="padding:0px 35px 0px;">
		<!-- alert -->
		<div id="box1" class="box">
			<div class="single" style="text-align: left; padding: 0;">
				<p>https://www.brobb.co.kr/bizMeet/room?<%=request.getParameter("invite_url") %></p>
			</div>
			<a style="cursor: pointer;" onclick="ClipUrl();" >URL 복사하기</a>
		</div>
	</div>
	
</body>
</html>