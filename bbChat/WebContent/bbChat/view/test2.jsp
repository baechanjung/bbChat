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
<link href="/bbChat/css/lightSlider.css"   		rel="stylesheet">
<script type="text/javascript" src="/bbChat/js/jquery.lightSlider.js"></script>

<script>
	$(document).ready(function() {
		$("#demo").lightSlider({
			 vertical : true
			,item:6
			,slideMove:6
			,enableTouch:false
			,enableDrag:false
			,verticalHeight:900
		});
	});
</script>

</head>
<body style="overflow:hidden;margin: 0;">

<div style="position: absolute; top: 0px; width: 100%; height: 100%;">

	<div style="position: absolute; top: 0px;left: 0px;bottom: 0px;width: 240px;  border-right: 5px solid #c0d0d9;overflow: hidden;z-index: 100000;overflow-x: hidden;  overflow-y: auto; background-color: rgb(158,191,228)">
        <ul id="demo" style="height: 750px;">
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
			</li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
            <li>
				<div style="padding-top: 10px;">
					<div style="padding-left: 40px;">1</div>
					<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" style="width: 150px; height: 100px; cursor: pointer; margin-left: 43px; border: 2px solid black;">
				</div>
            </li>
        </ul>
    </div>	
    <!-- 
	<div style="position: absolute; top: 0px;left: 0px;bottom: 0px;width: 188px;border-right: 5px solid #c0d0d9;overflow: hidden;z-index: 100000;overflow-x: hidden;overflow-y: auto; background-color: rgb(158,191,228)">
		<div style="padding-top: 10px;">
			<div style="padding-left: 10px;" >1</div>
			<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" 		 style="width: 160px;height: 100px; cursor: pointer;margin-left: 15px; border:2px solid black;">
		</div>
		
		<div style="padding-top: 10px;">
			<div style="padding-left: 10px;" >200</div>
			<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" 		 style="width: 160px;height: 100px; cursor: pointer;margin-left: 15px; border:2px solid black;">
		</div>
		
	</div>
     -->
	<div style="position: absolute;top: 0px;bottom: 0px;left: 0px;right: 0px;text-align: center;z-index: 100;overflow: hidden; background-color: rgb(131,175,226)">
	</div>
	<div style="position: absolute;top: 40px;bottom: 0px;left: 0px;right: 0px;text-align: left;z-index: 100;overflow: hidden; background-color: rgb(131,175,226)">
		<div style="height: 100%;margin-left: 241px;">
			<img title="회의종료" src="/bbChat/img/bg/bb_main.jpg" 		 style="width: 98%;height: 98%; cursor: pointer;margin-left: 15px; border:2px solid black;">
		</div>
	</div>
</div>

</body>
</html>