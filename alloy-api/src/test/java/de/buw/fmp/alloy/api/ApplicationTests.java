package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;

@SpringBootTest
class ApplicationTests {

	@BeforeEach
	void setUp() {
		AlloyInstanceController.instances.clear();
	}

	@Test
	void contextLoads() {
		AlloyInstanceController.TIME_OUT = 5;

		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		List<String> instanceList = new ArrayList<>();
		String result = "";
		try {
			result = controller.getInstance(Specs.SHORT_CODE, 0);
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
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance(Specs.LONG_CODE, 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("timed out"));

	}

	@Test
	void shortRunningCodeTest() {
		AlloyInstanceController.TIME_OUT = 5;
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		long start = System.currentTimeMillis();
		try {
			result = controller.getInstance(Specs.SHORT_CODE, 0);
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
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance(Specs.SHORT_CODE, 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertFalse(result.contains("error"));
	}

	@Test
	void moreThanMaxRunningTest() {
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 10;
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance(Specs.SHORT_CODE, 0);
		} catch (Exception e) {
			e.printStackTrace();
		}
		assertTrue(result.contains("error") && result.contains("Too many instances running."));
	}

	@Test
	void updateRunningTest() {
		AlloyInstanceController.MAX_RUNNING = 10;
		AlloyInstanceController.running = 0;
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance(Specs.SHORT_CODE, 0);
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

		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		try {
			result = controller.getInstance(Specs.LONG_CODE, 0);
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

		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		// execute get instance in a thread
		Thread t = new Thread(() -> {
			try {
				controller.getInstance(Specs.LONG_CODE, 0);
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

	@Test
	void evaluateListTest() throws Exception{
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		String resultJson = controller.getInstance(Specs.LIST_CODE, 0);
		String specId = getField(resultJson, "specId");
		result = controller.eval(specId, "# Node", 0);
		assertEquals("4", getField(result, "result"));
		
		result = controller.eval(specId, "# List", 0);
		assertEquals("1", getField(result, "result"));

		result = controller.eval(specId, "# Node", 1);
		assertEquals("1", getField(result, "result"));
	}

	@Test
	void evaluateAtomTest() throws Exception{
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		String resultJson = controller.getInstance(Specs.LIST_CODE, 0);
		String specId = getField(resultJson, "specId");
		result = controller.eval(specId, "List", 0);
		assertEquals("{List$0}", getField(result, "result"));
		result = controller.eval(specId, "List$0", 0);
		assertEquals("{List$0}", getField(result, "result"));
	}
	
	@Test
	void evaluateErrorsTest() throws Exception{
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String result = "";
		String resultJson = controller.getInstance(Specs.SHORT_CODE, 0);
		String specId = getField(resultJson, "specId");
		// Node does not exist in this model
		result = controller.eval(specId, "# Node", 0);
		assertTrue(getField(result, "error").contains("Syntax error"));
	}

	@Test
	void checkListTabularTest() throws Exception{
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String resultJson = controller.getInstance(Specs.LIST_CODE, 0);		
		assertTrue(getField(resultJson, "tabularInstance").contains("this/"));
	}

	@Test
	void checkTrafficTabularTest() throws Exception{
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
		String resultJson = controller.getInstance(Specs.TRAFFIC_CODE, 0);		
		assertTrue(getField(resultJson, "tabularInstance").contains("this/"));
	}

	/**
	 * Get a field from a JSON string
	 * 
	 * @param json
	 * @param field
	 * @return
	 * @throws Exception
	 */
	private String getField(String json, String field) throws Exception {
		ObjectReader reader = new ObjectMapper().readerFor(Map.class);
		Map<String, String> map = reader.readValue(json);
		Object value = map.get(field);
		if (value instanceof List) {
			return ((List<?>) value).get(0).toString();
		}
		return value.toString();
	}
}
