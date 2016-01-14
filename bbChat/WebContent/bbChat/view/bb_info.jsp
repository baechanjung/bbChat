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
	function confirmFn() {
		var item = {};
		item["USER_NM"] = $("#USER_NM").val();
		closeLayer("callinit",item);	
	};
</script>
</head>
<body>

	<div class="pop_container" style="padding:0px 35px 0px;">
		<!-- alert -->
		<div id="box1" class="box">
			<div class="single" style="text-align: left; padding: 0;">
				<p>닉네임을 설정해 주세요.</p>
			</div>
			
			<div class="group" >
				<input id="USER_NM"  name="USER_NM" type="text" required> <span class="highlight"></span>
				<span class="bar"></span> <label>닉네임</label>
			</div>
		</div>
	</div>
	
</body>
</html>