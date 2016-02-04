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
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import bbchat.com.bbLogManager;

@ServerEndpoint(value = "/websocket/bbchat")
public class WebSocketServer {
	
	static Set<Session> sessionUsers = Collections.synchronizedSet(new HashSet<Session>());
	
	private static Map<String,Object> rooms = new HashMap<String,Object>(); 

	@OnMessage
	public void onMessage(String message, Session userSession) throws IOException, InterruptedException {
		
		bbLogManager.bbLog("DEBUG", "message =============================" + message.toString() );
		
		if( message.length() > 0 ){
			sendEvent(message, userSession);
		}
	}
	
	@OnOpen
	public void onOpen(Session userSession) {
		
		bbLogManager.bbLog("DEBUG", "############################################" 						);
		bbLogManager.bbLog("DEBUG", "########## WebSocketServer onOpen ##########" 						);
		bbLogManager.bbLog("DEBUG", "############################################" 						);
		bbLogManager.bbLog("DEBUG", "접속 socket Id =============================" + userSession.getId() );
		
		sessionUsers.add(userSession);
	}
	
	@OnClose
	public void onClose(Session userSession){
		
		bbLogManager.bbLog("DEBUG", "############################################" );
		bbLogManager.bbLog("DEBUG", "########## WebSocketServer onClose##########" );
		bbLogManager.bbLog("DEBUG", "############################################" );
		bbLogManager.bbLog("DEBUG", "종료 소켓 =============================" + userSession.getId() );
		
		String		socId           = "";	// 채탕방의 사용자 세션ID 추출
		Session 	soc				= null; 
		List 		strUserList 	= null; // 채팅방의 사용자 리스트
		List 		newUserList 	= null;	// 사용자 접속 종료 후 사용자 리스트
		List 		tmpUserList 	= null;	// 임시 사용자 리스트
		Map 		tmpUserInfo 	= null;	// 임시 사용자 정보
		Map 		getUserInfo 	= null;	// 채팅방의 사용자 정보
		Map 		setUserInfo 	= null;
		JSONObject 	sendData 		= null;
		boolean     breakYn         = false;
		
		
		// 활성중인 채팅방중 사용자의 채팅방을 찾는다. 
		for( Map.Entry<String,Object> key : rooms.entrySet() ){
			
			tmpUserList = getUserList(key.getKey());
			strUserList = getUserList(key.getKey());
			
			for( int z = 0 ; z < tmpUserList.size(); z ++ ){
				tmpUserInfo = (Map)tmpUserList.get(z);
				
				// 활성중인 채팅방중 사용자 존재 확인.
				if( userSession.getId() == tmpUserInfo.get("SOCKET_ID") ){

					newUserList  = new ArrayList();				  // 사용자 접속 종료 후 사용자 리스트

					for(int i = 0; i < strUserList.size(); i++){
						
						getUserInfo = (Map)strUserList.get(i);
						socId 		= (String)getUserInfo.get("SOCKET_ID");	// 채탕방의 사용자 세션ID 추출

						// 종료 사용자를 제외한 나머지 채팅방 사용자들에게 종료메세지 전송
						if( socId != userSession.getId()){
							
							soc = getSocket(socId);
							
							setUserInfo 	= new HashMap();
							
							setUserInfo.put("SOCKET_ID"		, (String)getUserInfo.get("SOCKET_ID")			);	// 소켓ID
							setUserInfo.put("USER_NM"		, (String)getUserInfo.get("USER_NM")			);	// 닉네임
							setUserInfo.put("IMG"			, (String)getUserInfo.get("IMG")				);	// 이미지
							setUserInfo.put("VIDEO_YN"		, (Object)getUserInfo.get("VIDEO_YN")			);	// 카메라지원여부
							
							newUserList.add(setUserInfo);

							sendData = new JSONObject();
							sendData.put("messages"	, tmpUserInfo.get("USER_NM")  + "(이)가 접속을 종료 하였습니다."	);
							sendData.put("user"	   	, tmpUserInfo.get("USER_NM")									);
							sendData.put("color"	, "ENTER"														);
							sockectSend(soc ,"receive_chat_msg", sendData );	   // 메세지 전송
							
							sendData = new JSONObject();
							sendData.put("socketId"	, tmpUserInfo.get("SOCKET_ID")	);
							sendData.put("stream"	, tmpUserInfo.get("VIDEO_YN")	);
							sockectSend(soc ,"remove_peer_connected", sendData 		); // 종료 사용자의 peer_connected 삭제 전송
						
						}
					}

					if( newUserList.size() > 0){
						setUserList( key.getKey(), newUserList );
						bbLogManager.bbLog("DEBUG", userSession.getId() +" 소켓 종료 후["+key.getKey()+"] 사용자 정보 =============================" + newUserList.toString() );
						
					}else{
						rooms.remove(key.getKey());
						bbLogManager.bbLog("DEBUG", userSession.getId() +" 소켓 종료 후["+key.getKey()+"] room 삭제되었습니다." );
					}
					breakYn = true;
				}
				
				if(breakYn)
					break;
			}

			if(breakYn)
				break;
			
		}
		
		sessionUsers.remove(userSession);	// 사용자 세션 정보 삭제
		bbLogManager.bbLog("DEBUG", userSession.getId() +" 소켓 삭제 완료" );
		bbLogManager.bbLog("DEBUG", userSession.getId() +" 소켓 삭제 완료 후 세션 수 ===== " + sessionUsers.size());
		bbLogManager.bbLog("DEBUG", userSession.getId() +" 소켓 삭제 완료 룸 수 	  ===== " + rooms.size());
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
			}else if( "canvasClear".equals(eventNm) ){
				canvasClear  (jData , userSession);
			}else if( "get_div_user".equals(eventNm) ){
				getDivUser  (jData , userSession);
			}else if( "alive_client".equals(eventNm) ){
				aliveClient  (jData , userSession);
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
		String       id				= "";
		Object 		 objStream      = (Object)data.get("stream"); 
		Object 		 videoYn	    = null; 
		List   		 roomUserlist  	= new ArrayList();
		List   		 connectionsId	= new ArrayList();
		List   		 notVideosId	= new ArrayList();
		List   		 videosId		= new ArrayList();
		Map   		 roomFile		= getFile(strRoom);
		Map			 setUserInfo    = new HashMap();
		Map 		 getUserInfo    = null; 
		JSONObject 	 sendData  		= null;
		Session 	 soc			= null; 
		
		
		// 기존 회의실 참여시 없는 방일 경우 처리
		if( "J".equals(strGb) && getUserList(strRoom) == null ){
			sockectSend(socket ,"empty_room", sendData );
			return;
		}
		
		if( getUserList(strRoom) != null ){
			roomUserlist = getUserList(strRoom);
		}
		
		setUserInfo.put("SOCKET_ID"		, socket.getId()	);	// 소켓ID
		setUserInfo.put("USER_NM"		, strUser			);	// 닉네임
		setUserInfo.put("IMG"			, strImg			);	// 이미지
		setUserInfo.put("VIDEO_YN"		, objStream			);	// 카메라지원여부
		
		roomUserlist.add(setUserInfo);
		
		setUserList(strRoom , roomUserlist);
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			videoYn		= (Object)getUserInfo.get("VIDEO_YN"); 
			
			if (id == socket.getId()) {
				continue;
			}else{
				if ( videoYn != null ){
					connectionsId.add(id);	
					videosId.add(getUserInfo);	
				}else{
					notVideosId.add(getUserInfo);
				}
				
				soc = getSocket(id);
				
				if(soc != null){
					
					sendData = new JSONObject();
					sendData.put("socketId"	, socket.getId());
					sendData.put("user"	   	, strUser		);
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
		sendData.put("connections"	,	connectionsId	);  // 회의실 안의 나아닌 카메라 있는 사람의 소켓아이디 리스트
		sendData.put("notvideos"	,	notVideosId		);  // 회의실 안의 나아닌 카메라가 없는 사람 정보
		sendData.put("videos"		,	videosId		);  // 회의실 안의 나아닌 카메라가 있는 사람 정보
		sendData.put("you"			,	socket.getId()	);
		sendData.put("stream"		, 	objStream		);
		
		sockectSend(socket ,"get_peers", sendData );
		
		if( roomFile != null ){
			List 		fileList = (List)roomFile.get("FILE_LIST");
			Map  		fileMap  = new HashMap();
			JSONObject 	fileJson = new JSONObject();
			JSONArray  	fileArr  = new JSONArray();
			for(int i = 0 ; i < fileList.size(); i++ ){
				fileMap  = (Map)fileList.get(i);
				fileJson = new JSONObject();
				
				fileJson.put("FILE_NM"		, fileMap.get("FILE_NM")	);
				fileJson.put("SIZE"			, fileMap.get("SIZE")		);
				fileJson.put("ORG_FILE_NM"	, fileMap.get("ORG_FILE_NM"));
				
				fileArr.add(fileJson);
			}
			sendData = new JSONObject();
			
			sendData.put("FILE_LIST"		, 	fileArr								);
			sendData.put("FILE_SHOW"		, 	roomFile.get("FILE_SHOW")			);
			sendData.put("FILE_SHARE_ID"	, 	roomFile.get("FILE_SHARE_ID")		);
			sendData.put("FILE_IDX"			, 	roomFile.get("FILE_IDX")			);
			
			sockectSend(socket ,"room_file_append", sendData );
		}
	}
	
	// 소켓연결유지
	public void aliveClient( JSONObject data, Session socket ){
		bbLogManager.bbLog("DEBUG", "aliveClient 소켓 ID =============================" + socket.getId() );
	}
	
	// 채팅방 채팅 메세지 처리 함수
	public void chatMsg( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("room");
		String 		strUser  	 	= (String)data.get("user");
		String 		strColor  	 	= (String)data.get("color");
		String 		strMsg	  	 	= (String)data.get("messages");
		String 		img             = (String)data.get("img"); 
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null;
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				sendData = new JSONObject();
				sendData.put("messages"	, strMsg					);
				sendData.put("user"		, strUser					);
				sendData.put("color"	, strColor				    );
				sendData.put("img"		, img						);
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
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null;
		
		
		System.out.println("roomUserlist =================== " + roomUserlist.size());
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID");
			
			if( i == 0 ){
				
				sendData = new JSONObject();
				sendData.put("FILE_NM"		, strFileNm			);
				sendData.put("SIZE"			, strSize			);
				sendData.put("ORG_FILE_NM"	, strOrgFileNm		);
				sendData.put("MODE"			, strMode			);
				sendData.put("SHARE_ID"		, socket.getId()	);
				
				setFileShare(strRoom , socket.getId());
				
				if( "U".equals(strMode) ){
					setFile(strRoom , sendData);
				}
			}

			if (id != socket.getId()) {
				
				soc = getSocket(id);

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
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		setFileIdx	( strRoom , strIdx );
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		List   		roomUserlist  	= getUserList(strRoom);
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
			soc = getSocket(id);
			sockectSend(soc ,"hideLoding", null );
		}
	}
	
	public void upPercentage( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		strPer  	 	= (String)data.get("PER");
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		Session 	soc				= null; 
		JSONObject 	sendData  		= null;

		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 

			if (id != socket.getId()) {
				soc = getSocket(id);
				sockectSend(soc ,"convertLoding", null );
			}
		}
	}
	
	public void closePT( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("ROOM");
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		Session 	soc				= null; 
		
		
		setFileIdx	( strRoom , "0");
		setFileShow	( strRoom , "N");
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		Map 		getUserInfo      = null;
		boolean 	strClick  	 	 = (boolean)data.get("click");
		List   		roomUserlist     = getUserList(strRoom);
		JSONObject 	sendData  		 = null;
		Session 	soc				 = null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		Map 		getUserInfo     = null;
		boolean 	strClick  	 	= (boolean)data.get("click");
		List  	 	roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
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
		String 		strMode  	 	= (String)data.get("mode");
		String 		strIdx  	 	= (String)data.get("IDX");
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					
					sendData = new JSONObject();
					sendData.put("x"		, strX		);
					sendData.put("y"		, strY		);
					sendData.put("sendX"	, strSendX	);
					sendData.put("sendY"	, strSendY	);
					sendData.put("mode"		, strMode	);
					sendData.put("IDX"		, strIdx	);
					sockectSend(soc ,"draw", sendData );
				}
				
			}
		}
	}
	
	public void canvasClear( JSONObject data, Session socket ){
		String 		strRoom  	 	= (String)data.get("room");
		String 		id              = ""; 
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		Session 	soc				= null; 
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			
			if (id != socket.getId()) {
				
				soc = getSocket(id);
				
				if(soc != null){
					sockectSend(soc ,"clear", null );
				}
				
			}
		}
	}
	
	
	public void getDivUser( JSONObject data, Session socket ){
		String 		strId  	 		= (String)data.get("id");
		String 		strRoom  		= (String)data.get("room");
		String 		id              = "";
		Map 		getUserInfo     = null;
		List   		roomUserlist  	= getUserList(strRoom);
		JSONObject 	sendData  		= new JSONObject();
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID"); 
			if( id.equals(strId) ){
				sendData.put("user"	, (String)getUserInfo.get("USER_NM") 	);
				sendData.put("id"	, id 									);
				
				sockectSend(socket ,"div_user", sendData );
			}
		}
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
	
	public static List getUserList(String room){
		List 	roomUser 	= 	new ArrayList();
		Map     roomInfo    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("USER_LIST") != null ){
				roomUser = (List)roomInfo.get("USER_LIST");
			}else{
				roomUser =  null;
			}
			
		}else{
			roomUser =  null;
		}
		
		return roomUser;
	}
	
	public void setUserList(String room , List userList){
		List 	roomUser 	= 	new ArrayList();
		Map     roomInfo    =   null;
		
		if( rooms.get(room) != null ){
			roomInfo = (Map)rooms.get(room);
			roomInfo.put("USER_LIST",userList);
			rooms.put(room, roomInfo);
		}else{
			roomInfo = new HashMap();
			roomInfo.put("USER_LIST",userList);
			rooms.put(room, roomInfo);
		}
		
	}
	
	public Map getFile(String room){
		Map     roomInfo    =   null;
		Map     roomFile    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("FILE") != null ){
				roomFile = (Map)roomInfo.get("FILE");
			}else{
				roomFile =  null;
			}
			
		}else{
			roomFile =  null;
		}
		
		return roomFile;
	}
	
	public void setFile(String room , JSONObject data){
		Map     roomInfo    =   null;
		Map     roomFile    =   null;
		List    fileList    =   null;
		Map     fileInfo    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("FILE") != null ){
				roomFile = (Map)roomInfo.get("FILE");
				fileList = (List)roomFile.get("FILE_LIST");
				fileInfo = new HashMap();
				
				fileInfo.put("FILE_NM"		, data.get("FILE_NM")	);
				fileInfo.put("SIZE"			, data.get("SIZE")		);
				fileInfo.put("ORG_FILE_NM"	, data.get("ORG_FILE_NM"));
				
				fileList.add(fileInfo);
			}else{
				roomFile =  new HashMap();
				fileList =  new ArrayList();
				fileInfo = new HashMap();
				
				fileInfo.put("FILE_NM"		, data.get("FILE_NM")	);
				fileInfo.put("SIZE"			, data.get("SIZE")		);
				fileInfo.put("ORG_FILE_NM"	, data.get("ORG_FILE_NM"));
				
				fileList.add(fileInfo);
			}
			
			roomFile.put("FILE_LIST"		, fileList				);
			roomFile.put("FILE_IDX"			, "0"					);
			roomFile.put("FILE_SHOW"		, "Y"					);
			roomFile.put("FILE_SHARE_ID"	, data.get("SHARE_ID")	);
			
			roomInfo.put("FILE", roomFile);
			
			rooms.put(room, roomInfo);
			
			System.out.println( rooms.toString() );
		}
		
	}
	
	public void setFileIdx( String room , String idx ){
		
		Map     roomInfo    =   null;
		Map     roomFile    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("FILE") != null ){
				roomFile = (Map)roomInfo.get("FILE");
				roomFile.put("FILE_IDX" , idx 		);
				roomInfo.put("FILE"		, roomFile	);
				rooms.put(room,roomInfo);
			}
			
		}

	}
	
	public void setFileShow(  String room , String showYn ){
		
		Map     roomInfo    =   null;
		Map     roomFile    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("FILE") != null ){
				roomFile = (Map)roomInfo.get("FILE");
				roomFile.put("FILE_SHOW" , showYn 	);
				roomInfo.put("FILE"		 , roomFile	);
				rooms.put(room,roomInfo);
			}
			
		}

	}
	
	public void setFileShare(  String room , String shareId ){
		
		Map     roomInfo    =   null;
		Map     roomFile    =   null;
		
		if( rooms.get(room) != null ){
			
			roomInfo = (Map)rooms.get(room);
			
			if( roomInfo.get("FILE") != null ){
				roomFile = (Map)roomInfo.get("FILE");
				roomFile.put("FILE_SHARE_ID" , shareId 	);
				roomInfo.put("FILE"		 	 , roomFile	);
				rooms.put(room,roomInfo);
			}
			
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
		String 		id              = "";
		Map 		getUserInfo     = null;
		List   		roomUserlist 	= getUserList(strRoom);
		JSONObject 	sendData  		= null;
		Session		soc				= null;
		
		bbLogManager.bbLog("DEBUG", "fileConverPercent totPage =============================" + totPage );
		bbLogManager.bbLog("DEBUG", "fileConverPercent curPage =============================" + curPage );
		
		for (int i = 0; i < roomUserlist.size(); i++) {
			
			getUserInfo = (Map)roomUserlist.get(i);
			id			= (String)getUserInfo.get("SOCKET_ID");
			soc 		= getSocket(id);
			
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

