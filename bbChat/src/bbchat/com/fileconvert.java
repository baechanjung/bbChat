package bbchat.com;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List; 
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.util.PDFImageWriter;
import org.json.simple.JSONObject;

import com.aspose.slides.Presentation;
import com.aspose.slides.SaveFormat;

import bbchat.server.WebSocketServer;

public class fileconvert extends HttpServlet  {

	private static final 	long 	serialVersionUID 	= 1L;
	private 			 	String 	roomNum 		 	= "";

	
	protected void doPost( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");
		
		if (request.getHeader("accept").indexOf("application/json") != -1) {
	        response.setContentType("application/json; charset=UTF-8");
	    } else {
	        response.setContentType("text/plain; charset=UTF-8");
	    }
		
		String 					name				= ""; 
		String 					value 				= "";
		String 					contextRootPath		= "";
		PrintWriter 			out 				= response.getWriter();
		DiskFileItemFactory 	diskFactory 		= null;
		ServletFileUpload 		upload				= null;
		List<FileItem> 			items				= null; 
		Iterator 				iter				= null; 
		FileItem 				item				= null;
		JSONObject 				temp		     	= new JSONObject();
		
		try {
			contextRootPath 	= 	this.getServletContext().getRealPath("/");				//디스크상의 실제 경로 얻기
			
			diskFactory 		= 	new DiskFileItemFactory(); 								//1. 메모리나 파일로 업로드 파일 보관하는 FileItem의 Factory설정
			diskFactory.setRepository(new File(contextRootPath + "/file/temp"));			//임시 저장폴더
			
			upload 				= 	new ServletFileUpload(diskFactory);						//2. 업로드 요청을 처리하는 ServletFileUpload 생성 
			//upload.setSizeMax		(500 * 1024 * 1024); //500MB : 전체 최대 업로드 파일 크기
			//upload.setFileSizeMax	(10  * 1024 * 1024); //10MB : 파일하나당 최대 업로드 파일 크기

			items	 			= 	upload.parseRequest(request);							//3. 업로드 요청 파싱해서 FileItem 목록 구함
			
			iter 				= 	items.iterator(); 

			while(iter.hasNext()) { //반목문으로 처리​    
                item 	= 	(FileItem) iter.next(); //아이템 얻기
                
                //4. FileItem이 폼 입력 항목인지 여부에 따라 알맞은 처리
                if(item.isFormField()){ //파일이 아닌경우
                	name 		= 	item.getFieldName();
            		value 		= 	item.getString("UTF-8");
            		roomNum 	= 	value;
                } else { //파일인 경우
                	processUploadFile(out, item, contextRootPath, response);
                }
			}
			
		} catch(Exception e) {	
			temp.put("RES_CD"		,	"9999"			);
			out.println(temp.toString());
			out.flush();			
		}
	}
	
	
	//업로드한 정보가 파일인경우 처리
	private void processUploadFile(PrintWriter out, FileItem item, String contextRootPath, HttpServletResponse response) {
		
		String 			fileName 	= item.getName(); 						//파일명 얻기
		String 			tmpName 	= System.currentTimeMillis()+""; 		//파일명 얻기
		String 			reFileName  = "slide-"+ tmpName + "_"; 				//리턴 파일명
		String 			reFileCnt   = ""; 									//리턴 파일수
		String          filePath    = "";
		String          osName      =   System.getProperty("os.name");
		JSONObject 		temp     	= new JSONObject();
		FileInputStream is 			= null;
		
		
		if( osName.indexOf("Win") > -1  ){
			filePath = getServletContext().getRealPath("") + "\\file\\img\\";
		}else{
			filePath = getServletContext().getRealPath("") + "/file/img/";
		}
		
		
		try{
			
			response.setContentType("text/html; charset=utf-8");
			
			out 		= 	response.getWriter();
			is 			= 	(FileInputStream)item.getInputStream();
			
			if(".pptx".equals( fileName.substring(fileName.lastIndexOf("."))) || ".ppt".equals( fileName.substring(fileName.lastIndexOf(".")))){
				//
				Presentation           pres       = null;
				//
				FileOutputStream       fos        = null;
				//
		        BufferedReader         br         = null;       
		        InputStreamReader      isr        = null;   
		        FileInputStream        fis        = null;       
		        File                   file       = null;
		        String                 contTemp   = "";
				//
				String                 content    = "";
				String                 groupStr   = "";
				String                 patternStr ="<div[^>]*>(.*?)</div>";
				BufferedWriter		   bw         = null;
				//
				Pattern                pattern    = null; 
		        Matcher                matcher    = null;
		        int 				   slideCnt   = 0;
		        int 				   fileIdx    = 0;
				
		        reFileName = reFileName + "svg";
		        
				try{
					//5%					 
					WebSocketServer.fileConverPercent(roomNum, "100" ,"5");
					
					pres     = new Presentation(is);
					slideCnt = pres.getSlides().size();
					
					//15%
					WebSocketServer.fileConverPercent(roomNum, "100" ,"15");
					
					file = new File(filePath+tmpName+".html");
					
					fos  = new FileOutputStream(file);

					pres.save(fos, SaveFormat.Html);
					fos.flush();
					fos.close();
					
					//30%
					WebSocketServer.fileConverPercent(roomNum, "100" ,"30");

					fis = new FileInputStream(file);
		            isr = new InputStreamReader(fis, "UTF-8");
		            br  = new BufferedReader(isr);
		            
					//40%
					WebSocketServer.fileConverPercent(roomNum, "100" ,"40");
					
		            while( (contTemp = br.readLine()) != null) {
		            	/*라이센스 마크 제거(돈주고 사자...나중에...)*/
		            	if(contTemp.indexOf("Evaluation only.") > -1 || contTemp.indexOf("Created with Aspose") > -1 || contTemp.indexOf("Aspose Pty Ltd.") > -1){
		            		continue;
		            	}
		                content += contTemp+ "\n";
		            }
		            
					//50%
					WebSocketServer.fileConverPercent(roomNum, "100" ,"50");
					
//					FileOutputStream fileOutputStream = new OutputStreamWriter(new FileOutputStream(filePath+reFileName+ (fileIdx) + ".svg"))
//					OutputStreamWriter OutputStreamWriter = new OutputStreamWriter(fileOutputStream, "MS949");
//					BufferedWriter bufferedWriter = new BufferedWriter(OutputStreamWriter);
					
		            pattern = Pattern.compile(patternStr , Pattern.MULTILINE | Pattern.DOTALL| Pattern.CASE_INSENSITIVE);
				    matcher = pattern.matcher(content);
				    while (matcher.find()) {
				    	
				    	fileIdx++;
				    	groupStr = matcher.group(1);
//				    	bw = new BufferedWriter(new FileWriter(filePath+reFileName+ (fileIdx) + ".svg"));
				    	bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filePath+reFileName+ (fileIdx) + ".svg"),"UTF-8"));
				    	bw.write(groupStr);                          
				    	bw.flush();
				    	bw.close();
				    	

			            //50%~100%
				    	WebSocketServer.fileConverPercent(roomNum, "100" ,Integer.toString((int)Math.floor(( (double)fileIdx /slideCnt)*50)+50));    

				    }
				    reFileCnt = Integer.toString(slideCnt);
				    
				}catch(Exception e){
					e.printStackTrace();
					throw e;
				}finally{
					if(fos != null){try {fos.close();} catch (IOException e) {e.printStackTrace();} }
					if(fis != null){try {fis.close();} catch (IOException e) {e.printStackTrace();} }
					if(isr != null){try {isr.close();} catch (IOException e) {e.printStackTrace();} }
					if(br  != null){try {br.close ();} catch (IOException e) {e.printStackTrace();} }			
					if(bw  != null){try {bw.close ();} catch (IOException e) {e.printStackTrace();} }
				}
		        
		        
			}else if(".pdf".equals( fileName.substring(fileName.lastIndexOf(".")) )){
				
				String 			imageFormat 	= 	"gif";				//출력이미지 확장자
				int 			pdfPageCn 		= 	0;
				PDDocument 		pdfDoc 			= 	null;
				PDFImageWriter 	imageWriter 	= 	new PDFImageWriter();
				
				try {
					pdfDoc 		= 	PDDocument.load(item.getInputStream());		//PDF파일 정보 취득
					pdfPageCn 	= 	pdfDoc.getNumberOfPages();					//PDF파일 총페이지 수 취득
				
					WebSocketServer.fileConverPercent(roomNum, Integer.toString(pdfPageCn) ,"0");
					
					for(int i = 1 ; i < pdfPageCn + 1 ; i++){
						
						imageWriter.writeImage(
								pdfDoc, 
								imageFormat, 
								"",
								i, //이미지 출력 시작페이지
								i, //이미지 출력 종료페이지
								filePath + "slide-"+ tmpName + "_", //저장파일위치 및 파일명 지정 TEST+페이지 "TEST1.gif" 파일저장 
								BufferedImage.TYPE_INT_RGB,
								100 //이미지 품질  300 추천
						);
						
						WebSocketServer.fileConverPercent(roomNum, Integer.toString(pdfPageCn) , Integer.toString(i));
					}
					
				} catch (IOException ioe) {
					System.out.println("PDF 이미지저장 실패 : " + ioe.getMessage());
					throw ioe;
				} finally{
					if(pdfDoc != null){pdfDoc.close();} 
				}
				
				reFileCnt = Integer.toString( pdfPageCn );
				
			}
			
			temp.put("RES_CD"		,	"0000"			);
			temp.put("SIZE"  		,	reFileCnt	    );
			temp.put("FILE_NM"  	,	reFileName   	);
			temp.put("ORG_FILE_NM"  ,	fileName		);
			
			out.println(temp.toString());
			out.flush();
			System.out.println(temp.toString());
			
		}catch( Exception e){
			temp.put("RES_CD"		,	"9999"			);
			out.println(temp.toString());
			out.flush();
		}finally{
			if(is != null){try {is.close();} catch (IOException e) {e.printStackTrace();}}
			if(out != null){out.close();} 
		}
		
		
		
	}
}
