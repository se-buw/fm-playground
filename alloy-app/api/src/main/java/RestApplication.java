import javax.ws.rs.core.Application;

import edu.mit.csail.sdg.alloy4.Err;
import edu.mit.csail.sdg.ast.Command;
import edu.mit.csail.sdg.translator.A4Solution;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import javax.ws.rs.ApplicationPath;

@ApplicationPath("/")
public class RestApplication extends Application {
	
	private static Map<String, List<A4Solution>> answers = new HashMap<String, List<A4Solution>>();
	private static Map<String, Integer> count = new HashMap<String, Integer>();
	private static Map<String, Command> cmd = new HashMap<String, Command>();
    
	public static void remove(String str) {
		answers.remove(str);
		count.remove(str);
		cmd.remove(str);
		System.out.println("Removing session, now active: "+answers.size());
	}

	public static void add(String str, A4Solution ans, Command cm) {
		answers.put(str,new ArrayList<A4Solution>());
		answers.get(str).add(ans);
		count.put(str,0);
		cmd.put(str,cm);
		System.out.println("Adding session, now active: "+answers.size());
	}

	public static A4Solution getSol(String str) {
		List<A4Solution> sols = answers.get(str);
		return sols.get(sols.size()-1);
	}

	public static A4Solution getSol(String str, int n) {
		List<A4Solution> sols = answers.get(str);
		return sols.get(n);
	}

	public static int getCnt(String str) {
		return count.get(str);
	}

	public static Command getCommand(String str) {
		return cmd.get(str);
	}

	public static void next(String str) throws Err {
		answers.get(str).add(getSol(str).next());
		count.put(str,count.get(str)+1);
	}

	public static boolean alive(String str) {
		return answers.containsKey(str);
	}

	public RestApplication() {
    	
    }
}

