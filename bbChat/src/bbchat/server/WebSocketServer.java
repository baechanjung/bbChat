package bbchat.server;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

@ServerEndpoint(value = "/websocket/bbchat")
public class WebSocketServer {
	
	static Set<Session> sessionUsers = Collections.synchronizedSet(new HashSet<Session>());
	
	private static Map<String,Object> rooms = new HashMap<String,Object>(); 
	private static Map<String,Object> users = new HashMap<String,Object>(); 
	private static Map<String,Object> imgs  = new HashMap<String,Object>(); 

	@OnMessage
	public void onMessage(String message, Session userSession) throws IOException, InterruptedException {
		
		System.out.println( "##############################################" );
		System.out.println( "########## WebSocketServer onMessage##########" );
		System.out.println( "##############################################" );
		System.out.println( "message =========                             " + message );
		
		if( message.length() > 0 ){
			sendEvent(message, userSession);
		}
	}
	
	@OnOpen
	public void onOpen(Session userSession) {
		
		System.out.println( "############################################" );
		System.out.println( "########## WebSocketServer onOpen ##########" );
		System.out.println( "############################################" );
		
		sessionUsers.add(userSession);
	}
	
	@OnClose
	public void onClose(Session userSession){
		
		System.out.println( "############################################" );
		System.out.println( "########## WebSocketServer onClose##########" );
		System.out.println( "############################################" );
		
		int 		exist  			= 0;
		String		socId           = "";	// 채탕방의 사용자 세션ID 추출
		Session 	soc				= null; 
		List 		strUserList 	= null; // 채팅방의 사용자 리스트
		List 		newUserList 	= null;	// 사용자 접속 종료 후 사용자 리스트
		JSONObject 	sendData 		= null;
		
		
		// 활성중인 채팅방중 사용자의 채팅방을 찾는다. 
		for( Map.Entry<String,Object> key : rooms.entrySet() ){

			exist  		= rooms.get(key.getKey()).toString().indexOf(userSession.getId());

			// 활성중인 채팅방중 사용자 존재 확인.
			if( exist > -1 ){

				strUserList  = (List)rooms.get(key.getKey()); // 채팅방의 사용자 리스트
				newUserList  = new ArrayList();				 // 사용자 접속 종료 후 사용자 리스트

				for(int i = 0; i < strUserList.size(); i++){
					
					socId = (String)strUserList.get(i);	// 채탕방의 사용자 세션ID 추출

					// 종료 사용자를 제외한 나머지 채팅방 사용자들에게 종료메세지 전송
					if( socId != userSession.getId()){
						
						soc = getSocket(socId);
						
						newUserList.add(socId);

						sendData = new JSONObject();
						sendData.put("messages"	, users.get(userSession.getId())  + "(이)가 접속을 종료 하였습니다."	);
						sendData.put("user"	   	, users.get(userSession.getId())									);
						sendData.put("color"	, "ENTER"															);
						sockectSend(soc ,"receive_chat_msg", sendData );	   // 메세지 전송

						sendData = new JSONObject();
						sendData.put("socketId"	, userSession.getId()									);
						sockectSend(soc ,"remove_peer_connected", sendData ); // 종료 사용자의 peer_connected 삭제 전송
					}
				}

				users.remove(userSession.getId());	// 사용자 정보 삭제

				if( newUserList.size() > 0){
					rooms.put(key.getKey(), newUserList);
				}else{
					rooms.remove(key.getKey());
				}
			}
		}
		sessionUsers.remove(userSession);	// 사용자 세션 정보 삭제
		System.out.println( " sessionUsers ===" + sessionUsers.size());
	}
	
	// 이벤트 분기처리 함수
	public void sendEvent(String msg, Session userSession){
		
		try {
			JSONParser 		parser       	= new JSONParser();
			JSONObject 		jResult   		= (JSONObject)parser.parse(msg);
			JSONObject 		jData    		= (JSONObject)jResult.get("data");
			String 	   		eventNm 		= (String)jResult.get("eventName");
			
			if( "join_room".equals(eventNm) ){
				joinRoom (jData , userSession);
			}else if( "chat_msg".equals(eventNm) ){
				chatMsg  (jData , userSession);
			}else if( "send_ice_candidate".equals(eventNm) ){
				sendIceCandidate  (jData , userSession);
			}else if( "send_offer".equals(eventNm) ){
				sendOffer  (jData , userSession);
			}else if( "send_answer".equals(eventNm) ){
				sendAnswer  (jData , userSession);
			}else if( "show_Loding".equals(eventNm) ){
				showLoding  (jData , userSession);
			}else if( "hideLoding".equals(eventNm) ){
				hideLoding  (jData , userSession);
			}else if( "up_percentage".equals(eventNm) ){
				upPercentage  (jData , userSession);
			}else if( "convert_Loding".equals(eventNm) ){
				convertLoding  (jData , userSession);
			}else if( "fileConvertSend".equals(eventNm) ){
				fileConvert  (jData , userSession);
			}else if( "imgListClick".equals(eventNm) ){
				imgListClick  (jData , userSession);
			}else if( "closePT".equals(eventNm) ){
				closePT  (jData , userSession);
			}else if( "mousedown".equals(eventNm) ){
				mousedown  (jData , userSession);
			}else if( "mouseup".equals(eventNm) ){
				mouseup  (jData , userSession);
			}else if( "drawClick".equals(eventNm) ){
				drawClick  (jData , userSession);
			}else if( "get_div_user".equals(eventNm) ){
				getDivUser  (jData , userSession);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	// 채팅방 참여시 처리 함수
	public void joinRoom( JSONObject data, Session socket ){
		String 		 strRoom  	 	= (String)data.get("room");
		String		 strUser  	 	= (String)data.get("user");
		String 		 strImg    	 	= (String)data.get("img");
		String 		 strGb  	    = (String)data.get("gb");
		String 		 id             = ""; 
		Object 		 objStream      = (Object)data.get("stream"); 
		List   		 roomUserlist  	= new ArrayList();
		List   		 connectionsId	= new ArrayList();
		JSONObject 	 sendData  		= null;
		Session 	 soc			= null; 
		
		// 기존 회의실 참여시 없는 방일 경우 처리
		if( "J".equals(strGb) && rooms.get(strRoom) == null ){
			sockectSend(socket ,"empty_room", sendData );
			return;
		}
		
		if( rooms.get(strRoom) != null ){
			roomUserlist = (List)rooms.get(strRoom);
		}
		roomUserlist.add(socket.getId());
		
		rooms.put(strRoom, roomUserlist);
		users.put(socket.getId(), strUser);
		imgs.put(socket.getId() , strImg );
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);
			
			if (id == socket.getId()) {
				continue;
			}else{
				connectionsId.add(id);
				
				soc = getSocket(id);
				
				if(soc != null){
					
					sendData = new JSONObject();
					sendData.put("socketId"	, socket.getId());
					sendData.put("stream"	, objStream		);
					sockectSend(soc ,"new_peer_connected", sendData );
					
					sendData = new JSONObject();
					sendData.put("messages"	, strUser + "(이)가 접속 하였습니다."	);
					sendData.put("user"	   	, strUser							);
					sendData.put("color"	, "ENTER"							);
					sockectSend(soc ,"receive_chat_msg", sendData );
				}
			}
		}
		
		sendData = new JSONObject();
		sendData.put("connections"	,	connectionsId	);  // 회의실 안의 나아닌 다른 컨넥션 배열
		sendData.put("you"			,	socket.getId()	);
		sendData.put("stream"		, 	objStream		);
		
		sockectSend(socket ,"get_peers", sendData );
	}

	
	// 채팅방 채팅 메세지 처리 함수
	public void chatMsg( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("room");
		String 		strUser  	 	= (String)data.get("user");
		String 		strColor  	 	= (String)data.get("color");
		String 		strMsg	  	 	= (String)data.get("messages");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("messages"	, strMsg					);
				sendData.put("user"		, strUser					);
				sendData.put("color"	, strColor				    );
				sendData.put("img"		, imgs.get(socket.getId())	);
				sendData.put("id"		, socket.getId()			);
				sockectSend(soc ,"receive_chat_msg", sendData );
				
			}
		}
	}
	
	// 이미지 리스트 전송 함수
	public void fileConvert( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		strFileNm  	 	= (String)data.get("FILE_NM");
		String 		strOrgFileNm 	= (String)data.get("ORG_FILE_NM");
		String 		strSize  	 	= (String)data.get("SIZE");
		String 		strMode  	 	= (String)data.get("MODE");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("FILE_NM"		, strFileNm			);
				sendData.put("SIZE"			, strSize			);
				sendData.put("ORG_FILE_NM"	, strOrgFileNm		);
				sendData.put("MODE"			, strMode			);
				sendData.put("SHARE_ID"		, socket.getId()	);
				sockectSend(soc ,"imgList", sendData );
			}
		}
		
	}
	
	// 이미지 리스트 클릭 함수
	public void imgListClick( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		strPath  	 	= (String)data.get("PATH");
		String 		strIdx	  	 	= (String)data.get("IDX");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("PATH"	, strPath	);
				sendData.put("IDX"	, strIdx	);
				sockectSend(soc ,"imgChange", sendData );
			}
		}
		
	}
	
	
	public void showLoding( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		strUser  	 	= (String)data.get("USER");
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		String 		id              = ""; 
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("user"	, strUser	);
				sockectSend(soc ,"showLoding", sendData );
				
			}
		}
	}
	
	public void hideLoding( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id  = (String)roomUserlist.get(i);
			soc = getSocket(id);
			sockectSend(soc ,"hideLoding", null );
		}
	}
	
	public void upPercentage( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		strPer  	 	= (String)data.get("PER");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		Session 	soc				= null; 
		JSONObject 	sendData  		= null;

		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id  = (String)roomUserlist.get(i);
			
			if (id != socket.getId()) {
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("per"	, strPer	);
				sockectSend(soc ,"up_percentage", sendData );
			}
			
		}
	}
	
	
	public void convertLoding( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				soc = getSocket(id);
				sockectSend(soc ,"convertLoding", null );
			}
		}
	}
	
	public void closePT( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					sockectSend(soc ,"closePT", null );
				}
				
			}
		}
	}
	
	public void mousedown( JSONObject data, Session socket ){
		String 		strRoom  	 	 = (String)data.get("room");
		Long 		strX			 = (Long)data.get("x");
		Long 		strY  			 = (Long)data.get("y");
		String 		strSendX  		 = (String)data.get("sendX");
		String 		strSendY  		 = (String)data.get("sendY");
		String 		id               = ""; 
		boolean 	strClick  	 	 = (boolean)data.get("click");
		List   		roomUserlist     = (List)rooms.get(strRoom);
		JSONObject 	sendData  		 = null;
		Session 	soc				 = null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					sendData = new JSONObject();
					sendData.put("x"		, strX		);
					sendData.put("y"		, strY		);
					sendData.put("sendX"	, strSendX	);
					sendData.put("sendY"	, strSendY	);
					sendData.put("click"	, strClick	);
					sockectSend(soc ,"mDown", sendData );
				}
				
			}
		}
	}
	
	public void mouseup( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("room");
		String 		id              = ""; 
		boolean 	strClick  	 	= (boolean)data.get("click");
		List  	 	roomUserlist  	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					sendData = new JSONObject();
					sendData.put("click"	, strClick	);
					sockectSend(soc ,"mUp", sendData );
				}
				
			}
		}
	}
	
	public void drawClick( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("room");
		Long 		strX		  	= (Long)data.get("x");
		Long 		strY  		 	= (Long)data.get("y");
		String 		strSendX  	 	= (String)data.get("sendX");
		String 		strSendY  	 	= (String)data.get("sendY");
		String 		id              = ""; 
		List   		roomUserlist  	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id = (String)roomUserlist.get(i);
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					
					sendData = new JSONObject();
					sendData.put("x"		, strX		);
					sendData.put("y"		, strY		);
					sendData.put("sendX"	, strSendX	);
					sendData.put("sendY"	, strSendY	);
					sockectSend(soc ,"draw", sendData );
				}
				
			}
		}
	}
	
	
	public void getDivUser( JSONObject data, Session socket ){
		String 		strId  	 	= (String)data.get("id");
		String 		user 	 	= (String)users.get(strId);
		JSONObject 	sendData  	= new JSONObject();
		
		sendData.put("user"	, user 		);
		sendData.put("id"	, strId 	);
		
		sockectSend(socket ,"div_user", sendData );
		
	}
	
	
	public void sendIceCandidate( JSONObject data, Session socket ){
		String  	strSoc  = (String)data.get("socketId");
		Session 	soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("label"		, data.get("label")		);
			sendData.put("candidate"	, data.get("candidate")	);
			sendData.put("socketId"		, socket.getId()		);
			
			sockectSend(soc ,"receive_ice_candidate", sendData );
		}
	}
	
	public void sendOffer( JSONObject data, Session socket ){
		String  	strSoc  = (String)data.get("socketId");
		Session 	soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("sdp"		, data.get("sdp")		);
			sendData.put("socketId"	, socket.getId()		);
			sockectSend(soc ,"receive_offer", sendData );
		}
	}
	
	public void sendAnswer( JSONObject data, Session socket ){
		String  	strSoc  = (String)data.get("socketId");
		Session 	soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("sdp"		, data.get("sdp")		);
			sendData.put("socketId"	, socket.getId()		);
			sockectSend(soc ,"receive_answer", sendData );
		}
	}
	
	
	public static Session getSocket(String id){
		Session 		  soc 		= 	null;
		Iterator<Session> iterator  = sessionUsers.iterator();
		Session			  s			= null;
		while(iterator.hasNext()){
			s = iterator.next();
			
			if(id.equals(s.getId())){
				return s;
			}
		}
		return soc;
	}
	
	
	public static void sockectSend( Session soc , String eventNm, JSONObject json){
		
		JSONObject jmsg  = new JSONObject();
		
		jmsg.put("eventName"	, eventNm );
		jmsg.put("data"			, json	  );
		
		try {
			soc.getBasicRemote().sendText(jmsg.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	public static void fileConverPercent(String strRoom, String totPage, String curPage){
		System.out.println("###################################" + totPage);
		System.out.println("###################################" + curPage );
		String		id				= "";
		List   		roomUserlist 	= (List)rooms.get(strRoom);
		JSONObject 	sendData  		= null;
		Session		soc				= null;
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			id 		= (String)roomUserlist.get(i);
			soc 	= getSocket(id);
			
			if(soc != null){
				
				sendData = new JSONObject();
				
				sendData.put("totPage"	, totPage		);
				sendData.put("curPage"	, curPage		);
				sockectSend(soc ,"convert_percentage", sendData );
			}
				
		}
		
	}
	
	public static Map<String, Object> getRoomList(){
		return rooms;
	}
	
}

