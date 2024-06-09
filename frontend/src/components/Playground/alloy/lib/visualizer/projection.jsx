import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { displayError } from '../editor/feedback';
import { getCurrentState } from '../editor/state';

// Assuming cy is an instance of Cytoscape.js
import cy from 'cytoscape';

// Utility functions (like lastFrame) should be defined or imported accordingly

const ProjectionComponent = () => {
  const [currentlyProjectedSigs, setCurrentlyProjectedSigs] = useState([]);
  const [currentFramePosition, setCurrentFramePosition] = useState({});
  const [allNodes, setAllNodes] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [lastId, setLastId] = useState(null);
  const [currentInstance, setCurrentInstance] = useState(null);
  const [frameUpdated, setFrameUpdated] = useState(false);

  useEffect(() => {
    // Initialize session or other states if needed
    // Example:
    // setLastId(Session.get('last_id'));
    // setCurrentInstance(Session.get('currentInstance'));
  }, []);

  const project = async () => {
    try {
      const response = await axios.post('/api/getProjection', {
        lastId,
        currentFramePosition,
        currentInstance
      });
      processProjection(null, response.data);
    } catch (err) {
      processProjection(err);
    }
  };

  const processProjection = (err, projection) => {
    if (err) return displayError(err);
    updateGraph(projection[0], false);
    applyPositions();
  };

  const addSigToProjection = (newType) => {
    if (allNodes.length === 0) setAllNodes(cy.nodes());
    const atoms = lastFrame(newType);
    if (!currentlyProjectedSigs.includes(newType)) {
      const updatedSigs = [...currentlyProjectedSigs, newType].sort();
      setCurrentlyProjectedSigs(updatedSigs);
      setCurrentFramePosition({ ...currentFramePosition, [newType]: atoms >= 0 ? 0 : currentFramePosition[newType] });

      // Update frame picker UI (using React state or refs)
      // Example:
      // setFramePickerOptions([...framePickerOptions, newType]);

      project();
      setFrameUpdated(!frameUpdated);
    } else {
      throw `${newType} already being projected.`;
    }
  };

  const removeSigFromProjection = (type) => {
    const index = currentlyProjectedSigs.indexOf(type);
    if (index === -1) throw `${type} not found in types being projected.`;
    const updatedSigs = currentlyProjectedSigs.filter((sig) => sig !== type);
    setCurrentlyProjectedSigs(updatedSigs);
    const updatedFramePosition = { ...currentFramePosition };
    delete updatedFramePosition[type];
    setCurrentFramePosition(updatedFramePosition);

    // Update frame picker UI
    // Example:
    // setFramePickerOptions(framePickerOptions.filter(option => option !== type));

    if (updatedSigs.length === 0) {
      const instance = getCurrentState();
      if (instance) updateGraph(instance);
    } else {
      project();
    }
    setFrameUpdated(!frameUpdated);
  };

  const newInstanceSetup = () => {
    const newFramePosition = {};
    if (currentlyProjectedSigs.length !== 0) {
      currentlyProjectedSigs.forEach((sig) => {
        newFramePosition[sig] = 0;
      });
      setCurrentFramePosition(newFramePosition);
      setAllNodes(cy.nodes());
      project();
      // Update UI
      // Example:
      // setFramePickerOptions(currentlyProjectedSigs);
      // setFramePickerDisabled(false);
    }
  };

  const staticProjection = () => {
    // Update UI
    // Example:
    // setFramePickerOptions([currentlyProjectedSigs[0]]);
    // setFramePickerDisabled(true);
  };

  const savePositions = () => {
    const atoms = cy.nodes();
    const newPosition = {};
    atoms.forEach((atom) => {
      newPosition[atom.data().id] = { ...atom.position() };
    });
    setNodePositions(newPosition);
  };

  const applyPositions = () => {
    for (const id in nodePositions) {
      const node = cy.nodes(`[id='${id}']`);
      if (node.length > 0) {
        node[0].position(nodePositions[id]);
      }
    }
  };

  const resetPositions = () => {
    setNodePositions({});
  };

  return (
    <div>
      {/* Render UI components such as frame picker, buttons, etc. */}
    </div>
  );
};

export default ProjectionComponent;
