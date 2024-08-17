export function getGraphData(alloyInstance) {
  const nodes = new Set();
  const edges = [];
  const subsetSigs = new Set();

  function getAtomsFromSig(d) {
    function searchNestedDict(d) {
      if (typeof d === 'object' && d !== null) {
        for (const [k, v] of Object.entries(d)) {
          if (k === 'atom') {
            if (Array.isArray(v)) {
              for (const item of v) {
                if ('label' in item) {
                  nodes.add(String(item['label']).replace('$', ''));
                }
              }
            } else if ('label' in v) {
              nodes.add(String(v['label']).replace('$', ''));
            }
          } else if (typeof v === 'object') {
            searchNestedDict(v);
          }
        }
      } else if (Array.isArray(d)) {
        for (const i of d) {
          searchNestedDict(i);
        }
      }
    }
    searchNestedDict(d);

    // Handle Subset sigs. Issue #9
    const varSigs = d
      .filter(item => item.var === "yes" && item.atom)
      .flatMap(item => {
        const atoms = Array.isArray(item.atom) ? item.atom : [item.atom];
        return atoms.map(atomItem => ({
          atom: atomItem.label.replace('$', ''),  // Remove the $ symbol
          label: item.label,
        }));
      });
    varSigs.forEach(item => {
      subsetSigs.add(item);
    });

  }

  function processField(field) {
    const label = field['label'];
    // relationship is computed from the field label and the types of the atoms
    const atomTypes = [];
    // check length of types array
    if (field['types']['type']) {
      // collect type elements in field['types'] types 
      for (const type of field['types']['type'] || {}) {
        atomTypes.push(type['ID']);
      }
    } else {
      for (const obj of field['types'] || {}) {
        for (const type of obj['type'] || {}) {
          atomTypes.push(type['ID']);
        }
      }
    }
    const relationship = field['label'] + ' (' + atomTypes.join('_') + ')';
    const tupleField = field['tuple'] || {};
    const tuples = Array.isArray(tupleField) ? tupleField : [tupleField];
    for (const t of tuples) {
      if (typeof t === 'object' && t !== null) {
        const atoms = t['atom'] || [];
        if (atoms.length >= 2) {
          if (atoms.length > 2) { // Nested relation according to official Alloy 
            const sourceLabel = atoms[0]['label'].toString();
            const targetLabel = atoms[atoms.length - 1]['label'].toString();
            if (sourceLabel && targetLabel) {
              nodes.add(sourceLabel.replace('$', ''));
              nodes.add(targetLabel.replace('$', ''));
              for (let i = 1; i < atoms.length - 1; i++) {
                const nodeLabel = atoms[i]['label'].toString();
                edges.push({
                  "data": {
                    "id": `${sourceLabel}_${targetLabel}_${label}_[${nodeLabel.replace('$', '')}]`,
                    "label": `${label} [${nodeLabel.replace('$', '')}]`,
                    "source": sourceLabel.replace('$', ''),
                    "target": targetLabel.replace('$', ''),
                    "relationship": relationship,
                  }
                });
              }
            }

          } else {
            const sourceLabel = atoms[0]['label'].toString();
            const targetLabel = atoms[1]['label'].toString();
            if (sourceLabel && targetLabel) {
              nodes.add(sourceLabel.replace('$', ''));
              nodes.add(targetLabel.replace('$', ''));
              edges.push({
                "data": {
                  "id": `${sourceLabel}_${targetLabel}`,
                  "label": label,
                  "source": sourceLabel.replace('$', ''),
                  "target": targetLabel.replace('$', ''),
                  "relationship": relationship,
                }
              });
            }
          }
        } else if (Array.isArray(t)) {
          for (const atom of t) {
            if (typeof atom === 'object' && atom !== null) {
              const sourceLabel = atom['label'].toString();
              if (sourceLabel) {
                nodes.add(sourceLabel.replace('$', ''));
              }
            }
          }
        }
      }
    }
  }

  if ('sig' in alloyInstance) {
    getAtomsFromSig(alloyInstance["sig"]);
  }
  if ('field' in alloyInstance) {
    const fields = Array.isArray(alloyInstance["field"]) ? alloyInstance["field"] : [alloyInstance["field"]];
    for (const field of fields) {
      processField(field);
    }
  }

  const nodeList = Array.from(nodes).map(node => ({ "data": { "id": node, "label": node } }));
  const elements = nodeList.concat(edges);

  // Handle Subset sigs. Issue #9
  const atomLabelMap = new Map();
  subsetSigs.forEach(item => {
    // Group labels by atom
    if (atomLabelMap.has(item.atom)) {
      atomLabelMap.get(item.atom).push(item.label);
    } else {
      atomLabelMap.set(item.atom, [item.label]);
    }
  });
  elements.forEach(element => {
    const id = element.data.id;
    if (atomLabelMap.has(id)) {
      const labels = atomLabelMap.get(id);
      // Update the element's label by concatenating all related labels
      element.data.label = `${id} (${labels.join(', ')})`;
    }
  });
  return elements;
}

export function parseAlloyErrorMessage(error) {
  let message = '';
  if (error.includes('error') && error.includes('.als') && error.includes('line')) {
    message = error.replace(/ in .+\.als/, '');
  } else if (error.includes('The required JNI library cannot be found')) {
    message = 'The required JNI library cannot be found.';
  } else {
    message = error;
  }
  return message;
}

export function getTraceLengthAndBackloop(alloyInstance) {
  let traceLength = null;
  let backloop = null;
  if ('tracelength' in alloyInstance) {
    traceLength = alloyInstance['tracelength'];
  }
  if ('backloop' in alloyInstance) {
    backloop = alloyInstance['backloop'];
  }
  return { traceLength, backloop };
}