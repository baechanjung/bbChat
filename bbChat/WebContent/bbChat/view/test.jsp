<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
<meta name="viewport" content="width=device-width, initial-scale=1.0"> 
<meta name="description" content="Fullscreen Pageflip Layout with BookBlock" />
<meta name="keywords" content="fullscreen pageflip, booklet, layout, bookblock, jquery plugin, flipboard layout, sidebar menu" />
<meta name="author" content="Codrops" />

<title>My Presentation</title>
<%@ include file="/bbChat/inc/inc_0001_01.jsp" %>
<script type="text/javascript" src="/bbChat/js/webRtc/webrtc.io.js"></script>
<script type="text/javascript" src="/bbChat/js/webRtc/script.js"></script>
<script type="text/javascript">
	function send() {
		init();
	}
</script>
  

</head>
<body style="overflow:hidden;margin: 0;">

룸:<input type='text' id='roomNm'   name='roomNm' />
유저:<input type='text' id='userNm'   name='userNm' />
<input type="button" onclick='send()' value='test시작'/>


			<div id="mainArea" style='z-index:100;'>
				<video  id="you" style="margin-left: 5px;" autoplay></video>
				<canvas id='canvasDraw' style="display: none;position: absolute;"></canvas>
				<img    id='canvasImg'  src='' style="width:1400px;height:700px;display: none;"/>
			</div>
			
<div class="bb-custom-wrapper">
			<div id="test">
			</div>

			
			
			<div id="userListArea" class="panel panel-default" style="width:100%;height: 230px;margin-top:10px;display:none;">
	              <div class="panel-heading">
	                  <i class="fa fa-user fa-fw"></i>
	                  user
	              </div>
                  <div class="panel-body" style="height:190px;">
                  </div>
	        </div>
	        
			
			<nav style="margin-top:-10px;">
				<form id='pptForm' name="pptForm" enctype='multipart/form-data' method="post">
					<input id="ifile" type="file" style="height:32px;width:32px;position: absolute;left: 0px;top:0px;opacity:0;z-index: 100000000;display: none;" onchange="changeFile(this);" />
				</form>
				<span  id="sfile"  			style="background-image: url(/aaa.jpg);background-repeat:no-repeat;background-size:20px 20px; background-position:45% 45%;"></span>
				<span  id="share-screen"    style="left:40px;"> <i class="fa fa-desktop fa-fw" style="margin-top:10px;"></i>  </span>
				<span  id="share-exit"      style="left:40px;display: none;"> <i class="fa fa-times   fa-fw" style="margin-top:10px;"></i>  </span>
				<span  id="exit"   			style="background-image: url(/exit2.png);background-repeat:no-repeat;background-size:20px 20px; background-position:45% 45%;left:120px;display: none;"></span>
				<span onclick="preBtn  ()" id="pre"  style="left:40px;display: none;">&larr;</span>
				<span onclick="nextBtn ()" id="next" style="left:80px;display: none;">&rarr;</span>
			</nav>

</div>

</body>
</html>