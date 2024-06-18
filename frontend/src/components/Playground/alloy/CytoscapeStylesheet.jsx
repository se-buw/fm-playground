import React from 'react'

const generateColor = () => {
  let letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color;
};

const getCssVariable = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const CytoscapeStylesheet = (uniqueRelationships) => {
  const primaryTextColor = getCssVariable('--primary-text-color');
  const styles = [
    {
      selector: 'node',
      style: {
        width: 100,
        height: 40,
        'background-color': 'orange',
        shape: 'roundrectangle',
        'text-valign': 'center',
        'text-halign': 'center',
        label: 'data(label)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 5,
        'line-color': 'blue',
        'target-arrow-color': 'blue',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(relationship)',
        color: primaryTextColor,
        'text-rotation': 'autorotate',
        'font-size': 18,
        'text-margin-x': -15,
      },
    },
  ];

  uniqueRelationships.forEach((relationship) => {
    const color = generateColor();
    styles.push({
      selector: `edge[relationship="${relationship}"]`,
      style: {
        'line-color': color,
        'target-arrow-color': color,
      },
    });
  });

  return styles;
};

export default CytoscapeStylesheet