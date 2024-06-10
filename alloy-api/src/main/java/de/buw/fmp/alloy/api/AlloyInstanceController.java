package de.buw.fmp.alloy.api;

import org.springframework.web.bind.annotation.RestController;

import edu.mit.csail.sdg.alloy4.A4Reporter;
import edu.mit.csail.sdg.parser.CompModule;
import edu.mit.csail.sdg.parser.CompUtil;
import edu.mit.csail.sdg.translator.A4Options;
import edu.mit.csail.sdg.translator.A4Solution;
import edu.mit.csail.sdg.translator.TranslateAlloyToKodkod;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import java.util.LinkedHashMap;
import java.util.Map;

import org.json.JSONObject;
import org.json.XML;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
public class AlloyInstanceController {

    static Map<String, StoredSolution> instances = new LinkedHashMap<>();

    @PostMapping("/instance/{cmd}")
    public String postMethodName(@RequestBody String code, @PathVariable int cmd) throws IOException {
        // parse Alloy file from code variable
        CompModule module = CompUtil.parseEverything_fromString(A4Reporter.NOP, code);

        A4Options options = new A4Options();
        // get the first instance of the Alloy file
        A4Solution instance = TranslateAlloyToKodkod.execute_command(A4Reporter.NOP, module.getAllSigs(), module.getAllCommands().get(cmd), options);

        String specId = null;
        if (instance.satisfiable()) {
            // generate a unieuq id for the instance
            do {
                specId = Long.toHexString(Double.doubleToLongBits(Math.random()));
            } while (instances.containsKey(specId));
            // store the instance in the instances map
            instances.put(specId, new StoredSolution(instance));
        }
        instance.writeXML("instance.xml");
        // read content of instance.xml as String
        String instanceContent = Files.readString(Paths.get("instance.xml"));
        JSONObject xmlJSONObj = XML.toJSONObject(instanceContent);
        if (specId != null) {
            xmlJSONObj.append("specId", specId);
        }
        String jsonPrettyPrintString = xmlJSONObj.toString(4);
        
        return jsonPrettyPrintString;
    }

    @PostMapping("/nextInstance")
    public String postMethodName(@RequestBody String specId) throws IOException {
        StoredSolution storedSolution = instances.get(specId);
        A4Solution instance = storedSolution.getSolution();

        instance = instance.next();
        if (instance.satisfiable()) {
            storedSolution.setSolution(instance);
        }

        instance.writeXML("instance.xml");
        // read content of instance.xml as String
        String instanceContent = Files.readString(Paths.get("instance.xml"));
        JSONObject xmlJSONObj = XML.toJSONObject(instanceContent);

        xmlJSONObj.append("specId", specId);
        String jsonPrettyPrintString = xmlJSONObj.toString(4);
        
        return jsonPrettyPrintString;
    }

    @Scheduled(fixedRate = 30000)
    public void removeOlsInstances() {
        long currentTime = System.currentTimeMillis();
        instances.entrySet().removeIf(entry -> currentTime - entry.getValue().getLastAccessed() > 3600000);
    }
    
}
