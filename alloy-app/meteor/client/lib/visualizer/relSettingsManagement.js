relationSettings = (function relationSettings() {
    let edgeColors = []
    let edgeStyles = []
    let showAsArcs = []
    let showAsAttributes = []

    /**
     * Initialize relation settings structures.
     */
    function init(settings) {
        edgeColors = (settings && settings.edgeColors) || []
        edgeStyles = (settings && settings.edgeStyles) || []
        showAsArcs = (settings && settings.showAsArcs) || []
        showAsAttributes = (settings && settings.showAsAttributes) || []
    }

    /**
     * Export relation settings structures as object.
     */
    function data() {
        const data = {
            edgeColors,
            edgeStyles,
            showAsAttributes,
            showAsAttributes,
            showAsArcs }
        return data
    }

    /**
     * Retrieves the edge label property of a relation, initializing to the
     * relation label if undefined.
     *
     * @param {String} rel the relation for which to get the property
     * @returns {String} the value assigned to the property
     *
     * TODO: doc outdated
     */
    function getEdgeLabel(relEle) {
        let relLabel = relEle.data().relation

        if (relEle.data().atoms.length > 2) {
            let naryLabel = ''
            for (let i = 1; i < relEle.data().atoms.length-1; i++) {
                // get the id the atom 
                const currentLabel = relEle.data().atoms[i]
                naryLabel += currentLabel
                naryLabel += ','
            }
            relLabel = `${relLabel} [${naryLabel.substring(0, naryLabel.length - 1)}]`
        }
        return relLabel
    }

    /**
     * Retrieves the edge color property of a relation, initializing to a default
     * color if undefined.
     *
     * @param {String} rel the relation for which to get the property
     * @returns {String} the value assigned to the property
     */
    function getEdgeColor(rel) {
        for (let i = 0; i < edgeColors.length; i++) {
            if (edgeColors[i].relation === rel) {
                return edgeColors[i].color
            }
        }
        edgeColors.push({ relation: rel, color: '#0074D9' })
        return '#0074D9'
    }

    /**
     * Updates the edge color property of a relation. Assumes already initialized.
     *
     * @param {String} rel the relation for which to update the property
     * @param {String} newVal the new value for the property
     */
    function updateEdgeColor(rel, newVal) {
        for (let i = 0; i < edgeColors.length; i++) {
            if (edgeColors[i].relation === rel) {
                edgeColors[i].color = newVal
                return
            }
        }
    }

    /**
     * Retrieves the edge style property of a relation, initializing to solid if
     * undefined.
     *
     * @param {String} rel the relation for which to get the property
     * @returns {String} the value assigned to the property
     */
    function getEdgeStyle(rel) {
        for (let i = 0; i < edgeStyles.length; i++) {
            if (edgeStyles[i].relation === rel) {
                return edgeStyles[i].edgeStyle
            }
        }
        edgeStyles.push({ relation: rel, edgeStyle: 'solid' })
        return 'solid'
    }

    /**
     * Updates the edge style property of a relation. Assumes already initialized.
     *
     * @param {String} rel the relation for which to update the property
     * @param {String} newVal the new value for the property
     */
    function updateEdgeStyle(rel, newVal) {
        for (let i = 0; i < edgeStyles.length; i++) {
            if (edgeStyles[i].relation === rel) {
                edgeStyles[i].edgeStyle = newVal
                return
            }
        }
    }

    /**
     * Retrieves the show as arcs property of a relation, initializing to
     * true if undefined.
     *
     * @param {String} rel the relation for which to get the property
     * @returns {String} the value assigned to the property
     */
    function isShowAsArcsOn(rel) {
        for (let i = 0; i < showAsArcs.length; i++) {
            if (showAsArcs[i].relation === rel) {
                return showAsArcs[i].showAsArcs
            }
        }
        showAsArcs.push({ relation: rel, showAsArcs: true })
        return true
    }

    /**
     * Updates the show as arcs property of a relation. Assumes already initialized.
     *
     * @param {String} rel the relation for which to update the property
     * @param {String} newVal the new value for the property
     */
    function updateShowAsArcs(rel, newVal) {
        for (let i = 0; i < showAsArcs.length; i++) {
            if (showAsArcs[i].relation === rel) {
                showAsArcs[i].showAsArcs = newVal
                return
            }
        }
    }

    /**
     * Retrieves the show as attributes property of a relation, initializing to
     * false if undefined.
     *
     * @param {String} rel the relation for which to get the property
     * @returns {String} the value assigned to the property
     */
    function isShowAsAttributesOn(rel) {
        for (let i = 0; i < showAsAttributes.length; i++) {
            if (showAsAttributes[i].relation === rel) {
                return showAsAttributes[i].showAsAttributes
            }
        }
        showAsAttributes.push({ relation: rel, showAsAttributes: false })
        return false
    }

    /**
     * Updates the show as attributes property of a relation. Assumes already
     * initialized.
     *
     * @param {String} rel the relation for which to update the property
     * @param {String} newVal the new value for the property
     */
    function updateShowAsAttributes(rel, newVal) {
        for (let i = 0; i < showAsAttributes.length; i++) {
            if (showAsAttributes[i].relation === rel) {
                showAsAttributes[i].showAsAttributes = newVal
                return
            }
        }
    }

    /**
     * Calculates the label that shows relations as attributes for a given node.
     *
     * @param {Object} nodeEle the cytoscape node element
     */
    function getAttributeLabel(instance,nodeEle) {

        const aux = {}
        // retrieve all outgoing edges
            getEdges(instance).forEach(edge => {
            // if show as attribute, add tuple to map for later processing
            if (edge.data.source === nodeEle.data().id)
            if (edge.data.relation && isShowAsAttributesOn(edge.data.relation)) {
                if (!aux[edge.data.relation]) aux[edge.data.relation] = []
                aux[edge.data.relation].push(edge.data.atoms)
            }
        })

        // construct the actual label
        let atts = ''

        for (const key in aux) {
            let temp = ''
            aux[key].forEach(tuple => {
                tuple.slice(1).forEach(atom => {
                    temp += atom + '\u2192'
                })
                temp = temp.substring(0,temp.length-1) + ','
            })
            atts += `${key}: ${temp.substring(0,temp.length-1)}\n`
        }

        return atts
    
    }

    function getAllHiddenRels() {
        const res = []
        for (let i = 0; i < showAsArcs.length; i++) {
            if (!showAsArcs[i].showAsArcs) {
                res.push(showAsArcs[i].relation)
            }
        }
        return res
    }


    return {
        init,
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
    }
}())
