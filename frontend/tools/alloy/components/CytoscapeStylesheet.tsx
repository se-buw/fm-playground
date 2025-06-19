const generateColor = (relationship: string) => {
    // Generate a color based on the relationship name
    const hashCode = (s: string) => {
        return s.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
    };
    // Generate a color based on the hash code of the relationship name
    const color = Math.abs(hashCode(relationship));
    const r = (color & 0xff0000) >> 16;
    const g = (color & 0x00ff00) >> 8;
    const b = color & 0x0000ff;
    return `rgb(${r}, ${g}, ${b})`;
};

const getCssVariable = (variable: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const CytoscapeStylesheet = (uniqueRelationships: string[]) => {
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
                'text-wrap': 'wrap',
                'text-max-width': '80px',
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
                label: 'data(label)',
                color: primaryTextColor,
                'text-rotation': 'autorotate',
                'font-size': 18,
                'text-margin-x': -15,
            },
        },
    ];

    uniqueRelationships.forEach((relationship) => {
        const color = generateColor(relationship);
        styles.push({
            selector: `edge[relationship="${relationship}"]`,
            style: {
                width: 5,
                'line-color': color,
                'target-arrow-color': color,
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                label: 'data(label)',
                color: primaryTextColor,
                'text-rotation': 'autorotate',
                'font-size': 18,
                'text-margin-x': -15,
            },
        });
    });

    return styles;
};

export default CytoscapeStylesheet;
