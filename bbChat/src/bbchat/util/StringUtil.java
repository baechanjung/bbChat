package bbchat.util;

public class StringUtil{
	
	public StringUtil()
	{ 
	}
	public static boolean isBlank(Object s)
	{
		return s == null || (s instanceof String) && s.toString().trim().length() < 1;
	}
	
	public static String null2void(String s)
	{
		return isBlank(s) ? "" : s;
	}

	public static String null2void(String s , String c){
		return isBlank(s) ? c : s;
	}
	
}
