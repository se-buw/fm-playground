package de.buw.fmp.alloy.api;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class FreeMemoryTest {
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
      "run Puzzle for exactly 10 Person, 5 int\r\n" + //
      "";

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

  @BeforeEach
  void setUp() {
    AlloyInstanceController.instances.clear();
  }

  @Test
  void freeMemoryTest(){
    AlloyInstanceController.TIME_OUT = 10;
		AlloyInstanceController controller = new AlloyInstanceControllerLocal();
		InstanceRequest request = new InstanceRequest();
		request.setCode(longCode);
    printMemoryUsage("before execution");
        String result = "";
        try {
          result = controller.getInstance("ALS", "long-code", 0);
        } catch (Exception e) {
          e.printStackTrace();
        }
        printMemoryUsage("after timeout");
        // assertTrue(result.contains("error") && result.contains("timed out"));
        assertTrue(result.contains("specId") && result.contains("alloy"));
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
