package bbchat.com;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
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
import org.apache.poi.hslf.usermodel.SlideShow;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class fileconvert extends HttpServlet  {

	private static final long serialVersionUID = 1L;

	
	protected void doPost( HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		request.setCharacterEncoding("UTF-8");
		
		//응답콘텐츠타입을 JSON형태로 지정 
		//TODO: Iframe을 통한 JSON형태의 결과를 받을때 다운로드 창이 뜨는 문제. 
		//response.setContentType("application/json; charset=UTF-8"); 
		//response.setContentType("text/plain; charset=UTF-8");
		
		//Iframe 기반으로된 업로드방식은 응답 콘테츠 타입이 application/json일 경우 
		//원하지 않는 다운로드 대화상자를 볼수있습니다.
		//그래서 Content-type 이 text/plain or text/html 형식이어야합니다. 
		//참고: http://javaking75.blog.me/220073311435
		
		
		if (request.getHeader("accept").indexOf("application/json") != -1) {
	        response.setContentType("application/json; charset=UTF-8");
	    } else {
	        // IE workaround
	        response.setContentType("text/plain; charset=UTF-8");
	    }		
		
		PrintWriter out = response.getWriter();
		
		
		try {
			//디스크상의 실제 경로 얻기
			String contextRootPath = this.getServletContext().getRealPath("/");
			
			//1. 메모리나 파일로 업로드 파일 보관하는 FileItem의 Factory설정
			DiskFileItemFactory diskFactory = new DiskFileItemFactory(); 
			//임시 저장폴더
			
			diskFactory.setRepository(new File(contextRootPath + "/file/temp"));
			
			//2. 업로드 요청을 처리하는 ServletFileUpload 생성
			ServletFileUpload upload = new ServletFileUpload(diskFactory); 
			//upload.setSizeMax(500 * 1024 * 1024); //500MB : 전체 최대 업로드 파일 크기
			//upload.setFileSizeMax(10 * 1024 * 1024); //10MB : 파일하나당 최대 업로드 파일 크기
			
			//3. 업로드 요청 파싱해서 FileItem 목록 구함
			List<FileItem> items = upload.parseRequest(request); 
			
			Iterator iter = items.iterator(); 

			while(iter.hasNext()) { //반목문으로 처리​    
                FileItem item = (FileItem) iter.next(); //아이템 얻기
                 //4. FileItem이 폼 입력 항목인지 여부에 따라 알맞은 처리
                if(item.isFormField()){ //파일이 아닌경우
                } else { //파일인 경우
                	processUploadFile(out, item, contextRootPath, response);
                }
            }


			//값 객체(VO,DTO)를 JSON형태로 문자열로 변환하기 위핸 Gson객체 생성.
			/*
			Gson gson = new Gson();
			String outString = gson.toJson(model);
			//System.out.println(outString);
			out.print(outString);			
			*/
		} catch(Exception e) {	
			e.printStackTrace();
			out.print("{\"result\":\"500\"");
			out.print(",\"msg\":\""+e.getMessage());			
			out.print("\"}");				
		}
		

		
	}
	//업로드한 정보가 파일인경우 처리
	private void processUploadFile(PrintWriter out, FileItem item, String contextRootPath, HttpServletResponse response) throws Exception {
		String 		fileName 	= item.getName(); 						//파일명 얻기
		String 		tmpName 	= System.currentTimeMillis()+""; 		//파일명 얻기
		String 		FILE_NM     = "slide-"+ tmpName + "_"; 				//리턴 파일명
		String 		FILE_CNT    = ""; 									//리턴 파일수
		JSONObject 	temp     	= new JSONObject();
		
		FileInputStream is = (FileInputStream)item.getInputStream();
		
		if(".ppt".equals( fileName.substring(fileName.lastIndexOf(".")) )){
			
			System.out.println("ppt");
			
			SlideShow ppt = new SlideShow(is);
			is.close();
			
			double zoom = 3; // magnify it by 2
			AffineTransform at = new AffineTransform();
			at.setToScale(zoom, zoom);
			
			Dimension pgsize = ppt.getPageSize();
			
			Slide[] slide = ppt.getSlides();
			for (int i = 0; i < slide.length; i++) {
				
				BufferedImage img = new BufferedImage((int)Math.ceil(pgsize.width*zoom), (int)Math.ceil(pgsize.height*zoom), BufferedImage.TYPE_INT_RGB);
				Graphics2D graphics = img.createGraphics();
				graphics.setTransform(at);
				graphics.setPaint(Color.white);
				graphics.fill(new Rectangle2D.Float(0, 0, pgsize.width, pgsize.height));
				slide[i].draw(graphics);
				FileOutputStream outImg = new FileOutputStream(contextRootPath + "/file/img/slide-"+ tmpName + "_" + (i + 1) + ".gif");
				
				temp.put(i, "/file/img/slide-"+ tmpName + "_" +  (i + 1) + ".gif");
				
				javax.imageio.ImageIO.write(img, "gif", outImg);
				
				outImg.close();
			}
			
			FILE_CNT = Integer.toString( slide.length );
			
		}else if(".pptx".equals( fileName.substring(fileName.lastIndexOf(".")) )){
			
			System.out.println("pptx");
			
			XMLSlideShow ppt = new XMLSlideShow(is);
			is.close();
			
			double zoom = 3; // magnify it by 2
			AffineTransform at = new AffineTransform();
			at.setToScale(zoom, zoom);
			
			Dimension pgsize = ppt.getPageSize();
			
			XSLFSlide[] slide = ppt.getSlides();
			
			for (int i = 0; i < slide.length; i++) {
				System.out.println(i);
				BufferedImage img = new BufferedImage((int)Math.ceil(pgsize.width*zoom), (int)Math.ceil(pgsize.height*zoom), BufferedImage.TYPE_INT_RGB);
				Graphics2D graphics = img.createGraphics();
				graphics.setTransform(at);
				graphics.setPaint(Color.white);
				graphics.fill(new Rectangle2D.Float(0, 0, pgsize.width, pgsize.height));
				slide[i].draw(graphics);
				FileOutputStream outImg = new FileOutputStream(contextRootPath + "/file/img/slide-"+ tmpName + "_" + (i + 1) + ".gif");
				
				temp.put(i, "/file/img/slide-"+ tmpName + "_" +(i + 1) + ".gif");
				
				javax.imageio.ImageIO.write(img, "gif", outImg);
				outImg.close();
			}
			
			FILE_CNT = Integer.toString( slide.length );
			
		}else if(".pdf".equals( fileName.substring(fileName.lastIndexOf(".")) )){
			
			System.out.println("pdf");
			
			//출력이미지 확장자
			String imageFormat = "gif";
			
			int pdfPageCn = 0;
			PDDocument pdfDoc = null;
			try {
				//PDF파일 정보 취득
				pdfDoc = PDDocument.load(item.getInputStream());
				
				//PDF파일 총페이지 수 취득
				pdfPageCn = pdfDoc.getNumberOfPages();
				
			} catch (IOException ioe) {
				System.out.println("PDF 정보취득 실패 : " + ioe.getMessage());
			}
			
			PDFImageWriter imageWriter = new PDFImageWriter();
			
			try {
				
				imageWriter.writeImage(
						pdfDoc, 
						imageFormat, 
						"",
						1, //이미지 출력 시작페이지
						pdfPageCn, //이미지 출력 종료페이지
						//"C:\\Users\\admin\\git\\bbchat\\bbChat\\WebContent\\file\\img\\slide-"+ tmpName + "_", //저장파일위치 및 파일명 지정 TEST+페이지 "TEST1.gif" 파일저장 
						"/WAS_DATA/webRoot/prj_0001/src/file/img/slide-"+ tmpName + "_", //저장파일위치 및 파일명 지정 TEST+페이지 "TEST1.gif" 파일저장 
						BufferedImage.TYPE_INT_RGB,
						300 //이미지 품질  300 추천
				);
				
			} catch (IOException ioe) {
				System.out.println("PDF 이미지저장 실패 : " + ioe.getMessage());
			}
			
			FILE_CNT = Integer.toString( pdfPageCn );
			
		}
		temp.put("RES_CD"	,	"0000"		);
		temp.put("SIZE"  	,	FILE_CNT	);
		temp.put("FILE_NM"  ,	FILE_NM		);
		
		response.setContentType("text/html; charset=utf-8");
		
		
		try {
			out = response.getWriter();
			out.println(temp.toString());
			System.out.println(temp.toString());
			out.flush();
		} catch (Exception e) {}
	}
}
