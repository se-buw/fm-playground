import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import AlloyCytoscapeGraph from './AlloyCytoscapeGraph';
import { getAlloyNextInstance } from '../../../api/toolsApi';
import PlainOutput from '../PlainOutput';
import { 
  getGraphData, 
  parseAlloyErrorMessage, 
  getTraceLengthAndBackloop 
} from '../../../assets/js/alloyUtils';



const AlloyOutput = ({ alloyInstance, setAlloyInstance, height, isFullScreen }) => {
  const [alloyTraceIndex, setalloyTraceIndex] = useState(0);
  const [alloySpecId, setAlloySpecId] = useState(null);
  const [alloyVizGraph, setAlloyVizGraph] = useState([]);
  const [isTemporal, setIsTemporal] = useState(false);
  const [isInstance, setIsInstance] = useState(true);
  const [alloyErrorMessage, setAlloyErrorMessage] = useState('');
  const [alloyPlainMessage, setAlloyPlainMessage] = useState('');
  const [alloyTraceLoop, setAlloyTraceLoop] = useState('');

  /**
   * Update the Alloy instance in the state when the API response is received
  */
  useEffect(() => {
    setAlloyInstance(alloyInstance);
    setAlloySpecId(alloyInstance.specId);
    setalloyTraceIndex(0);
  }, [alloyInstance]);

  /**
   * Prepare the Alloy instance for visualization from the API response
   * @param {Object} alloyInstance - The Alloy instance object
   */
  useEffect(() => {
    if (alloyInstance && "alloy" in alloyInstance && "specId" in alloyInstance) {
      const alloy = alloyInstance["alloy"];
      const specId = alloyInstance["specId"][0] || alloyInstance["specId"];
      setAlloySpecId(specId);
      setIsInstance(true);
      const instances = Array.isArray(alloy["instance"]) ? alloy["instance"] : [alloy["instance"]];
      if (instances.length > 1 && alloyTraceIndex < instances.length) {
        const graphData = getGraphData(instances[alloyTraceIndex]);
        const { traceLength, backloop } = getTraceLengthAndBackloop(instances[alloyTraceIndex]);
        setAlloyPlainMessage(graphData.length === 0 ? "Empty Instance" : '');
        setAlloyVizGraph(graphData);
        setAlloyTraceLoop(`Trace Length: ${traceLength} Backloop: ${backloop}`)
      } else {
        const graphData = getGraphData(instances[0]);
        const { traceLength, backloop } = getTraceLengthAndBackloop(instances[0]);
        setAlloyPlainMessage(graphData.length === 0 ? "Empty Instance" : '');
        setAlloyVizGraph(graphData);
        setAlloyTraceLoop(`Trace Length: ${traceLength} Backloop: ${backloop}`)
      }
      setIsTemporal(instances.some((instance) => instance["mintrace"] !== -1));

    }
    else if (alloyInstance && "error" in alloyInstance) {
      setAlloyVizGraph([]);
      if (alloyInstance["error"].includes("No instance found")) {
        setIsInstance(false);
        setAlloyErrorMessage("No instance found");
      } else if (alloyInstance["error"].includes("Syntax error")) {
        setAlloyErrorMessage(parseAlloyErrorMessage(alloyInstance["error"]));
      } else {
        setAlloyPlainMessage(alloyInstance["error"]);
      }
    }
  }, [alloyInstance, alloyTraceIndex]);

  const handleNextInstance = () => {
    getAlloyNextInstance(alloySpecId)
      .then((data) => {
        setAlloyInstance(data);
        setalloyTraceIndex(0);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleForwardTrace = () => {
    setalloyTraceIndex(alloyTraceIndex + 1);
  }

  const handleBackwardTrace = () => {
    if (alloyTraceIndex > 0) {
      setalloyTraceIndex(alloyTraceIndex - 1);
    }
  }

  const handleAlloyErrorMessageChange = (value) => {
    setAlloyErrorMessage(value);
  }

  return (
    <div>
      {isInstance ? (
        <div>
          <AlloyCytoscapeGraph
            alloyVizGraph={alloyVizGraph}
            height={height}
          />
          <div>
            <pre
              className='plain-output-box'
              contentEditable={false}
              style={{ 
                borderRadius: '8px', 
                textAlign: 'center',
                whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: alloyPlainMessage ? alloyPlainMessage + ' | ' + alloyTraceLoop : alloyTraceLoop }}
            />
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {alloyInstance && "alloy" in alloyInstance && "specId" in alloyInstance &&
              <MDBBtn
                color="success"
                onClick={handleNextInstance}
              >{isTemporal ? "Next Trace" : "Next Instance"}
              </MDBBtn>
            }
            {isTemporal &&
              <div
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <IconButton
                  onClick={handleBackwardTrace}
                >
                  <FaArrowLeft
                    className='playground-icon'
                    role='button'
                  />
                </IconButton>
                <MDBInput
                  style={{ width: '50px', textAlign: 'center'}}
                  type="text"
                  readonly
                  value={alloyTraceIndex} />
                <IconButton
                  onClick={handleForwardTrace}
                ><FaArrowRight
                    className='playground-icon'
                    role='button'
                  />
                </IconButton>
              </div>
            }
          </div>
        </div>
      ) : (
        <PlainOutput
          code={alloyErrorMessage}
          height={isFullScreen ? '80vh' : '60vh'}
          onChange={handleAlloyErrorMessageChange} />
      )
      }
    </div>
  );
};

export default AlloyOutput;
