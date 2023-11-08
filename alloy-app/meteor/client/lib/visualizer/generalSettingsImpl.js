nodeSpacing = 0.1
layouts = {
    breadthfirst: {
        name: 'breadthfirst',
        avoidOverlap: true,
        maximalAdjustments: 1,
        padding: 10,
        directed: true,
        spacingFactor: nodeSpacing
    },
    cocentric: {
        name: 'concentric',

        fit: true, // whether to fit the viewport to the graph
        padding: 10, // the padding on fit
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
        minNodeSpacing: nodeSpacing, // min spacing between outside of nodes (used for radius adjustment)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        height: undefined, // height of layout area (overrides container height)
        width: undefined, // width of layout area (overrides container width)
        concentric(node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
            return node.degree()
        },
        levelWidth(nodes) { // the variation of concentric values in each level
            return nodes.maxDegree() / 4
        },
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
    },
    random: {
        name: 'random',

        fit: true, // whether to fit to viewport
        padding: 10, // fit padding
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
    },
    circle: {
        name: 'circle',

        fit: true, // whether to fit the viewport to the graph
        padding: 30, // the padding on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
        radius: undefined, // the radius of the circle
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
    },
    grid: {
        name: 'grid',
        fit: true, // whether to fit the viewport to the graph
        padding: 10, // padding used on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
        condense: false, // uses all available space on false, uses minimal space on true
        rows: undefined, // force num of rows in the grid
        cols: undefined, // force num of columns in the grid
        position(node) {}, // returns { row, col } for element
        sort(a, b) {
            return a.data('label') < b.data('label')
        }, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
    },
    cose: {
        name: 'cose',
        // Called on `layoutready`
        ready() {},
        // Called on `layoutstop`
        stop() {},
        // Whether to animate while running the layout
        animate: true,
        // The layout animates only after this many milliseconds
        // (prevents flashing on fast runs)
        animationThreshold: 250,
        // Number of iterations between consecutive screen positions update
        // (0 -> only updated on the end)
        refresh: 20,
        // Whether to fit the network view after when done
        fit: true,
        // Padding on fit
        padding: 30,
        // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        boundingBox: undefined,
        // Extra spacing between components in non-compound graphs
        componentSpacing: 100,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion(node) { return 400000 },
        // Node repulsion (overlapping) multiplier
        nodeOverlap: 10,
        // Ideal edge (non nested) length
        idealEdgeLength(edge) { return 10 },
        // Divisor to compute edge forces
        edgeElasticity(edge) { return 100 },
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 5,
        // Gravity force (constant)
        gravity: 80,
        // Maximum number of iterations to perform
        numIter: 1000,
        // Initial temperature (maximum node displacement)
        initialTemp: 200,
        // Cooling factor (how the temperature is reduced between consecutive iterations
        coolingFactor: 0.95,
        // Lower temperature threshold (below this point the layout will end)
        minTemp: 1.0,
        // Whether to use threading to speed up the layout
        useMultitasking: true
    }

}

