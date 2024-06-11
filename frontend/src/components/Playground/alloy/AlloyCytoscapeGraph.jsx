import React, {useEffect, useState} from 'react'
import CytoscapeComponent from "react-cytoscapejs";
import CytoscapeStylesheet from './CytoscapeStylesheet';

const AlloyCytoscapeGraph = ({alloyGraphElements, height}) => {
  const cyRef = React.useRef(null);
  const [layout, setLayout] = useState({ name: "breadthfirst" });
  const [stylesheet, setStylesheet] = useState([]);
  const [uniqueRelationships, setUniqueRelationships] = useState('');

  useEffect(() => {
    if (cyRef.current) {
      const layout = cyRef.current.layout({ name: 'breadthfirst' });
      layout.run();
    }
    const uniqueRels = [
      ...new Set(
        alloyGraphElements
          .filter((element) => element.data.relationship)
          .map((element) => element.data.relationship)
      ),
    ];
    setUniqueRelationships(uniqueRels);
    setStylesheet(CytoscapeStylesheet(uniqueRels));
  }, [alloyGraphElements]);


  return (
    <CytoscapeComponent
      elements={alloyGraphElements}
      style={{
        width: "100%",
        height: height,
        border: "1px solid black",
        borderRadius: '10px'
      }}
      layout={layout}
      stylesheet={stylesheet}
      minZoom={0.1}
      maxZoom={1}
      
      cy={(cy) => (cyRef.current = cy)}
    />
  );
}

export default AlloyCytoscapeGraph;