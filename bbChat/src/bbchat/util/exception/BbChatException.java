package bbchat.util.exception;

import javax.servlet.ServletException;

public class BbChatException extends ServletException{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public BbChatException(String message) {
		super(message);
	}
	
	public BbChatException(Throwable rootCause) {
		super(rootCause);
	}		
}
