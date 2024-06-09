import React, { useEffect, useRef } from 'react';
import useCytoscape from './useCytoscape';
import { updateRightClickContent } from '../../templates/visSettings/rightClickMenu';
import { instChanged, getCurrentTrace, getCurrentState } from '../editor/state';
import { savePositions } from './projection';

const GraphViewer = ({ instance, layoutUpdated }) => {
  const cyRef = useRef(null);

  useCytoscape('cy');

  useEffect(() => {
    if (cyRef.current) {
      updateGraph(instance, layoutUpdated);
    }
  }, [instance, layoutUpdated]);

  const updateGraph = (instance, v) => {
    const cy = cyRef.current;
    cy.remove(cy.elements());
    generalSettings.resetHierarchy();
    const allNodes = getAtoms(instance);
    cy.add(allNodes);
    cy.add(getEdges(instance));
    cy.resize();
    refreshGraph();
    if (!v) applyCurrentLayout();
  };

  const getAtoms = (inst) => {
    const atoms = [];
    inst.types.forEach((sig) => {
      const tp = sig.name;
      generalSettings.addPrimSig(tp, sig.parent);
      sig.atoms.forEach((atom) => {
        atoms.push({
          group: 'nodes',
          classes: 'multiline-manual',
          data: {
            id: atom,
            type: tp,
            subsetSigs: [],
          },
        });
      });
    });

    inst.sets.forEach((set) => {
      set.atoms.forEach((atom) => {
        const tp = set.name;
        for (let i = 0; i < atoms.length; i++) {
          if (atoms[i].data.id === atom) {
            let paren = atoms[i].data.type;
            const canon = `${tp}:${paren}`;
            if (!generalSettings.hasSubsetSig(canon)) {
              generalSettings.addSubSig(canon, paren);
            }
            atoms[i].data.subsetSigs.push(canon);
          }
        }
      });
    });

    return atoms;
  };

  const getEdges = (inst) => {
    const result = [];
    inst.rels.forEach((field) => {
      field.atoms.forEach((relation) => {
        result.push({
          group: 'edges',
          selectable: true,
          data: {
            relation: field.name,
            source: relation[0],
            target: relation[relation.length - 1],
            atoms: relation,
          },
        });
      });
    });
    return result;
  };

  const refreshGraph = () => {
    const cy = cyRef.current;
    const selected = cy.$(':selected');
    cy.elements().select().unselect();
    selected.select();
  };

  const applyCurrentLayout = () => {
    const cy = cyRef.current;
    const tmp = cy.elements();
    if (getCurrentTrace().instance) {
      getCurrentTrace().instance.forEach((x) => {
        cy.add(getAtoms(x));
        cy.add(getEdges(x));
      });
    }
    const hds = cy.elements((element, i) => !i.visible());
    cy.remove(hds);
    cy.layout(layouts[generalSettings.getLayout()]).run();
    savePositions();
    cy.remove(cy.elements().subtract(tmp));
  };

  return <div id="cy" style={{ width: '100%', height: '100%' }} ref={cyRef} />;
};

export default GraphViewer;
