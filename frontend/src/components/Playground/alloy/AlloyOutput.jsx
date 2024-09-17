import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { TbBinaryTree } from "react-icons/tb";
import { CiViewTable } from "react-icons/ci";
import { CiTextAlignLeft } from "react-icons/ci";
import {
  MDBBtn,
  MDBInput,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane
} from 'mdb-react-ui-kit';
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
  const [lastInstance, setLastInstance] = useState([]);
  const [isLastInstance, setIsLastInstance] = useState(false);
  const [alloyTabularInstance, setAlloyTabularInstance] = useState('');
  const [alloyTextInstance, setAlloyTextInstance] = useState('');
  const [activeTab, setActiveTab] = useState('graph');
  const [isNextInstanceExecuting, setIsNextInstanceExecuting] = useState(false);

  /**
   * Update the Alloy instance in the state when the API response is received
  */
  useEffect(() => {
    setAlloyInstance(alloyInstance);
    setAlloySpecId(alloyInstance.specId);
    setalloyTraceIndex(0);
    setIsLastInstance(false);
  }, [alloyInstance]);

  /**
   * Prepare the Alloy instance for visualization from the API response
   * @param {Object} alloyInstance - The Alloy instance object
   */
  useEffect(() => {
    if (alloyInstance && "alloy" in alloyInstance && "specId" in alloyInstance) { // if there is an instance
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
        setLastInstance(graphData);
        if (isTemporal)
          setAlloyTraceLoop(`Trace Length: ${traceLength} | Backloop: ${backloop}`)
        else
          setAlloyTraceLoop('');
      } else { // instance found but empty
        const graphData = getGraphData(instances[0]);
        setAlloyPlainMessage(graphData.length === 0 ? "Empty Instance" : '');
        setAlloyVizGraph(graphData);
        setLastInstance(graphData);
        if (isTemporal)
          setAlloyTraceLoop(`Trace Length: ${traceLength} | Backloop: ${backloop}`)
        else
          setAlloyTraceLoop('');
      }
    }
    else if (alloyInstance && "error" in alloyInstance) { // instance not found and error message is present
      setAlloyVizGraph([]);
      if (alloyInstance["error"].includes("No instance found")) { // error for no instance found for the given command
        setIsInstance(false);
        setAlloyErrorMessage("No instance found");
      } else if (alloyInstance["error"].includes("No more instances")) { // when we reach the last instance, keep the last instance in the graph and show the message
        setIsInstance(true);
        setAlloyVizGraph(lastInstance);
        setAlloyPlainMessage("No more instances");
      }
      else if (alloyInstance["error"]) { // other errors like syntax error, type error etc.
        setIsInstance(false);
        setAlloyErrorMessage(parseAlloyErrorMessage(alloyInstance["error"]));
        setLineToHighlight(getLineToHighlight(alloyInstance["error"], 'alloy'));
      } else { // unknown error
        setIsInstance(false);
        setAlloyPlainMessage(alloyInstance["error"]);
      }
    }

    // Tabular instance
    if (alloyInstance && "tabularInstance" in alloyInstance) {
      setAlloyTabularInstance(alloyInstance["tabularInstance"][0]);
    }

    // Tabular instance
    if (alloyInstance && "textInstance" in alloyInstance) {
      setAlloyTextInstance(alloyInstance["textInstance"][0]);
    }
  }, [alloyInstance, alloyTraceIndex, isTemporal]);

  const handleNextInstance = () => {
    setIsNextInstanceExecuting(true);
    getAlloyNextInstance(alloySpecId)
      .then((data) => {
        if (data["error"] && data["error"].includes("No more instances")) {
          setAlloyInstance(alloyInstance);
          setIsLastInstance(true);
          setalloyTraceIndex(0);
          setIsNextInstanceExecuting(false);
          return;
        }
        setAlloyInstance(data);
        setalloyTraceIndex(0);
        setIsNextInstanceExecuting(false);
      })
      .catch((error) => {
        console.log(error);
        setIsNextInstanceExecuting(false);
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

  const handleTabClick = (tabValue) => {
    if (tabValue === activeTab) return;
    setActiveTab(tabValue);
  }


  return (
    <div>
      {isInstance ? (
        <div>
          <MDBTabs justify >
            <MDBTabsItem>
              <MDBTabsLink onClick={() => handleTabClick('graph')} active={activeTab === 'graph'}><TbBinaryTree /> Viz</MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink onClick={() => handleTabClick('tabular')} active={activeTab === 'tabular'}><CiViewTable /> Table</MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink onClick={() => handleTabClick('text')} active={activeTab === 'text'}><CiTextAlignLeft /> Text</MDBTabsLink>
            </MDBTabsItem>
          </MDBTabs>

          <MDBTabsContent>
            <MDBTabsPane open={activeTab === 'graph'}>
              <AlloyCytoscapeGraph
                alloyVizGraph={alloyVizGraph}
                height={isFullScreen ? '80vh' : '57vh'}
              />
            </MDBTabsPane>
            <MDBTabsPane open={activeTab === 'tabular'}>
              <PlainOutput
                code={alloyTabularInstance}
                height={isFullScreen ? '80vh' : '57vh'}
                onChange={() => { }} />
            </MDBTabsPane>

            <MDBTabsPane open={activeTab === 'text'}>
              <PlainOutput
                code={alloyTextInstance}
                height={isFullScreen ? '80vh' : '57vh'}
                onChange={() => { }} />
            </MDBTabsPane>
          </MDBTabsContent>

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
                disabled={isNextInstanceExecuting || isLastInstance}
              >
                {isNextInstanceExecuting ? "Computing..." : isTemporal ? "Next Trace" : "Next Instance"}
                {/* {isTemporal ? "Next Trace" : "Next Instance"} */}
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
