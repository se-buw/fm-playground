/**
 * Module that handles model and instance sharing.
 *
 * @module client/lib/editor/genUrl
 */

import { displayError } from './feedback'
import { modelShared,
    getCommandIndex,
    instShared,
    currentState,
    getCurrentTrace } from './state'
import { savePositions } from '../visualizer/projection'


/**
 * Store and share the current model and generate the sharing URLs.
 */
export function shareModel(cmd_i, permalink) {
    const themeData = {
        sigSettings: sigSettings.data(),
        relationSettings: relationSettings.data(),
        generalSettings: generalSettings.data(),
        currentFramePosition,
        currentlyProjectedSigs,
        nodePositions
    }

    const modelToShare = textEditor.getValue()
    Meteor.call('genURL', modelToShare, Session.get('last_id'), themeData, cmd_i, permalink, handleShareModel)
}

/**
 * Store and share the current instance and generate the sharing URL. The
 * respective model is already stored due to the execution.
 */
export function shareInstance() {
    savePositions()
    const themeData = {
        sigSettings: sigSettings.data(),
        relationSettings: relationSettings.data(),
        generalSettings: generalSettings.data(),
        currentState: currentState(),
        currentFramePosition,
        currentlyProjectedSigs,
        nodePositions
    }
    Meteor.call('storeInstance', Session.get('last_id'), getCommandIndex(), getCurrentTrace(), themeData, handleShareInstance)
}

/**
 * Handles the response to the model sharing request.
 *
 * @param {Error} err the possible meteor error
 * @param {Object} result the result to the genURL meteor call
 */
function handleShareModel(err, result) {
    if (err) return displayError(err)

    Session.set('public-model-url', `${result.public}`)
    Session.set('private-model-url', `${result.private}`)
    console.log(result)
    window.history.pushState({}, null, "/?check=ALS&p=" + result.public);

    modelShared()
}

/**
 * Handles the response to the instance sharing request.
 *
 * @param {Error} err the possible meteor error
 * @param {Object} result the result to the storeInstance meteor call
 */
function handleShareInstance(err, result) {
    if (err) return displayError(err)

    Session.set('inst-url', `${result}`)

    instShared()
}
