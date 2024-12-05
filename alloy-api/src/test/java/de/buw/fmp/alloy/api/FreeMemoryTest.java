package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class FreeMemoryTest {

  @BeforeEach
  void setUp() {
    AlloyInstanceController.instances.clear();
  }

  @Test
  void freeMemoryTest(){
    AlloyInstanceController.TIME_OUT = 10;
		AlloyInstanceControllerLocal controller = new AlloyInstanceControllerLocal();
    printMemoryUsage("before execution");
        String result = "";
        try {
          result = controller.getInstance(Specs.LONG_CODE, 0);
        } catch (Exception e) {
          e.printStackTrace();
        }
        printMemoryUsage("after timeout");
        assertTrue(result.contains("error") && result.contains("timed out"));
        System.gc();
        // wait for gc
        try {
          Thread.sleep(1000);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
        printMemoryUsage("after gc");
      }
    
      private void printMemoryUsage(String when) {
        long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        // in gb
        System.out.println("Memory used: " + mem / 1024 / 1024 + " MB " + when);
        
      }
}
