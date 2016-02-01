package bbchat.com;

import java.io.PrintStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class bbLogManager {
	private static final Logger LOGGER = LoggerFactory.getLogger("");

	public static void bbLog(String logLevel, String errMsg){
		if("INFO".equals(logLevel)){
			LOGGER.info(errMsg);
		}else if("TRACE".equals(logLevel)){
			LOGGER.trace(errMsg);
		}else if("DEBUG".equals(logLevel)){
			LOGGER.debug(errMsg);
		}else if("WARN".equals(logLevel)){
			LOGGER.warn(errMsg);
		}else if("ERROR".equals(logLevel)){
			LOGGER.error(errMsg);
		}else {
			LOGGER.debug(errMsg);
		}
	}
	
	public static void bbLog(String logLevel, String errMsg, Exception ex){
		LOGGER.error(errMsg,ex);
	}
	
	public static PrintStream createLoggingSystem(final PrintStream realPrintStream) {
	    return new PrintStream(realPrintStream) {
	        public void print(final String string) {
	        	LOGGER.debug(string);
	        }
	        public void println(final String string) {
	        	LOGGER.debug(string);
	        }
	    };
	}
	
	public static PrintStream createLoggingError(final PrintStream realPrintStream) {
		return new PrintStream(realPrintStream) {
			public void print(final String string) {
				LOGGER.error(string);
			}
			public void println(final String string) {
				LOGGER.error(string);
			}
		};
	}

}
