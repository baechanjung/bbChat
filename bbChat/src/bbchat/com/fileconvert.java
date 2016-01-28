package bbchat.com;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.util.PDFImageWriter;
import org.apache.poi.hslf.model.Slide;
import org.apache.poi.hslf.model.TextRun;
import org.apache.poi.hslf.usermodel.RichTextRun;
import org.apache.poi.hslf.usermodel.SlideShow;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFGroupShape;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.json.simple.JSONObject;

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
		String 			FILE_NM     = "slide-"+ tmpName + "_"; 				//리턴 파일명
		String 			FILE_CNT    = ""; 									//리턴 파일수
		JSONObject 		temp     	= new JSONObject();
		FileInputStream is 			= null;
		
		try{
			
			response.setContentType("text/html; charset=utf-8");
			
			out 		= 	response.getWriter();
			is 			= 	(FileInputStream)item.getInputStream();
			
			if(".ppt".equals( fileName.substring(fileName.lastIndexOf(".")) )){
				
				System.out.println("ppt");

				double 				zoom 		= 	2; // magnify it by 2
				AffineTransform 	at 			= 	new AffineTransform();
				SlideShow 			ppt			= 	new SlideShow(is);
				Dimension	 		pgsize		=   ppt.getPageSize();
				Slide[] 			slide		= 	ppt.getSlides();
				BufferedImage 		img			=   null; 
				Graphics2D 			graphics	=   null; 
				FileOutputStream 	outImg		=   null; 
				at.setToScale(zoom, zoom);
				
				WebSocketServer.fileConverPercent(roomNum, Integer.toString(slide.length) ,"0");
				
				for (int i = 0; i < slide.length; i++) {
					
					setTrueTypeFont(slide[i]);
					
					img 		= 	new BufferedImage((int)Math.ceil(pgsize.width*zoom), (int)Math.ceil(pgsize.height*zoom), BufferedImage.TYPE_INT_RGB);
					graphics 	= 	img.createGraphics();
					graphics.setTransform(at);
					graphics.setPaint(Color.white);
					graphics.fill(new Rectangle2D.Float(0, 0, pgsize.width, pgsize.height));
					slide[i].draw(graphics);
					
					outImg 		= 	new FileOutputStream(contextRootPath + "/file/img/slide-"+ tmpName + "_" + (i + 1) + ".gif");
					
					temp.put(i, "/file/img/slide-"+ tmpName + "_" +  (i + 1) + ".gif");
					
					javax.imageio.ImageIO.write(img, "gif", outImg);
					
					outImg.close();
					
					WebSocketServer.fileConverPercent(roomNum, Integer.toString(slide.length) , Integer.toString(i+1));
				}
				
				FILE_CNT = Integer.toString( slide.length );
				
			}else if(".pptx".equals( fileName.substring(fileName.lastIndexOf(".")) )){
				
				System.out.println("pptx");
				
				XMLSlideShow 		ppt 		= 	new XMLSlideShow(is);
				double 				zoom 		= 	2; // magnify it by 2
				AffineTransform 	at 			= 	new AffineTransform();
				Dimension 			pgsize 		= 	ppt.getPageSize();
				XSLFSlide[] 		slide 		= 	ppt.getSlides();
				BufferedImage 		img			= 	null;
				Graphics2D 			graphics 	=   null;
				FileOutputStream 	outImg 		=   null;
				at.setToScale(zoom, zoom);
				
				WebSocketServer.fileConverPercent(roomNum, Integer.toString(slide.length) ,"0");
				
				for (int i = 0; i < slide.length; i++) {
					
					setTrueTypeFont(slide[i]);
					
					img = new BufferedImage((int)Math.ceil(pgsize.width*zoom), (int)Math.ceil(pgsize.height*zoom), BufferedImage.TYPE_INT_RGB);
					graphics = img.createGraphics();
					graphics.setTransform(at);
					graphics.setPaint(Color.white);
					graphics.fill(new Rectangle2D.Float(0, 0, pgsize.width, pgsize.height));
					slide[i].draw(graphics);
					outImg = new FileOutputStream(contextRootPath + "/file/img/slide-"+ tmpName + "_" + (i + 1) + ".gif");
					
					temp.put(i, "/file/img/slide-"+ tmpName + "_" +(i + 1) + ".gif");
					
					javax.imageio.ImageIO.write(img, "gif", outImg);
					outImg.close();
					
					WebSocketServer.fileConverPercent(roomNum, Integer.toString(slide.length) , Integer.toString(i+1));
				}
				
				FILE_CNT = Integer.toString( slide.length );
				
			}else if(".pdf".equals( fileName.substring(fileName.lastIndexOf(".")) )){
				
				System.out.println("pdf");
				
				String          osName          =   System.getProperty("os.name");
				String          filePath        =   "";
				String 			imageFormat 	= 	"gif";				//출력이미지 확장자
				int 			pdfPageCn 		= 	0;
				PDDocument 		pdfDoc 			= 	null;
				PDFImageWriter 	imageWriter 	= 	new PDFImageWriter();
				
				try {
					pdfDoc 		= 	PDDocument.load(item.getInputStream());		//PDF파일 정보 취득
					pdfPageCn 	= 	pdfDoc.getNumberOfPages();					//PDF파일 총페이지 수 취득
				} catch (IOException ioe) {
					System.out.println("PDF 정보취득 실패 : " + ioe.getMessage());
					throw ioe;
				}
				
				if( osName.indexOf("Win") > -1  ){
					filePath = getServletContext().getRealPath("") + "\\file\\img\\";
				}else{
					filePath = getServletContext().getRealPath("") + "/file/img/";
				}
				
				WebSocketServer.fileConverPercent(roomNum, Integer.toString(pdfPageCn) ,"0");
				
				try {
					
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
				}
				
				FILE_CNT = Integer.toString( pdfPageCn );
				
			}
			
			is.close();
			
			temp.put("RES_CD"		,	"0000"			);
			temp.put("SIZE"  		,	FILE_CNT		);
			temp.put("FILE_NM"  	,	FILE_NM			);
			temp.put("ORG_FILE_NM"  ,	fileName		);
			
			out.println(temp.toString());
			out.flush();
			System.out.println(temp.toString());
			
		}catch( Exception e){
			temp.put("RES_CD"		,	"9999"			);
			out.println(temp.toString());
			out.flush();
		}
		
		
		
	}
	
	private static void setTrueTypeFont(Slide slide) {
		TextRun    [] truns     = slide.getTextRuns();
		RichTextRun[] richTexts = null;
		String        fontName  = "";
		for (TextRun trun : truns) {
			richTexts = trun.getRichTextRuns();
			for (RichTextRun richText : richTexts) {
				fontName = richText.getFontName();
				if(fontName != null){
					if ( isTrueType(fontName) ){
						richText.setFontName("Dialog.plan");
					}else{
						richText.setFontName(fontName     );	
					}					
				}
			}				
		}		
	}
	
	private static void setTrueTypeFont(XSLFSlide slide) {
		for(XSLFShape shape : slide){
			setTrueTypeFont( shape );
		}
//		XSLFTextShape 			 txShape 			= null;
//		List <XSLFTextParagraph> xslfTextParagraphs = null;
//		List <XSLFTextRun>		 xslfTextRuns       = null;	
//		String                   fontName           = "";
//		for(XSLFShape shape : slide){
//			 if(shape instanceof XSLFTextShape) {
//				 txShape            = (XSLFTextShape)shape;
//				 xslfTextParagraphs = txShape.getTextParagraphs();
//				 for(XSLFTextParagraph xslfTextParagraph : xslfTextParagraphs){
//					 xslfTextRuns = xslfTextParagraph.getTextRuns();
//					 for(XSLFTextRun xslfTextRun : xslfTextRuns){
//						 fontName = xslfTextRun.getFontFamily();
//						 if ( isTrueType(fontName) ){                   
//							 xslfTextRun.setFontFamily("Dialog.plan");  
//						 }else{                                          
//							xslfTextRun.setFontFamily(fontName      );
//						 }
//					 }
//				 }
//			 }
//		}
	}	
	
	private static void setTrueTypeFont(XSLFShape shape) {
		XSLFTextShape 			 txShape 			= null;
		List <XSLFTextParagraph> xslfTextParagraphs = null;
		List <XSLFTextRun>		 xslfTextRuns       = null;	
		String                   fontName           = "";
		 if(shape instanceof XSLFTextShape) {
			 txShape            = (XSLFTextShape)shape;
			 xslfTextParagraphs = txShape.getTextParagraphs();
			 for(XSLFTextParagraph xslfTextParagraph : xslfTextParagraphs){
				 xslfTextRuns = xslfTextParagraph.getTextRuns();
				 for(XSLFTextRun xslfTextRun : xslfTextRuns){
					 fontName = xslfTextRun.getFontFamily();
					 if(fontName != null){
						 if ( isTrueType(fontName) ){
							xslfTextRun.setFontFamily("Dialog.plan");  
						 }else{                                          
							xslfTextRun.setFontFamily(fontName      );
						 }						 
					 }
				 }
			 }
		 }else if(shape instanceof XSLFGroupShape) {
			 XSLFGroupShape grpShape = (XSLFGroupShape)shape;
			 for(XSLFShape grpItemShape : grpShape.getShapes()){
				 if(grpItemShape instanceof XSLFTextShape) {
					 setTrueTypeFont(grpItemShape);
				 }
			 }
		 }
	}
	
	private static boolean isTrueType(String fontName){
		String[] trueType = new String[]{"Tahoma","Times New Roman","Calibri","Arial"};
		for(String type : trueType){
			if(type.equals(fontName))
				return true;
		}
		return false;
	}
}
