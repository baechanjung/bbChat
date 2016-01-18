package bbchat.com;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import bbchat.util.StringUtil;
import bbchat.util.exception.BbChatException;
import weauth.provider.PClient;


public class WeAuth extends HttpServlet  {
	
	protected void doGet( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request , response);
	}

	protected void doPost( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");
		
		PClient     pc        = new PClient(request , response);
		String      strRdmKey = StringUtil.null2void(request.getParameter("RDM_KEY"),"");
		HttpSession session   = null;
		Map         authData  = null;

		/*ByPass요청부*/
		Map <String , Map<String,String>>mUserInfoReq   = new HashMap<String , Map<String,String>>();
		Map <String , String>            mUserInfoParam = new HashMap<String , String>();
		
		if( pc.keyVaildate(strRdmKey) ) {
			authData = pc.fnParse();
			
			/*USER_ID는 WeAuth로 부터 전달받은 아이디를 셋팅*/	
			mUserInfoParam.put ("USER_ID"  , (String)authData.get("USER_ID") );
			mUserInfoReq.put   ("REQ_DATA" , mUserInfoParam                  );
			
			/*ByPass실행*/
			Map <String, Object>mUserInfo = pc.tranByPass("user_infm_srch_r001",mUserInfoReq);

			/*ByPass 검증*/
			if("0000".equals( mUserInfo.get("RSLT_CD"))){
				Map<String,String> mUser = (Map)((List)mUserInfo.get("RESP_DATA")).get(0);
				//System.out.println(mUser.toString());
				session  = request.getSession(true);
				session.setAttribute("USER_ID" , (String)mUser.get("USER_ID" ));
				session.setAttribute("USER_NM" , (String)mUser.get("USER_NM" ));
				session.setAttribute("IMG_PATH", (String)mUser.get("IMG_PATH"));				
			} 
			/*응답 실패 처리*/
			else{ 
				throw new BbChatException((String)mUserInfo.get("RSLT_MSG"));
			}
		}else{
			authData = pc.errorTrace();
			throw new BbChatException((String)authData.get("MESSAGE"));
		}
		
		response.sendRedirect("/bizmeet/main");
	}

}
