package de.buw.fmp.alloy.api;

import org.springframework.web.bind.annotation.RestController;

import edu.mit.csail.sdg.alloy4.A4Reporter;
import edu.mit.csail.sdg.alloy4.Pos;
import edu.mit.csail.sdg.ast.Command;
import edu.mit.csail.sdg.ast.ExprConstant;
import edu.mit.csail.sdg.ast.ExprVar;
import edu.mit.csail.sdg.parser.CompModule;
import edu.mit.csail.sdg.parser.CompUtil;
import edu.mit.csail.sdg.translator.A4Options;
import edu.mit.csail.sdg.translator.A4Solution;
import edu.mit.csail.sdg.translator.TranslateAlloyToKodkod;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.File;

import java.util.LinkedHashMap;
import java.util.Map;

import org.json.JSONObject;
import org.json.XML;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class AlloyInstanceController {

    static Map<String, StoredSolution> instances = new LinkedHashMap<>();

    public static A4Options getOptions() {
        A4Options opt = new A4Options();
        String osName = System.getProperty("os.name").toLowerCase();
        opt.solver = osName.contains("linux") ? A4Options.SatSolver.MiniSatJNI : A4Options.SatSolver.SAT4J;
        return opt;
      }

    @PostMapping("/instance/{cmd}")
    public String getInstance(@RequestBody InstanceRequest instanceRequest, @PathVariable int cmd) throws IOException {
        String code = instanceRequest.getCode();
        CompModule module = null;
        // parse Alloy file from code variable
        try {
            module = CompUtil.parseEverything_fromString(A4Reporter.NOP, code);
        } catch (Exception e) {
            // return error message as JSON with http status code 400
            JSONObject obj = new JSONObject();
            obj.put("error", e.toString());
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

        Command runCommand = module.getAllCommands().get(cmd);
        if (cmd == 0 && hasDefaultCommand(module)) {
            runCommand = new Command(Pos.UNKNOWN, ExprConstant.TRUE, "FMPlayDefault", false, 4, 4, 4, -1, -1, -1, null, null, ExprConstant.TRUE, null);
        };

        A4Options options = getOptions();
        // get the first instance of the Alloy file
        A4Solution instance;
        try {
            instance = TranslateAlloyToKodkod.execute_command(A4Reporter.NOP, module.getAllSigs(), runCommand, options);            
        } catch (Exception e) {
            // return error message as JSON with http status code 400
            JSONObject obj = new JSONObject();
            obj.put("error", e.toString());
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

        String specId = null;
        if (!instance.satisfiable()) {
            JSONObject obj = new JSONObject();
            obj.put("error", "No instance found");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }
        
        // generate a unieuq id for the instance
        do {
            specId = Long.toHexString(Double.doubleToLongBits(Math.random()));
        } while (instances.containsKey(specId));
        // store the instance in the instances map
        instances.put(specId, new StoredSolution(instance));

        File tmpFile = File.createTempFile("alloy_instance", ".xml");
        tmpFile.deleteOnExit();
        instance.writeXML(tmpFile.getAbsolutePath());
        // read content of instance.xml as String
        String instanceContent = Files.readString(Paths.get(tmpFile.getAbsolutePath()));
        JSONObject xmlJSONObj = XML.toJSONObject(instanceContent);
        if (specId != null) {
            xmlJSONObj.append("specId", specId);
        }
        String tabularInstance = instance.format();
        xmlJSONObj.append("tabularInstance", tabularInstance);
        String jsonPrettyPrintString = xmlJSONObj.toString(4);
        
        return jsonPrettyPrintString;
    }

    private boolean hasDefaultCommand(CompModule module) {
        if (module.getAllCommands().size() == 1) {
            Command cmd = module.getAllCommands().get(0);
            if (Pos.UNKNOWN.equals(cmd.pos)) {
                return true;
            }            
        }
        return false;
    }

    @PostMapping("/nextInstance")
    public String getNextInstance(@RequestBody String specId) throws IOException {
        StoredSolution storedSolution = instances.get(specId);
        if (storedSolution == null) {
            JSONObject obj = new JSONObject();
            obj.put("error", "No instance found, possibly cleaned up in the meantime");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

        A4Solution instance = storedSolution.getSolution();

        instance = instance.next();
        if (!instance.satisfiable()) {
            JSONObject obj = new JSONObject();
            obj.put("error", "No more instances");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }
        
        storedSolution.setSolution(instance);
        File tmpFile = File.createTempFile("alloy_instance", ".xml");
        tmpFile.deleteOnExit();
        instance.writeXML(tmpFile.getAbsolutePath());
        // read content of instance.xml as String
        String instanceContent = Files.readString(Paths.get(tmpFile.getAbsolutePath()));
        JSONObject xmlJSONObj = XML.toJSONObject(instanceContent);

        xmlJSONObj.append("specId", specId);
        String tabularInstance = instance.format();
        xmlJSONObj.append("tabularInstance", tabularInstance);
        String jsonPrettyPrintString = xmlJSONObj.toString(4);
        
        return jsonPrettyPrintString;
    }

    @Scheduled(fixedRate = 30000)
    public void removeOlsInstances() {
        long currentTime = System.currentTimeMillis();
        instances.entrySet().removeIf(entry -> currentTime - entry.getValue().getLastAccessed() > 3600000);
    }
    
}
