import { displayError } from '../editor/feedback'
import { getCurrentState } from '../editor/state'

// the list of types currently projected
currentlyProjectedSigs = []
// for each of the types, the selected frame
currentFramePosition = {}
// all cy nodes available in the unprojected instance
allNodes = []
// stores the positions of the nodes between frames
nodePositions = {}

// will call the projection API for the current projections/frames
export function project() {
    Meteor.call('getProjection', Session.get('last_id'), currentFramePosition, Session.get('currentInstance'), processProjection)
}

// processes a frame for projected instance from API response
function processProjection(err, projection) {
    if (err) return displayError(err)
    updateGraph(projection[0],false)
    applyPositions()
}

// projects a new signature, updates elements accordingly
export function addSigToProjection(newType) {
    if (allNodes.length === 0) allNodes = cy.nodes()
    const atoms = lastFrame(newType)
    if (currentlyProjectedSigs.indexOf(newType) == -1) {
        currentlyProjectedSigs.push(newType)
        currentlyProjectedSigs.sort()
        $('.frame-navigation > select').append($('<option></option>')
            .attr('value', newType)
            .text(newType))
        if (atoms >= 0) { currentFramePosition[newType] = 0 }
    } else throw `${newType} already being projected.`
    $('.framePickerTarget').val(newType)
    project()
    Session.set('frame-updated',!Session.get('frame-updated'))
}

// removes a projected signature, updates elements accordingly
export function removeSigFromProjection(type) {
    const index = currentlyProjectedSigs.indexOf(type)
    if (index == -1) throw `${type} not found in types being projected.`
    else {
        currentlyProjectedSigs.splice(index, 1)
        delete currentFramePosition[type]
        $(`.frame-navigation > select option[value = '${type}']`).remove()
    }
    if (currentlyProjectedSigs.length == 0) {
        const instance = getCurrentState()
        if (instance) updateGraph(instance)
    } else {
        project()
    }
    Session.set('frame-updated',!Session.get('frame-updated'))
}

// applies the current projected information to a new instance, same projected
// signatures but resets frame selection; elements updated accordingly
export function newInstanceSetup() {
    currentFramePosition = {}
    if (currentlyProjectedSigs.length != 0) {
        for (const key in currentlyProjectedSigs) { currentFramePosition[currentlyProjectedSigs[key]] = 0 }
        allNodes = cy.nodes()
        project()
        const atoms = lastFrame($('.framePickerTarget')[0].value)
        $('.frame-navigation > select').prop('disabled', false)
    }
}

// updates the frame navigator according to a static instance (i.e.,
// everything disabled)
export function staticProjection() {
    $('.frame-navigation > select').append($('<option></option>')
        .attr('value', currentlyProjectedSigs[0])
        .text(currentlyProjectedSigs[0]))
    $('.frame-navigation > select').prop('disabled', true)
}

// saves current node positions
export function savePositions() {
    const atoms = cy.nodes()
    atoms.forEach((atom) => {
        nodePositions[atom.data().id] = jQuery.extend(true, {}, atom.position())
    })
}

// applies saved node positions
export function applyPositions() {
    for (const id in nodePositions) {
        const node = cy.nodes(`[id='${id}']`)
        if (node.length > 0) {
            node[0].position(nodePositions[id])
        }
    }
}

// resets saved node positions
export function resetPositions() {
    nodePositions = {}
}

