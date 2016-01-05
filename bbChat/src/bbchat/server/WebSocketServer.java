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

@ServerEndpoint(value = "/websocket/manager")
public class WebSocketServer {
	
	static Set<Session> sessionUsers = Collections.synchronizedSet(new HashSet<Session>());
	
	private static Map<String,Object> rooms = new HashMap<String,Object>(); 
	private static Map<String,Object> users = new HashMap<String,Object>(); 

	@OnMessage
	public void onMessage(String message, Session userSession) throws IOException, InterruptedException {
		if( message.length() > 0 ){
			sendEvent(message, userSession);
		}
	}
	
	@OnOpen
	public void onOpen(Session userSession) {
		sessionUsers.add(userSession);
	}
	
	@OnClose
	public void onClose(Session userSession){
		
		// 활성중인 채팅방중 사용자의 채팅방을 찾는다. 
		for( Map.Entry<String,Object> key : rooms.entrySet() ){
			 
			//System.out.println( String.format("키 : %s", key.getKey() ) );
			 
			 int 	exist  		= rooms.get(key.getKey()).toString().indexOf(userSession.getId());
			 
			 // 활성중인 채팅방중 사용자 존재 확인.
			 if( exist > -1 ){
				 
				 List 		strUserList = (List)rooms.get(key.getKey()); // 채팅방의 사용자 리스트
				 List 		newUserList = new ArrayList();				 // 사용자 접속 종료 후 사용자 리스트
				 JSONObject sendData 	= null;
				 
				 
				 for(int i = 0; i < strUserList.size(); i++){
					 String socId = (String)strUserList.get(i);	// 채탕방의 사용자 세션ID 추출
					 
					 // 종료 사용자를 제외한 나머지 채팅방 사용자들에게 종료메세지 전송
					 if( socId != userSession.getId()){
						 newUserList.add(socId);

						 Session soc = getSocket(socId);

						 sendData = new JSONObject();
						 
						 

						 sendData.put("messages"	, users.get(userSession.getId())  + "(이)가 접속을 종료 하였습니다."	);
						 sendData.put("user"	   	, users.get(userSession.getId())									);
						 sendData.put("color"		, "ENTER"															);
						 
						 sockectSend(soc ,"receive_chat_msg", sendData );	   // 메세지 전송

						 sendData = new JSONObject();

						 sendData.put("socketId"	, userSession.getId()									);

						 sockectSend(soc ,"remove_peer_connected", sendData ); // 종료 사용자의 peer_connected 삭제 전송
					 }
				 }
				 
				 users.remove(userSession.getId());	// 사용자 정보 삭제
				 
				 if( newUserList.size() > 0){
					 rooms.put(key.getKey(), newUserList);
					 //System.out.println( " roomsUser    ===" + rooms.get(key.getKey()).toString());
				 }else{
					 rooms.remove(key.getKey());
					 //System.out.println( " 방삭제    ===");
				 }
				 
			 }
			 
		}
		
		sessionUsers.remove(userSession);	// 사용자 세션 정보 삭제
		//System.out.println( " sessionUsers ===" + sessionUsers.size());
	}
	
	// 이벤트 분기처리 함수
	public void sendEvent(String msg, Session userSession){
		
		try {
			JSONParser parser       = new JSONParser();
			JSONObject jResult   	= (JSONObject)parser.parse(msg);
			JSONObject jData    	= (JSONObject)jResult.get("data");
			String 	   eventNm 		= (String)jResult.get("eventName");
			
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
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	// 채팅방 참여시 처리 함수
	public void joinRoom( JSONObject data, Session socket ){
		String strRoom  	 = (String)data.get("room");
		String strUser  	 = (String)data.get("user");
		List   roomUserlist  = new ArrayList();
		List   connectionsId = new ArrayList();
		
		JSONObject sendData  = null;
		
		System.out.println("rooms == " + rooms.toString() );

		if( rooms.get(strRoom) != null ){
			roomUserlist = (List)rooms.get(strRoom);
		}
		roomUserlist.add(socket.getId());
		
		rooms.put(strRoom, roomUserlist);
		users.put(socket.getId(), strUser);
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			String id = (String)roomUserlist.get(i);
			
			if (id == socket.getId()) {
				continue;
			}else{
				connectionsId.add(id);
				
				Session soc = getSocket(id);
				
				if(soc != null){
					
					sendData = new JSONObject();
					
					sendData.put("socketId", socket.getId());
					
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
		sendData.put("connections"	,	connectionsId	);
		sendData.put("you"			,	socket.getId()	);
		
		sockectSend(socket ,"get_peers", sendData );
		
		
		System.out.println( users.toString() );
		
	}

	
	// 채팅방 채팅 메세지 처리 함수
	public void chatMsg( JSONObject data, Session socket ){
		String strRoom  	 = (String)data.get("room");
		String strUser  	 = (String)data.get("user");
		String strColor  	 = (String)data.get("color");
		String strMsg	  	 = (String)data.get("messages");
		
		List   roomUserlist  = (List)rooms.get(strRoom);
		
		JSONObject sendData  = null;
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			String id = (String)roomUserlist.get(i);

			if (id != socket.getId()) {
				
				Session soc = getSocket(id);
				
				sendData = new JSONObject();
				
				sendData.put("messages"	, strMsg	);
				sendData.put("user"		, strUser	);
				sendData.put("color"	, strColor	);
				
				sockectSend(soc ,"receive_chat_msg", sendData );
				
			}
		}
		
	}
	
	public void sendIceCandidate( JSONObject data, Session socket ){
		String  strSoc  = (String)data.get("socketId");

		Session soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("label"		, data.get("label")		);
			sendData.put("candidate"	, data.get("candidate")	);
			sendData.put("socketId"		, socket.getId()		);
			
			sockectSend(soc ,"receive_ice_candidate", sendData );
		}
	}
	
	public void sendOffer( JSONObject data, Session socket ){
		String  strSoc  = (String)data.get("socketId");

		Session soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("sdp"		, data.get("sdp")		);
			sendData.put("socketId"	, socket.getId()		);
			
			sockectSend(soc ,"receive_offer", sendData );
		}
	}
	
	public void sendAnswer( JSONObject data, Session socket ){
		String  strSoc  = (String)data.get("socketId");

		Session soc 	= getSocket(strSoc);
		
		if(soc != null){
			
			JSONObject sendData = new JSONObject();
			
			sendData.put("sdp"		, data.get("sdp")		);
			sendData.put("socketId"	, socket.getId()		);
			
			sockectSend(soc ,"receive_answer", sendData );
		}
	}
	
	
	public Session getSocket(String id){
		Session soc = null;
		
		Iterator<Session> iterator = sessionUsers.iterator();
		while(iterator.hasNext()){
			Session s = iterator.next();
			
			if(id.equals(s.getId())){
				return s;
			}
		}
		return soc;
	}
	
	
	public void sockectSend( Session soc , String eventNm, JSONObject json){
		
		JSONObject jmsg  = new JSONObject();
		
		jmsg.put("eventName", eventNm );
		jmsg.put("data"		, json	  );
		
		try {
			
			//System.out.println("sockectSend === " + jmsg.toString());
			soc.getBasicRemote().sendText(jmsg.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
}

