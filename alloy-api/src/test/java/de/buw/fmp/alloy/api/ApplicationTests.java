package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
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
			e.printStackTrace();
		}

		String specId = AlloyInstanceController.instances.keySet().iterator().next();

		instanceList.add(result);
		while (!result.contains("error")) {
			try {
				result = controller.getNextInstance(specId);
				System.out.println(result);								
				assertFalse(instanceList.contains(result));
				instanceList.add(result);
			} catch (Exception e) {
				e.printStackTrace();
			}
			instanceList.add(result);
		}
	}

}
