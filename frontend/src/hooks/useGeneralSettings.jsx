import { useState, useEffect } from 'react';

const useGeneralSettings = (initialSettings = {}) => {
  const [currentLayout, setCurrentLayout] = useState(initialSettings.currentLayout || 'breadthfirst');
  const [metaPrimSigs, setMetaPrimSigs] = useState(initialSettings.metaPrimSigs || [{ type: 'univ', parent: null }]);
  const [metaSubsetSigs, setMetaSubsetSigs] = useState(initialSettings.metaSubsetSigs || []);

  useEffect(() => {
    if (initialSettings) {
      setCurrentLayout(initialSettings.currentLayout || 'breadthfirst');
      setMetaPrimSigs(initialSettings.metaPrimSigs || [{ type: 'univ', parent: null }]);
      setMetaSubsetSigs(initialSettings.metaSubsetSigs || []);
    }
  }, [initialSettings]);

  const data = () => ({
    currentLayout,
    metaPrimSigs,
    metaSubsetSigs
  });

  const addPrimSig = (tp, pr) => {
    setMetaPrimSigs([...metaPrimSigs, { type: tp, parent: pr }]);
  };

  const addSubSig = (tp, pr) => {
    setMetaSubsetSigs([...metaSubsetSigs, { type: tp, parent: pr }]);
  };

  const getLayout = () => currentLayout;

  const updateLayout = (value) => {
    setCurrentLayout(value);
  };

  const resetHierarchy = () => {
    setMetaPrimSigs([{ type: 'univ', parent: null }]);
    setMetaSubsetSigs([]);
  };

  const getSigParent = (sigType) => {
    for (const sig of metaPrimSigs) {
      if (sig.type === sigType) return sig.parent;
    }
    for (const sig of metaSubsetSigs) {
      if (sig.type === sigType) return sig.parent;
    }
    throw new Error('Sig not found');
  };

  const hasSubsetSig = (subsetSig) => {
    return metaSubsetSigs.some(sig => sig.type === subsetSig);
  };

  return {
    data,
    getLayout,
    updateLayout,
    getSigParent,
    resetHierarchy,
    hasSubsetSig,
    addPrimSig,
    addSubSig
  };
};

export default useGeneralSettings;
