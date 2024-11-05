package de.buw.fmp.alloy.api;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import edu.mit.csail.sdg.alloy4.A4Reporter;
import edu.mit.csail.sdg.alloy4.Pos;
import edu.mit.csail.sdg.alloy4.SafeList;
import edu.mit.csail.sdg.ast.Command;
import edu.mit.csail.sdg.ast.ExprConstant;
import edu.mit.csail.sdg.ast.Sig;
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
import java.util.concurrent.TimeoutException;

import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class AlloyInstanceController {
    @Value("${API_URL:http://127.0.0.1:8000/}")
    private String apiUrl;
    public static int TIME_OUT = 60;
    public static int MAX_RUNNING = 10;

    protected static int running = 0;

    static Map<String, StoredSolution> instances = new LinkedHashMap<>();

    public static A4Options getOptions() {
        A4Options opt = new A4Options();
        opt.solver = A4Options.SatSolver.SAT4J;
        return opt;
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/alloy/instance")
    public String getInstance(
            @RequestParam(required = true) String check,
            @RequestParam(required = true) String p,
            @RequestParam(required = true) int cmd) throws IOException {

        if (!"ALS".equalsIgnoreCase(check)) {
            JSONObject obj = new JSONObject();
            obj.put("error", "Invalid Permalink");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

        String code = getCodeByPermalink(check, p);
        if (code == null) {
            JSONObject obj = new JSONObject();
            obj.put("error", "Invalid Permalink");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

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
            runCommand = new Command(Pos.UNKNOWN, ExprConstant.TRUE, "FMPlayDefault", false, 4, 4, 4, -1, -1, -1, null,
                    null, runCommand.formula, null);
        }

        A4Options options = getOptions();
        // get the first instance of the Alloy file
        A4Solution instance;
        SafeList<Sig> sigs = module.getAllSigs();
        try {
            Command finalRunCommand = runCommand;
            instance = runTimed(new InstanceRunner() {
                @Override
                public A4Solution runInstance() {
                    return TranslateAlloyToKodkod.execute_command(A4Reporter.NOP, sigs, finalRunCommand, options);
                }
            }, TIME_OUT);
        } catch (Throwable t) {
            // return error message as JSON with http status code 400
            JSONObject obj = new JSONObject();
            String message = t.getMessage();
            obj.put("error", message);
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
        String textInstance = instance.toString();
        xmlJSONObj.append("textInstance", textInstance);
        String jsonPrettyPrintString = xmlJSONObj.toString(4);

        return jsonPrettyPrintString;
    }

    public String getCodeByPermalink(String check, String p) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = apiUrl + "api/permalink/?check=" + check + "&p=" + p;
            String response = restTemplate.getForObject(url, String.class);
            JSONObject obj = new JSONObject(response);
            return obj.getString("code");

        } catch (Exception e) {
            return null;
        }
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

    @CrossOrigin(origins = "*")
    @PostMapping("/alloy/nextInstance")
    public String getNextInstance(@RequestBody String specId) throws IOException {
        StoredSolution storedSolution = instances.get(specId);
        if (storedSolution == null) {
            JSONObject obj = new JSONObject();
            obj.put("error", "No instance found, possibly cleaned up in the meantime");
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }

        A4Solution instance = storedSolution.getSolution();

        try {
            final A4Solution finalInstance = instance;
            instance = runTimed(new InstanceRunner() {
                @Override
                public A4Solution runInstance() {
                    return finalInstance.next();
                }
            }, TIME_OUT);
        } catch (Throwable t) {
            JSONObject obj = new JSONObject();
            String message = t.getMessage();
            obj.put("error", message);
            obj.put("status", HttpStatus.BAD_REQUEST.value());
            return obj.toString();
        }
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
        String textInstance = instance.toString();
        xmlJSONObj.append("textInstance", textInstance);
        String jsonPrettyPrintString = xmlJSONObj.toString(4);

        return jsonPrettyPrintString;
    }

    @Scheduled(fixedRate = 30000)
    public void removeOlsInstances() {
        long currentTime = System.currentTimeMillis();
        instances.entrySet().removeIf(entry -> currentTime - entry.getValue().getLastAccessed() > 3600000);
    }

    public A4Solution runTimed(InstanceRunner r, int seconds) throws Throwable {

        if (running >= MAX_RUNNING) {
            throw new RuntimeException("Too many instances running. Please try again later.");
        }
        Thread t = new Thread(r);
        t.start();

        // wait for the thread to finish or timeout
        running++;
        t.join(seconds * 1000);
        running--;

        if (t.isAlive()) {
            t.stop();
            throw new TimeoutException("Analysis timed out after " + seconds + " seconds.");
        }
        if (r.instance == null) {
            throw r.reasonForFailing;
        }
        return r.instance;
    }

    private abstract class InstanceRunner implements Runnable {
        private A4Solution instance;
        private Throwable reasonForFailing;

        public abstract A4Solution runInstance();

        @Override
        public void run() {
            try {
                instance = runInstance();
            } catch (Throwable t) {
                reasonForFailing = t;
            }
        }
    }
}
