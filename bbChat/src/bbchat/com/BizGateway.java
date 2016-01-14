package bbchat.com;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class BizGateway extends HttpServlet  {
	
	protected void doGet( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request , response);
	}

	protected void doPost( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		
		String 			  uriPattern = request.getRequestURI().replaceAll("/", "").replaceAll("bizmeet", "");
		
		ServletContext 	  sc 		 = getServletContext();
		RequestDispatcher rd 		 = null;
		
		if("main".equals(uriPattern) ){
			rd = sc.getRequestDispatcher("/bbChat/view/bb_main.jsp");
		}else if("room".equals(uriPattern) ){
			rd = sc.getRequestDispatcher("/bbChat/view/bb_room.jsp");
		}else if("".equals(uriPattern) ){
			rd = sc.getRequestDispatcher("/bbChat/view/bb_main.jsp");
		}
		
		rd.forward(request, response);
		
	}

}
