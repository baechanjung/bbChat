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

<script type="text/javascript">
	function send() {
		init();
	}
</script>
  

</head>
<body>


<video id="vid1" autoplay></video>
<br>
<button id="btn1">Start</button>


룸:<input type='text' id='roomNm'   name='roomNm' />
유저:<input type='text' id='userNm'   name='userNm' />
<input type="button" onclick='send()' value='test시작'/>


	<div id="presentaionCnotainer" class="container" style="width: 100%;">
		<!-- 
		<button id="share-screen" class="setup">Share Your Screen</button>
		 -->
		<nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
            </div>

            <ul class="nav navbar-top-links navbar-right">
                <li class="dropdown" id="navChat">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="fa fa-comments fa-fw"></i>  
                    </a>
                </li>
                <!-- 
                <li class="dropdown" id="navUser">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="fa fa-user fa-fw"></i>  
                    </a>
                </li>
                -->
            </ul>
        </nav>

			
		<div id="chatbox" style="padding-top: 5px;left: 14px;right: 0px;">
			<div class="chat-panel panel panel-default" style="width:400px;">
	              <div class="panel-heading">
	                  <i class="fa fa-comments fa-fw"></i>
	                  Chat
	              </div>
	              <!-- /.panel-heading -->
	              <div >
	                  <ul class="chat" style='height: 300px;' id="messages">
	                  </ul>
	              </div>
	              <!-- /.panel-body -->
	              <div class="panel-footer">
	                  <div class="input-group">
	                      <input id="chatinput" type="text" class="form-control input-sm" placeholder="Type your message here..." />
	                      <span class="input-group-btn">
	                          <button class="btn btn-warning btn-sm" id="btn-chat">
	                              Send
	                          </button>
	                      </span>
	                  </div>
	              </div>
	              <!-- /.panel-footer -->
	        </div>
		</div>
		
		
		
                    
		<div class="menu-panel">
			<h3>PresenTation List</h3>
			<ul id="menu-toc" class="menu-toc">
				<div style="height: 750px;">
					<center>
						<ul id="slideList">
						</ul>
					</center>
				</div>
			</ul>
		</div>

		<div class="bb-custom-wrapper">
			<div id="mainArea" >
				<video  id="you" style="margin-left: 5px;" width="150" height="112" autoplay></video>
				<canvas id='canvasDraw' style="display: none;position: absolute;"></canvas>
				<img    id='canvasImg'  src='' style="width:1400px;height:700px;display: none;"/>
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

			<span style="margin-top:-10px;" id="tblcontents" class="menu-button">Table of Contents</span>
		</div>
	</div>

</body>
</html>