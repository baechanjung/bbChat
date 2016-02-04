<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="weauth.provider.PClient"%>
<%@ page import="weauth.cmo.UserData"%>
<%@ page import="org.json.simple.parser.JSONParser"%>
<%@ page import="org.json.simple.JSONObject"%>
<%@ page import="java.util.*"%>
<%@ page import="bbchat.util.StringUtil"%>
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
	/* @web font */
	@font-face{font-family:'NanumGothic';font-style:normal;font-weight:normal;src:local("※"),url(/bbChat/font/NanumGothic.eot);src:url(/bbChat/font/NanumGothic.eot?#iefix) format('embedded-opentype'),url(/bbChat/font/NanumGothic.woff2) format('woff2'),url(/bbChat/font/NanumGothic.woff) format('woff'),url(/bbChat/font/NanumGothic.ttf) format('truetype');}
	
	/*========================BASE========================*/
	html, body {
		height: 100%;
	}

	body {
		margin: 0;
		padding: 0;
		font-family: NanumGothic,'나눔고딕',dotum,'돋움',sans-serif;
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
		background-color: #E6E6E6;
		/*background-image: url(/bbChat/img/bg/bg_banner.png);*/
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
		background-color: #B04EF0;
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
	  background:#B04EF0; 
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
});
</script>
</head>
<body>
	<!-- wrap -->
	<div class="wrap index">
	
		<!-- content -->
		<div class="content_wrap">
	
			<!-- content_inner --> 
			<div class="content_inner">

				<div style="padding:10px 0 0;color:; id="notSupportBrowser">
					<h1 style="font-size: 80px;"><img src="/bbChat/img/sadface.png"/></h1>
					<h2 style="font-size: 30px;">접속하신 인터넷 브라우저에서는 Biz Meeting을 이용하실 수 없습니다.</h2>
					<!-- h2 style="font-size: 30px;">BizMeeting은 구글 크롬, 모질라 파이어폭스 브라우저에서만 실행 됩니다.</h2 -->
					<h2 style="font-size: 30px;">최신 크롬, 파이어폭스 브라우저로 재접속 바랍니다.</h2>
					<h2 style="font-size: 20px;margin-top: 50px;">크롬 또는 파이어폭스 브라우저가 없으시다면</h2>
					<h2 style="font-size: 20px;">아래의 다운로드 링크를 이용하여 다운로드 해주시기 바랍니다.</h2>
					<div style="margin-top: 30px;">
						<a style="width: 80px;display: inline-block;padding-right: 50px;color: ;" href="https://www.google.com/intl/ko/chrome/browser/" target="_blank"> 
							<h3>크롬</h3>
							<img src="/bbChat/img/chrome-128x128.png" style="width:70px;" />
						</a>
						&nbsp;&nbsp;&nbsp;
						<a style="width: 80px;display: inline-block;padding-left: 50px;color: ;" href="https://www.mozilla.org/ko/firefox/new/" target="_blank"> 
							<h3>파이어폭스</h3>
							<img src="/bbChat/img/firefox-128x128.png" style="width:70px;" />
						</a>
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