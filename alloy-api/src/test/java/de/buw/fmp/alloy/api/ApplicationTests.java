package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {

	final String longCode = "sig Person {spouse: Person, shaken: set Person}\r\n" + //
				"one sig Jocelyn, Hilary extends Person {}\r\n" + //
				"\r\n" + //
				"fact ShakingProtocol {\r\n" + //
				"    // nobody shakes own or spouse's hand\r\n" + //
				"    all p: Person | no (p + p.spouse) & p.shaken\r\n" + //
				"    // if p shakes q, q shakes p\r\n" + //
				"    all p, q: Person | p in q.shaken => q in p.shaken\r\n" + //
				"    }\r\n" + //
				"\r\n" + //
				"fact Spouses {\r\n" + //
				"    all p, q: Person | p!=q => {\r\n" + //
				"        // if q is p's spouse, p is q's spouse\r\n" + //
				"        p.spouse = q => q.spouse = p\r\n" + //
				"        // no spouse sharing\r\n" + //
				"        p.spouse != q.spouse\r\n" + //
				"        }\r\n" + //
				"    all p: Person {\r\n" + //
				"        // a person is his or her spouse's spouse\r\n" + //
				"        p.spouse.spouse = p\r\n" + //
				"        // nobody is his or her own spouse\r\n" + //
				"        p != p.spouse\r\n" + //
				"        }\r\n" + //
				"    }\r\n" + //
				"\r\n" + //
				"pred Puzzle {\r\n" + //
				"    // everyone but Jocelyn has shaken a different number of hands\r\n" + //
				"    all p,q: Person - Jocelyn | p!=q => #p.shaken != #q.shaken\r\n" + //
				"    // Hilary's spouse is Jocelyn\r\n" + //
				"    Hilary.spouse = Jocelyn\r\n" + //
				"    }\r\n" + //
				"\r\n" + //
				"run Puzzle for exactly 1000 Person, 15 int\r\n" + //
				"";

	@Test
	void contextLoads() {
		AlloyInstanceController.TIME_OUT = 10;

		AlloyInstanceController controller = new AlloyInstanceController();
		InstanceRequest request = new InstanceRequest();
		// Command@73 "Run Default for 4 but 4 int, 4 seq expect 1"
		// request.setCode("sig A {}");
		request.setCode("sig A {}");
		List<String> instanceList = new ArrayList<>();		
		String result = "";
		try {
			result = controller.getInstance(request, 0);
		} catch (Exception e) {
			fail();
		}
		assertTrue(result.contains("specId") && result.contains("alloy"));

		String specId = AlloyInstanceController.instances.keySet().iterator().next();

		instanceList.add(result);
		while (!result.contains("error")) {
			try {
				result = controller.getNextInstance(specId);
				System.out.println(result);								
				assertFalse(instanceList.contains(result));
				instanceList.add(result);
			} catch (Exception e) {
				fail();
			}
			instanceList.add(result);
		}
	}


	@Test
	void longRunningCodeTest() {
		AlloyInstanceController.TIME_OUT = 10;
		AlloyInstanceController controller = new AlloyInstanceController();
		InstanceRequest request = new InstanceRequest();
		request.setCode(longCode);
		String result = "";
		try {
			result = controller.getInstance(request, 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("timed out"));

	}
}
