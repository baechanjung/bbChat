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
<script type="text/javascript" src="/bbChat/js/ZeroClipboard.min.js"></script>
<script type="text/javascript">
$(function(){
	ZeroClipboard.config({
		swfPath: '/bbChat/js/ZeroClipboard.swf',
		forceHandCursor: true
	});
	var clipboard = new ZeroClipboard($('#urlCopy'));
	clipboard.on('aftercopy', function(event) { alert('접속 URL이 복사되었습니다. \n'+event.data['text/plain']); });
});
</script>
</head>
<body>

	<div class="pop_container" style="padding:0px 35px 0px;">
		<!-- alert -->
		<div id="box1" class="box">
			<div class="single" style="text-align: left; padding: 0;">
				<p>https://www.brobb.co.kr/bizmeet/main?<%=request.getParameter("invite_url") %></p>
			</div>
			<a id="urlCopy" data-clipboard-text="https://www.brobb.co.kr/bizmeet/main?<%=request.getParameter("invite_url")%>">URL 복사하기</a>
		</div>
	</div>
	
</body>
</html>