import React, { useState } from 'react';
import AlloyCytoscapeGraph from './AlloyCytoscapeGraph';

const AlloyOutput = ({alloyGraphElements, height}) => {
  return (
    <AlloyCytoscapeGraph
      alloyGraphElements={alloyGraphElements}
      height={height}
    />
  );
};

export default AlloyOutput;
