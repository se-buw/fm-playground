import { useState } from 'react';

const useSigSettings = (initialSettings) => {
    const [nodeColors, setNodeColors] = useState(initialSettings?.nodeColors || [{ type: 'univ', color: '#2ECC40' }]);
    const [nodeShapes, setNodeShapes] = useState(initialSettings?.nodeShapes || [{ type: 'univ', shape: 'ellipse' }]);
    const [nodeBorders, setNodeBorders] = useState(initialSettings?.nodeBorders || [{ type: 'univ', border: 'solid' }]);
    const [nodeVisibility, setNodeVisibility] = useState(initialSettings?.nodeVisibility || [{ type: 'univ', visibility: false }, { type: 'Int', visibility: true }, { type: 'seq/Int', visibility: true }]);

    const data = {
        nodeColors,
        nodeShapes,
        nodeBorders,
        nodeVisibility
    };

    const getAtomColor = (sig) => {
        for (let i = 0; i < nodeColors.length; i++) {
            if (nodeColors[i].type === sig) {
                return nodeColors[i].color;
            }
        }
        const defaultColor = 'inherit';
        setNodeColors([...nodeColors, { type: sig, color: defaultColor }]);
        return defaultColor;
    };

    const getInheritedAtomColor = (sig) => {
        let cur = sig;
        let color = getAtomColor(cur);
        while (color === 'inherit') {
            const parent = generalSettings.getSigParent(cur);
            color = getAtomColor(parent);
            cur = parent;
        }
        return color;
    };

    const updateAtomColor = (sig, newVal) => {
        const updatedNodeColors = nodeColors.map((item) =>
            item.type === sig ? { ...item, color: newVal } : item
        );
        setNodeColors(updatedNodeColors);
    };

    const getAtomShape = (sig) => {
        for (let i = 0; i < nodeShapes.length; i++) {
            if (nodeShapes[i].type === sig) {
                return nodeShapes[i].shape;
            }
        }
        const defaultShape = 'inherit';
        setNodeShapes([...nodeShapes, { type: sig, shape: defaultShape }]);
        return defaultShape;
    };

    const getInheritedAtomShape = (sig) => {
        let cur = sig;
        let shape = getAtomShape(cur);
        while (shape === 'inherit') {
            const parent = generalSettings.getSigParent(cur);
            shape = getAtomShape(parent);
            cur = parent;
        }
        return shape;
    };

    const updateAtomShape = (sig, newVal) => {
        const updatedNodeShapes = nodeShapes.map((item) =>
            item.type === sig ? { ...item, shape: newVal } : item
        );
        setNodeShapes(updatedNodeShapes);
    };

    const getAtomBorder = (sig) => {
        for (let i = 0; i < nodeBorders.length; i++) {
            if (nodeBorders[i].type === sig) {
                return nodeBorders[i].border;
            }
        }
        const defaultBorder = 'inherit';
        setNodeBorders([...nodeBorders, { type: sig, border: defaultBorder }]);
        return defaultBorder;
    };

    const getInheritedAtomBorder = (sig) => {
        let cur = sig;
        let border = getAtomBorder(cur);
        while (border === 'inherit') {
            const parent = generalSettings.getSigParent(cur);
            border = getAtomBorder(parent);
            cur = parent;
        }
        return border;
    };

    const updateAtomBorder = (sig, newVal) => {
        const updatedNodeBorders = nodeBorders.map((item) =>
            item.type === sig ? { ...item, border: newVal } : item
        );
        setNodeBorders(updatedNodeBorders);
    };

    const getAtomVisibility = (sig) => {
        for (let i = 0; i < nodeVisibility.length; i++) {
            if (nodeVisibility[i].type === sig) {
                return nodeVisibility[i].visibility;
            }
        }
        const defaultVisibility = false;
        setNodeVisibility([...nodeVisibility, { type: sig, visibility: defaultVisibility }]);
        return defaultVisibility;
    };

    const getInheritedAtomVisibility = (sig) => {
        let cur = sig;
        let visibility = getAtomVisibility(cur);
        while (visibility === 'inherit') {
            const parent = generalSettings.getSigParent(cur);
            visibility = getAtomVisibility(parent);
            cur = parent;
        }
        return visibility;
    };

    const updateAtomVisibility = (sig, newVal) => {
        const updatedNodeVisibility = nodeVisibility.map((item) =>
            item.type === sig ? { ...item, visibility: newVal } : item
        );
        setNodeVisibility(updatedNodeVisibility);
    };

    const getAllHiddenAtoms = () => {
        const res = [];
        for (let i = 0; i < nodeVisibility.length; i++) {
            if (nodeVisibility[i].visibility) {
                res.push(nodeVisibility[i].type);
            }
        }
        return res;
    };

    return {
        data,
        getAtomVisibility,
        getAtomBorder,
        getAtomShape,
        getAtomColor,
        getInheritedAtomVisibility,
        getInheritedAtomBorder,
        getInheritedAtomShape,
        getInheritedAtomColor,
        updateAtomVisibility,
        updateAtomBorder,
        updateAtomShape,
        updateAtomColor,
        getAllHiddenAtoms
    };
};

export default useSigSettings;
