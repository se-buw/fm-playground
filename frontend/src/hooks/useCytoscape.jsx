import { useEffect } from 'react';
import cytoscape from 'cytoscape';
import { updateRightClickContent } from '../../templates/visSettings/rightClickMenu';
import { instChanged, getCurrentTrace, getCurrentState } from '../editor/state';
import { savePositions } from './projection';

const useCytoscape = (elementId) => {
    useEffect(() => {
        const cy = cytoscape({
            container: document.getElementById(elementId),
            elements: [],
            zoom: 1,
            pan: { x: 0, y: 0 },
            minZoom: 0.2,
            maxZoom: 5,
            wheelSensitivity: 0.5,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': (ele) => {
                            let val;
                            if (ele.data().subsetSigs.length > 0) {
                                val = sigSettings.getInheritedAtomColor(ele.data().subsetSigs[0]);
                            } else {
                                val = sigSettings.getInheritedAtomColor(ele.data().type);
                            }
                            return val;
                        },
                        label: (ele) => {
                            const l = ele.data().id;
                            const subsigs = ele.data().subsetSigs.length > 0 ? `\n(${ele.data().subsetSigs.map(x => x.split(':')[0])})` : '';
                            const attributes = relationSettings.getAttributeLabel(getCurrentState(), ele);
                            return `${l}${subsigs}\n${attributes}`;
                        },
                        'border-style': (ele) => {
                            let val;
                            if (ele.data().subsetSigs.length > 0) {
                                val = sigSettings.getInheritedAtomBorder(ele.data().subsetSigs[0]);
                            } else {
                                val = sigSettings.getInheritedAtomBorder(ele.data().type);
                            }
                            return val;
                        },
                        'text-valign': 'center',
                        'text-outline-color': 'black',
                        shape: (ele) => {
                            let val;
                            if (ele.data().subsetSigs.length > 0) {
                                val = sigSettings.getInheritedAtomShape(ele.data().subsetSigs[0]);
                            } else {
                                val = sigSettings.getInheritedAtomShape(ele.data().type);
                            }
                            return val;
                        },
                        visibility: (ele) => {
                            if (ele.data().type === 'seq/Int') return 'hidden';
                            let val1 = true;
                            if (ele.data().subsetSigs.length > 0) {
                                ele.data().subsetSigs.forEach(ss => {
                                    val1 = val1 && sigSettings.getInheritedAtomVisibility(ss);
                                });
                            } else {
                                val1 = sigSettings.getInheritedAtomVisibility(ele.data().type);
                            }
                            return val1 ? 'hidden' : 'visible';
                        },
                        width: 'label',
                        height: 'label',
                        'padding-bottom': '10px',
                        'padding-top': '10px',
                        'padding-left': '10px',
                        'padding-right': '10px',
                        'border-color': 'black',
                        'border-width': 2,
                        'border-opacity': 0.8,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        width: 1,
                        'line-color': (ele) => relationSettings.getEdgeColor(ele.data().relation),
                        'target-arrow-color': (ele) => relationSettings.getEdgeColor(ele.data().relation),
                        'target-arrow-shape': 'triangle',
                        label: (ele) => relationSettings.getEdgeLabel(ele),
                        'curve-style': 'bezier',
                        'text-valign': 'center',
                        'text-outline-color': '#ff3300',
                        'edge-text-rotation': 'autorotate',
                        'line-style': (ele) => relationSettings.getEdgeStyle(ele.data().relation),
                        visibility: (ele) => {
                            const val = relationSettings.isShowAsArcsOn(ele.data().relation);
                            return val ? 'visible' : 'hidden';
                        },
                    },
                },
                {
                    selector: ':selected',
                    style: {
                        'background-opacity': 0.5,
                    },
                },
                {
                    selector: '.multiline-manual',
                    style: {
                        'text-wrap': 'wrap',
                    },
                },
                {
                    selector: 'edge:selected',
                    style: {
                        width: 5,
                    },
                },
                {
                    selector: ':parent',
                    style: {
                        'background-opacity': 0.3,
                        'text-valign': 'top',
                    },
                },
            ],
            layout: {
                name: 'grid',
                fit: true,
                sort: (a, b) => a.data('label') < b.data('label'),
                avoidOverlap: true,
            },
        });

        cy.on('cxttap', (evt) => {
            const evtTarget = evt.target;
            if (evtTarget === cy) {
                $('#optionsMenu').css({
                    'z-index': 10,
                    position: 'absolute',
                    top: evt.originalEvent.offsetY + 1,
                    left: evt.originalEvent.screenX + 1 + 300 > $(window).width() ? evt.originalEvent.offsetX + 1 - 300 : evt.originalEvent.offsetX + 1,
                }).fadeIn('slow');
                Session.set('rightClickRel', undefined);
                Session.set('rightClickSig', undefined);
                updateRightClickContent();
                return false;
            }
        });

        cy.on('cxttap', 'node', {}, (evt) => {
            $('#optionsMenu').css({
                'z-index': 10,
                position: 'absolute',
                top: evt.originalEvent.offsetY + 1,
                left: evt.originalEvent.screenX + 1 + 300 > $(window).width() ? evt.originalEvent.offsetX + 1 - 300 : evt.originalEvent.offsetX + 1,
            }).fadeIn('slow');
            Session.set('rightClickRel', undefined);
            Session.set('rightClickSig', [evt.target.data().type].concat(evt.target.data().subsetSigs));
            updateRightClickContent();
            return false;
        });

        cy.on('cxttap', 'edge', {}, (evt) => {
            $('#optionsMenu').css({
                'z-index': 10,
                position: 'absolute',
                top: evt.originalEvent.offsetY + 1,
                left: evt.originalEvent.screenX + 1 + 300 > $(window).width() ? evt.originalEvent.offsetX + 1 - 300 : evt.originalEvent.offsetX + 1,
            }).fadeIn('slow');
            Session.set('rightClickSig', undefined);
            Session.set('rightClickRel', [evt.target.data().relation]);
            updateRightClickContent();
            return false;
        });

        cy.on('tap', () => {
            $('#optionsMenu').hide();
        });

        cy.on('render', () => {
            instChanged();
        });

        return cy;
    }, [elementId]);

    return null;
};

export default useCytoscape;
