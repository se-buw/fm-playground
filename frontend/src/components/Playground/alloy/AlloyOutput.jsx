import React, { useState, useEffect } from 'react';
import AlloyCytoscapeGraph from './AlloyCytoscapeGraph';
import { getAlloyNextInstance } from '../../../api/toolsApi';

const AlloyOutput = ({ alloyGraphElements, setAlloyGraphElements, alloySpecId, height }) => {
  useEffect(() => {
    setAlloyGraphElements(alloyGraphElements);
  }, [alloyGraphElements]);

  const handleNextInstance = () => {
    getAlloyNextInstance(alloySpecId)
      .then((data) => {
        console.log(data)
        setAlloyGraphElements(data.elements);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div>
      <AlloyCytoscapeGraph
        alloyGraphElements={alloyGraphElements}
        height={height}
      />
      <button
      onClick={handleNextInstance}
      >
        Next
      </button>
    </div>
  );
};

export default AlloyOutput;
