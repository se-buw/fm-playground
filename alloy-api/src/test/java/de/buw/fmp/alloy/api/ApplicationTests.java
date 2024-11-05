package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {

	private class AlloyInstanceControllerLocal extends AlloyInstanceController {
		@Override
		public String getCodeByPermalink(String type, String permalink) {
			switch (permalink) {
				case "shank-whiff-unify-salon":
					return "sig A {}";
				case "long-code":
					return longCode;
				case "short-code":
					return shortCode;
				default:
					break;
			}
			return shortCode;
		}
	}

	final String shortCode = "sig A {}";
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

	@BeforeEach
	void setUp() {
		AlloyInstanceController.instances.clear();
	}

	@Test
	void contextLoads() {
		AlloyInstanceController.TIME_OUT = 5;

		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		InstanceRequest request = new InstanceRequest();

		request.setCode(shortCode);
		List<String> instanceList = new ArrayList<>();
		String result = "";
		try {
			result = controller.getInstance("ALS", "shank-whiff-unify-salon", 0);
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
		AlloyInstanceController.TIME_OUT = 5;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		InstanceRequest request = new InstanceRequest();
		request.setCode(longCode);
		String result = "";
		try {
			result = controller.getInstance("ALS", "long-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("timed out"));

	}

	@Test
	void shortRunningCodeTest() {
		AlloyInstanceController.TIME_OUT = 5;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		InstanceRequest request = new InstanceRequest();
		request.setCode(shortCode);
		String result = "";
		long start = System.currentTimeMillis();
		try {
			result = controller.getInstance("ALS", "short-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		long duration = System.currentTimeMillis() - start;
		assertTrue(duration < 2000);
		assertFalse(result.contains("error"));
	}

	@Test
	void lessThanMaxRunningTest() {
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 0;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance("ALS", "short-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertFalse(result.contains("error"));
	}

	@Test
	void moreThanMaxRunningTest() {
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 10;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance("ALS", "short-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("Too many instances running."));
	}

	@Test
	void updateRunningTest() {
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 0;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance("ALS", "short-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertEquals(AlloyInstanceController.running, 0);

		String specId = AlloyInstanceController.instances.keySet().iterator().next();
		assertTrue(result.contains(specId));
		try {
			result = controller.getNextInstance(specId);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertFalse(result.contains("error"));
		assertEquals(AlloyInstanceController.running, 0);
	}

	@Test
	void updateRunningTimeoutTest() {
		AlloyInstanceController.TIME_OUT = 1;
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 0;

		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance("ALS", "long-code", 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("timed out"));
		assertEquals(AlloyInstanceController.running, 0);

	}

	@Test
	void increaseRunningTest() throws InterruptedException {
		AlloyInstanceController.TIME_OUT = 2;
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 0;

		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		// execute get instance in a thread
		Thread t = new Thread(() -> {
			try {
				controller.getInstance("ALS", "long-code", 0);
			} catch (Exception e) {
				fail(e);
			}
		});
		t.start();
		// give it some time to get to Alloy execution
		Thread.sleep(1000);
		assertEquals(AlloyInstanceController.running, 1);
		t.join();
		assertEquals(AlloyInstanceController.running, 0);
	}
}
