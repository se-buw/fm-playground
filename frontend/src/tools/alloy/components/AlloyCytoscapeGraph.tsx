import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import CytoscapeStylesheet from './CytoscapeStylesheet';

interface AlloyCytoscapeGraphProps {
  alloyVizGraph: any[];
  height: string;
}

const AlloyCytoscapeGraph: React.FC<AlloyCytoscapeGraphProps> = ({ alloyVizGraph, height }) => {
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  const [layout] = useState({ name: 'breadthfirst' });
  const [stylesheet, setStylesheet] = useState<cytoscape.Stylesheet[]>([]);
  const [, setUniqueRelationships] = useState<any[]>([]);

  useEffect(() => {
    if (cyRef.current) {
      const layout = cyRef.current.layout({ name: 'breadthfirst' });
      layout.run();
    }
    const uniqueRels = [
      ...new Set(
        alloyVizGraph.filter((element) => element.data.relationship).map((element) => element.data.relationship)
      ),
    ];
    setUniqueRelationships(uniqueRels);
    setStylesheet(CytoscapeStylesheet(uniqueRels) as cytoscape.Stylesheet[]);
  }, [alloyVizGraph]);

  return (
    <CytoscapeComponent
      className='alloy-viz-area'
      elements={alloyVizGraph}
      style={{
        width: '100%',
        height: height,
      }}
      layout={layout}
      stylesheet={stylesheet}
      minZoom={0.1}
      maxZoom={1}
      cy={(cy) => (cyRef.current = cy)}
    />
  );
};

export default AlloyCytoscapeGraph;
