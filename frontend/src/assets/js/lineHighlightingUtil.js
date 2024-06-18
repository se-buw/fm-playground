
function getLineToHighlightLimboole(result) {
  return result.split('\n')
    .filter(line => line.includes('error') && line.includes('<stdin>'))
    .map(line => parseInt(line.split(':')[1]))
    .filter(line => !isNaN(line));
}


function getLineToHighlightSmt2(result) {
  return result.split('\n')
      .filter(line => line.includes('error') && line.includes('line '))
      .map(line => parseInt(line.split('line ')[1]))
      .filter(line => !isNaN(line));
}

function getLineToHighlightXmv(result) {
  return result.split('\n')
      .filter(line => line.includes('error') && line.includes('line '))
      .map(line => parseInt(line.split('line ')[1]))
      .filter(line => !isNaN(line));
}

function getLinesToHighlightSpectra(result) {
  const regex = /<\s*([\d\s]+)\s*>/;
  const match = result.match(regex);
  if (match) {
    return match[1].split(/\s+/).filter(Boolean).map(Number);
  }
  return [];
}

function getLinesToHighlightAlloy(result) {
  const regex = /line (\d+)/;
  const match = result.match(regex);
  if (match) {
    return [parseInt(match[1])];
  }
  return [];
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
    return getLinesToHighlightSpectra(result);
  }else if (toolId === 'alloy') {
    return getLinesToHighlightAlloy(result);
  }
}