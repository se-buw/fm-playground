import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import AlloyCytoscapeGraph from './AlloyCytoscapeGraph';
import { getAlloyNextInstance } from '../../../api/toolsApi';
import PlainOutput from '../PlainOutput';
import { getLineToHighlight } from '../../../assets/js/lineHighlightingUtil';
import {
  getGraphData,
  parseAlloyErrorMessage,
  getTraceLengthAndBackloop
} from '../../../assets/js/alloyUtils';
import '../../../assets/style/AlloyOutput.css';



const AlloyOutput = ({ alloyInstance, setAlloyInstance, height, isFullScreen, setLineToHighlight }) => {
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
      setIsTemporal(instances.some((instance) => instance["mintrace"] !== -1));
      const { traceLength, backloop } = getTraceLengthAndBackloop(instances[0]);
      if (instances.length > 1) {
        var instanceIndexToShow;
        if (alloyTraceIndex < instances.length) {
          instanceIndexToShow = alloyTraceIndex;
        } else {
          const m = (alloyTraceIndex - traceLength) % (traceLength - backloop);
          instanceIndexToShow = backloop + m;
        }
        const graphData = getGraphData(instances[instanceIndexToShow]);
        setAlloyPlainMessage(graphData.length === 0 ? "Empty Instance" : '');
        setAlloyVizGraph(graphData);
        if (isTemporal)
          setAlloyTraceLoop(`Trace Length: ${traceLength} | Backloop: ${backloop}`)
        else
          setAlloyTraceLoop('');
      } else {
        const graphData = getGraphData(instances[0]);
        setAlloyPlainMessage(graphData.length === 0 ? "Empty Instance" : '');
        setAlloyVizGraph(graphData);
        if (isTemporal)
          setAlloyTraceLoop(`Trace Length: ${traceLength} | Backloop: ${backloop}`)
        else
          setAlloyTraceLoop('');
      }
    }
    else if (alloyInstance && "error" in alloyInstance) {
      setAlloyVizGraph([]);
      if (alloyInstance["error"].includes("No instance found")) {
        setIsInstance(false);
        setAlloyErrorMessage("No instance found");
      } else if (alloyInstance["error"]) {
        setIsInstance(false);
        setAlloyErrorMessage(parseAlloyErrorMessage(alloyInstance["error"]));
        setLineToHighlight(getLineToHighlight(alloyInstance["error"], 'alloy'));
      } else {
        setIsInstance(false);
        setAlloyPlainMessage(alloyInstance["error"]);
      }
    }
  }, [alloyInstance, alloyTraceIndex, isTemporal]);

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
              className='plain-alloy-message-box'
              contentEditable={false}
              style={{
                height: alloyPlainMessage ? 'auto' : '35px',
              }}
              dangerouslySetInnerHTML={{ __html: alloyPlainMessage ? alloyPlainMessage + (alloyTraceLoop ? ' | ' + alloyTraceLoop : '') : alloyTraceLoop }}
            />
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
                  style={{ width: '50px', textAlign: 'center' }}
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
