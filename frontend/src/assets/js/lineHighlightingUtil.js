
function getLineToHighlightLimboole (result) {
    let lineToHighlight = -1;
    let lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        // if line i contians 'error' and '<stdin>' then it is the line to highlight
        if (lines[i].includes('error') && lines[i].includes('<stdin>')) {
            // split the line by ':' and get the second part
            let parts = lines[i].split(':');
            // get the line number from the second part
            lineToHighlight = parseInt(parts[1]);
            break;
        }
    }
    return lineToHighlight;
}


function getLineToHighlightSmt2(result) {
    let lineToHighlight = -1;
    let lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('error')) {
            // split the line by 'line ' and get the second part
            let parts = lines[i].split('line ');
            // get the line number from the second part
            if (parts.length > 1) {
                lineToHighlight = parseInt(parts[1]);
            }
            break; 
        }
    }
    return lineToHighlight;
}


function getLineToHighlightXmv (result) {
    let lineToHighlight = -1;
    let lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('error')) {
            // split the line by 'line ' and get the second part
            let parts = lines[i].split('line ');
            // get the line number from the second part
            if (parts.length > 1) {
                lineToHighlight = parseInt(parts[1]);
            }
            break; 
        }
    }
    return lineToHighlight;
}

// TODO: Implement getLineToHighlightSpectra after fixing the Spectra cli tool
function getLineToHighlightSpectra (result) {
    let lineToHighlight = -1;
    let lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('error')) {
            lineToHighlight = i;
            break;
        }
    }
    return lineToHighlight;
}


/**
 * Get the line number to highlight in the code editor.
 * @param {*} result - output of the tool execution.
 * @param {*} toolId - language id i.e., 'limboole', 'smt2', 'xmv', 'spectra'
 * @returns 
 */
export function getLineToHighlight(result, toolId) {
    if (toolId === 'limboole') {
        return getLineToHighlightLimboole(result);
    } else if (toolId === 'smt2') {
        return getLineToHighlightSmt2(result);
    } else if (toolId === 'xmv') {
        return getLineToHighlightXmv(result);
    } else if (toolId === 'spectra') {
        return getLineToHighlightSpectra(result);
    }
}