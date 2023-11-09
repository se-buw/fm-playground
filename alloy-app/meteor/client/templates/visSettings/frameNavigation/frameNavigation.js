import {savePositions,
    project } from '../../../lib/visualizer/projection'

Template.frameNavigation.helpers({
    prevFrameEnabled() {
        Session.get('frame-updated')
        if (!$('.framePickerTarget')[0]) return 'disabled'
        const type = $('.framePickerTarget')[0].value
        return (currentFramePosition[type] == 0) ? 'disabled' : ''
    },

    nextFrameEnabled() {
        Session.get('frame-updated')
        if (currentlyProjectedSigs.length == 0) return 'disabled'
        const type = $('.framePickerTarget')[0].value
        return (currentFramePosition[type] == lastFrame(type)) ? 'disabled' : ''
    },

    showFrameNavigation() {
        Session.get('frame-updated')
        return currentlyProjectedSigs.length != 0 ? '' : 'hidden'
    },

    currentFrame() {
        Session.get('frame-updated')
        const position = []
        for (const key in currentFramePosition) position.push(key + currentFramePosition[key])
        return position.toString()
    }

})

Template.frameNavigation.events({
    'click #nextFrame'() {
        const type = $('.framePickerTarget')[0].value
        currentFramePosition[type]++
        savePositions()
        project()
        Session.set('frame-updated',!Session.get('frame-updated'))
    },
    'click #previousFrame'() {
        const type = $('.framePickerTarget')[0].value
        currentFramePosition[type]--
        savePositions()
        project()
        Session.set('frame-updated',!Session.get('frame-updated'))
    },
    'change .framePickerTarget'(event) {
        const selectedSig = event.target.value
        const currentAtom = currentFramePosition[selectedSig]
    }
})

// retrieves the last index of atoms of a given type, used for frame navigation
lastFrame = function (type) {
    return allNodes.nodes(`[type='${type}']`).length - 1
}
