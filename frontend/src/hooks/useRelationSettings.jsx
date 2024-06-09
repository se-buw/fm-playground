import { useState } from 'react';

const useRelationSettings = (initialSettings) => {
    const [edgeColors, setEdgeColors] = useState(initialSettings?.edgeColors || []);
    const [edgeStyles, setEdgeStyles] = useState(initialSettings?.edgeStyles || []);
    const [showAsArcs, setShowAsArcs] = useState(initialSettings?.showAsArcs || []);
    const [showAsAttributes, setShowAsAttributes] = useState(initialSettings?.showAsAttributes || []);

    const data = {
        edgeColors,
        edgeStyles,
        showAsAttributes,
        showAsArcs
    };

    const getEdgeLabel = (relEle) => {
        let relLabel = relEle.data().relation;

        if (relEle.data().atoms.length > 2) {
            let naryLabel = '';
            for (let i = 1; i < relEle.data().atoms.length - 1; i++) {
                const currentLabel = relEle.data().atoms[i];
                naryLabel += currentLabel;
                naryLabel += ',';
            }
            relLabel = `${relLabel} [${naryLabel.substring(0, naryLabel.length - 1)}]`;
        }
        return relLabel;
    };

    const getEdgeColor = (rel) => {
        for (let i = 0; i < edgeColors.length; i++) {
            if (edgeColors[i].relation === rel) {
                return edgeColors[i].color;
            }
        }
        const defaultColor = '#0074D9';
        setEdgeColors([...edgeColors, { relation: rel, color: defaultColor }]);
        return defaultColor;
    };

    const updateEdgeColor = (rel, newVal) => {
        const updatedEdgeColors = edgeColors.map((item) =>
            item.relation === rel ? { ...item, color: newVal } : item
        );
        setEdgeColors(updatedEdgeColors);
    };

    const getEdgeStyle = (rel) => {
        for (let i = 0; i < edgeStyles.length; i++) {
            if (edgeStyles[i].relation === rel) {
                return edgeStyles[i].edgeStyle;
            }
        }
        const defaultEdgeStyle = 'solid';
        setEdgeStyles([...edgeStyles, { relation: rel, edgeStyle: defaultEdgeStyle }]);
        return defaultEdgeStyle;
    };

    const updateEdgeStyle = (rel, newVal) => {
        const updatedEdgeStyles = edgeStyles.map((item) =>
            item.relation === rel ? { ...item, edgeStyle: newVal } : item
        );
        setEdgeStyles(updatedEdgeStyles);
    };

    const isShowAsArcsOn = (rel) => {
        for (let i = 0; i < showAsArcs.length; i++) {
            if (showAsArcs[i].relation === rel) {
                return showAsArcs[i].showAsArcs;
            }
        }
        setShowAsArcs([...showAsArcs, { relation: rel, showAsArcs: true }]);
        return true;
    };

    const updateShowAsArcs = (rel, newVal) => {
        const updatedShowAsArcs = showAsArcs.map((item) =>
            item.relation === rel ? { ...item, showAsArcs: newVal } : item
        );
        setShowAsArcs(updatedShowAsArcs);
    };

    const isShowAsAttributesOn = (rel) => {
        for (let i = 0; i < showAsAttributes.length; i++) {
            if (showAsAttributes[i].relation === rel) {
                return showAsAttributes[i].showAsAttributes;
            }
        }
        setShowAsAttributes([...showAsAttributes, { relation: rel, showAsAttributes: false }]);
        return false;
    };

    const updateShowAsAttributes = (rel, newVal) => {
        const updatedShowAsAttributes = showAsAttributes.map((item) =>
            item.relation === rel ? { ...item, showAsAttributes: newVal } : item
        );
        setShowAsAttributes(updatedShowAsAttributes);
    };

    const getAttributeLabel = (instance, nodeEle) => {
        const aux = {};
        getEdges(instance).forEach((edge) => {
            if (edge.data.source === nodeEle.data().id && edge.data.relation && isShowAsAttributesOn(edge.data.relation)) {
                if (!aux[edge.data.relation]) aux[edge.data.relation] = [];
                aux[edge.data.relation].push(edge.data.atoms);
            }
        });

        let atts = '';
        for (const key in aux) {
            let temp = '';
            aux[key].forEach((tuple) => {
                tuple.slice(1).forEach((atom) => {
                    temp += atom + '\u2192';
                });
                temp = temp.substring(0, temp.length - 1) + ',';
            });
            atts += `${key}: ${temp.substring(0, temp.length - 1)}\n`;
        }

        return atts;
    };

    const getAllHiddenRels = () => {
        const res = [];
        for (let i = 0; i < showAsArcs.length; i++) {
            if (!showAsArcs[i].showAsArcs) {
                res.push(showAsArcs[i].relation);
            }
        }
        return res;
    };

    return {
        data,
        getEdgeStyle,
        getEdgeColor,
        getEdgeLabel,
        isShowAsAttributesOn,
        isShowAsArcsOn,
        getAttributeLabel,
        updateEdgeStyle,
        updateEdgeColor,
        updateShowAsAttributes,
        updateShowAsArcs,
        getAllHiddenRels
    };
};

export default useRelationSettings;
