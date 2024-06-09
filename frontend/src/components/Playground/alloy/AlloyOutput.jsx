import React, {useState} from 'react';
import CytoscapeComponent from "react-cytoscapejs";


const AlloyOutput = ({ code, onChange, height }) => {
  const cyRef = React.useRef(null);
  // dummy elements
  const [elements, setElements] = useState([
    { data: { id: "a", label: "Node A" }, position: { x: 100, y: 100 } }, 
    { data: { id: "b", label: "Node B" }, position: { x: 200, y: 200 } },
    { data: { source: "a", target: "b" } }
  ])
  const [layout, setLayout] = useState({ name: "grid" });
  const [stylesheet, setStylesheet] = useState([
    {
      selector: "node",
      style: {
        width: 20,
        height: 20,
        label: "data(label)"
      }
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle"
      }
    }
  
  ])
  return (
    <CytoscapeComponent
      elements={elements}
      style={{
        width: "600px",
        height: "600px",
        border: "1px solid black"
      }}
      layout={layout}
      stylesheet={stylesheet}
      cy={(cy) => (cyRef.current = cy)}
    />
  );
};

export default AlloyOutput;
