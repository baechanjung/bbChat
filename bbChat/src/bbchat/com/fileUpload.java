package bbchat.com;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.oreilly.servlet.multipart.DefaultFileRenamePolicy;
import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;

public class fileUpload extends HttpServlet {
 
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	PrintWriter out = response.getWriter();
        
        int 	maxSize  	= 1024*1024*30;	        // 30Mbyte 제한   
        String  fsl 		= File.separator;
        String  root 		= request.getSession().getServletContext().getRealPath(fsl);
        String  rootPath 	= root + fsl + "file";
        String  savePath 	= "";
        
        MultipartParser mp = new MultipartParser(request, maxSize);
        
        mp.setEncoding("UTF-8");
 
        Part part;
        
        while ((part = mp.readNextPart()) != null) {
            String name = part.getName();
 
            //파일이 아닐때
            if (part.isParam()) {
            }
            // 파일일때
            else if (part.isFile()) {
                FilePart filePart = (FilePart) part;
                filePart.setRenamePolicy(new DefaultFileRenamePolicy()); //중복파일

                String fileName = filePart.getFileName();
                if (fileName != null) {
                	
                	System.out.println("path ======= " + rootPath + fsl + savePath);
                	
                    File dir = new File(rootPath + fsl + savePath);
                    
                    if (!dir.isDirectory()){     //디렉토리인지 체크 후 없으면 생성
                        dir.mkdir();
                    }
                    System.out.println(dir);
                    
                    long size = filePart.writeTo(dir);
                }
            }
        }    
    }
    
}
