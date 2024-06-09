import React, { useEffect } from 'react';
import useGeneralSettings from './useGeneralSettings';

const GeneralSettingsComponent = () => {
  const {
    data,
    getLayout,
    updateLayout,
    getSigParent,
    resetHierarchy,
    hasSubsetSig,
    addPrimSig,
    addSubSig
  } = useGeneralSettings({
    currentLayout: 'breadthfirst',
    metaPrimSigs: [{ type: 'univ', parent: null }],
    metaSubsetSigs: []
  });

  useEffect(() => {
    // Example usage
    addPrimSig('newPrimSig', 'parentSig');
    addSubSig('newSubSig', 'parentSig');
    console.log('Current Layout:', getLayout());
    console.log('Has Subset Sig:', hasSubsetSig('newSubSig'));
    console.log('Sig Parent:', getSigParent('newPrimSig'));
  }, [addPrimSig, addSubSig, getLayout, getSigParent, hasSubsetSig]);

  return (
    <div>
      <button onClick={() => updateLayout('newLayout')}>Update Layout</button>
      <button onClick={() => resetHierarchy()}>Reset Hierarchy</button>
      <pre>{JSON.stringify(data(), null, 2)}</pre>
    </div>
  );
};

export default GeneralSettingsComponent;
