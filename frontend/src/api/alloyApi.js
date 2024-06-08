import axios from "axios";
import { saveCode } from "./playgroundApi";

const ALLOY_API_URL = import.meta.env.VITE_ALLOY_API_URL;
const MAX_INSTANCES = import.meta.env.VITE_ALLOY_MAX_INSTANCES;

/**
 * Method to execute the current model and get model instances.
 * This will call the Alloy API (webService). If the model contains
 * secrets and the previous didn't (if any), will become a new derivation
 * root (although it still registers the derivation).
 *
 * @param {String} code the Alloy model to execute
 * @param {Number} commandIndex the index of the command to execute
 * @param {String} currentModelId the id of the current model (from which the new will derive)
 *
 * @returns the instance data and the id of the new saved model
 */
export async function getInstances(code, commandIndex, currentModelId) {
  let url = `${ALLOY_API_URL}/getInstances`;
  // saveCode(code);
  try {
    const response = await axios.post(url, {
      model: code,
      numberOfInstances: 20,
      commandIndex: commandIndex,
      sessionId: currentModelId,
    });
    console.log(response)
    return response;
  } catch (error) {
    console.log(error);
  }
}

