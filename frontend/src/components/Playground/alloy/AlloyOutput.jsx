import React, { useState, useEffect } from 'react';
import AlloyCytoscapeGraph from './AlloyCytoscapeGraph';
import { getAlloyNextInstance } from '../../../api/toolsApi';
import { getGraphData } from '../../../assets/js/alloyUtils';
import { MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";



const AlloyOutput = ({ alloyInstance, setAlloyInstance, height }) => {
  const [alloyTraceIndex, setalloyTraceIndex] = useState(0);
  const [alloySpecId, setAlloySpecId] = useState(null);
  const [alloyVizGraph, setAlloyVizGraph] = useState([]);
  const [isTemporal, setIsTemporal] = useState(false);

  /**
   * Update the Alloy instance in the state when the API response is received
  */
  useEffect(() => {
    setAlloyInstance(alloyInstance);
    setAlloySpecId(alloyInstance.specId);
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
      const instances = Array.isArray(alloy["instance"]) ? alloy["instance"] : [alloy["instance"]];
      if (instances.length > 1 && alloyTraceIndex < instances.length) {
        setAlloyVizGraph(getGraphData(instances[alloyTraceIndex]));
      } else {
        setAlloyVizGraph(getGraphData(instances[0]));
      }
      setIsTemporal(instances.some((instance) => instance["mintrace"] !== -1));

    }
    else if (alloyInstance && "error" in alloyInstance) {
      setAlloyVizGraph([]);
      console.log(alloyInstance["error"]);
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
    // Prevent negative index
    if (alloyTraceIndex > 0) {
      setalloyTraceIndex(alloyTraceIndex - 1);
    }
  }

  return (
    <div>
      <div>
      </div>
      <AlloyCytoscapeGraph
        alloyVizGraph={alloyVizGraph}
        height={height}
      />
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
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'  }}
          >
            {alloyTraceIndex > 0 &&
              <IconButton
                onClick={handleBackwardTrace}
              >
                <FaArrowLeft
                  className='playground-icon'
                  role='button'
                />
              </IconButton>
            }
            <MDBInput
            style={{ width: '50px' }}
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
  );
};

export default AlloyOutput;
