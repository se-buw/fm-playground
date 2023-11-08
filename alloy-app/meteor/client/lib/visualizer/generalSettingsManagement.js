generalSettings = (function generalSettings() {
    let currentLayout = 'breadthfirst'
    let metaPrimSigs = [{ type: 'univ', parent: null }]
    // stores the parent prim sig of each sub sig
    let metaSubsetSigs = []

    /**
     * Initialize general settings structures.
     */
    function init(settings) {
        currentLayout = (settings && settings.currentLayout) || 'breadthfirst'
        if (settings) {
            metaPrimSigs = settings.metaPrimSigs || [{ type: 'univ', parent: null }]
            metaSubsetSigs = settings.metaSubsetSigs || []
        }
    }

    /**
     * Export general settings structures as object.
     */
    function data() {
        const data = { 
            currentLayout,
            metaPrimSigs,
            metaSubsetSigs }
        return data
    }

    /**
     * Add a new prim sig to the settings with a given parent.
     *
     * @param tp {String} the new prim sig
     * @param pr {String} the parent sig
     */
    function addPrimSig(tp, pr) {
        metaPrimSigs.push({
            type: tp,
            parent: pr
        })
    }

    /**
     * Add a new sub sig to the settings with a given parent.
     *
     * @param tp {String} the new sub sig
     * @param pr {String} the parent sig
     */
    function addSubSig(tp, pr) {
        metaSubsetSigs.push({
            type: tp,
            parent: pr
        })
    }

    /**
     * Retrieves the current layout property, initialized as breadthfirst.
     *
     * @returns {String} the value assigned to the property
     */
    function getLayout() {
        return currentLayout
    }

    /**
     * Updates the current layout property.
     *
     * @param {String} newVal the new value for the property
     */
    function updateLayout(value) {
        currentLayout = value
    }

    /**
     * Resets the known hierarchy for a new instance.
     */
    function resetHierarchy() {
        metaPrimSigs = [{ type: 'univ', parent: null }]
        metaSubsetSigs = []
    }

    /**
     * Retrieves the parent of a prim or sub sig.
     *
     * @param {String} the sig for which to find the parent
     */
    function getSigParent(sigType) {
        for (const i in metaPrimSigs) {
            if (metaPrimSigs[i].type === sigType) return metaPrimSigs[i].parent
        }
        for (const i in metaSubsetSigs) {
            if (metaSubsetSigs[i].type === sigType) return metaSubsetSigs[i].parent
        }
        throw null
    }

    /**
     * Whether a sig has sub sigs.
     *
     * @param {String} the sig for which to children
     */
    function hasSubsetSig(subsetSig) {
        for (let i = 0; i < metaSubsetSigs.length; i++) {
            if (metaSubsetSigs[i].type === subsetSig) return true
        }
        return false
    }

    return {
        init,
        data,
        getLayout,
        updateLayout,
        getSigParent,
        resetHierarchy,
        hasSubsetSig,
        addPrimSig,
        addSubSig
    }
}())
