<%@page contentType="text/html;charset=utf-8" %>
<%@page import="bbchat.util.exception.BbChatException"%> 
<%@page isErrorPage="true" %>
<%
response.setStatus(HttpServletResponse.SC_OK);

String strErrCode = request.getAttribute("javax.servlet.error.status_code").toString();
String strErrTitle  = "";
String strErrMsg    = "";

if("404".equals( strErrCode )){
	strErrTitle  = "요청하신 페이지를 찾을 수 없습니다.";
	strErrMsg    = "방문하시려는 페이지의 주소가 잘못 입력되었거나, 페이지의 주소가 변경 혹은 삭제되어 요청하신 페이지를 찾을 수 없습니다.<br/>";
	strErrMsg   += "입력하신 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.";
}else{
	if (exception instanceof BbChatException){
		BbChatException e =  (BbChatException)exception;
		strErrTitle  = "bizplay APP인증 처리 중 오류가 발생하였습니다.";
		strErrMsg    = e.getMessage(); 
	}else{
		strErrTitle  = "처리중 정의되지 않은 오류가 발생하였습니다.";
		strErrMsg    = "시스템관리자에게 해당 오류 내용을 전달 하였습니다.<br/>";
		strErrMsg   += "불편을 드려 죄송합니다.";
	}	
}
%>
<!DOCTYPE html>
<html>
<head>
	<title>error</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta http-equiv="Cache-Control" content="No-Cache" />
	<meta http-equiv="Pragma" content="No-Cache" />
</head>
<body>
<h3><%=strErrTitle%></h3>
<h4><%=strErrMsg%></h4>
</body>
</html>
