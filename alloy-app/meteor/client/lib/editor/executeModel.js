/**
 * Module that handles model execution and navigation.
 *
 * @module client/lib/editor/genUrl
 */

import { displayError,
    displayWarningMsg,
    displayInfoMsg,
    displayErrorMsg } from './feedback'
import { getCommandIndex,
    storeInstances,
    modelExecuted,
    getNextInstance,
    getPreviousInstance,
    instChanged,
    isUnsatInstance,
    getCommandLabel,
    resetState,
    currentState } from './state'
import { resetPositions,newInstanceSetup } from '../visualizer/projection'

/**
 * Execute the model through the selected command. Will call the Alloy API.
 */
export function executeModel() {
    const commandIndex = getCommandIndex()
    // no command to run
    if (commandIndex < 0) displayError('There are no commands to execute', '')

    // execute command
    else {
        modelExecuted()
        const model = textEditor.getValue()
        Meteor.call('getInstances', model, commandIndex, Session.get('from_private'), Session.get('last_id'), handleExecuteModel)
    }
}

/**
 * Show the next instance for the executed command or requests additional
 * instances if no more cached, unless already unsat. May call the Alloy API.
 */
export function nextInstance() {
    const instanceIndex = Session.get('currentInstance')
    const maxInstanceNumber = Session.get('maxInstance')
    // no more local instances but still not unsat
    if (instanceIndex == maxInstanceNumber - 1 && !isUnsatInstance(instanceIndex)) {
        const model = textEditor.getValue()
        Meteor.call('nextInstances', model, getCommandIndex(), Session.get('last_id'), handleExecuteModel)
    }
    const ni = getNextInstance()
    if (typeof ni !== 'undefined') {
        if (ni.unsat) {
            Session.set('currentInstance', instanceIndex)
            displayInfoMsg('No more satisfying instances!', '')
        } else {
            resetPositions()
            updateGraph(ni)
            newInstanceSetup()
            instChanged()
        }
    }
}

/**
 * Show the previous instance for the executed command, always cached if any.
 */
export function prevInstance() {
    const ni = getPreviousInstance()
    if (typeof ni !== 'undefined') {
        resetPositions()
        updateGraph(ni)
        newInstanceSetup()
        instChanged()
    }
}

/**
 * Handles the response of the Alloy API for the execution of a command,
 * either a fresh execution or a new batch of instances when iterating.
 *
 * @param {Error} err the possible meteor error
 * @param {Object} result the result to the getInstances or nextInstance
 *     meteor calls
 */
function handleExecuteModel(err, result) {
    if (err) {
        maxInstanceNumber = -1
        return displayError(err)
    }
    Session.set('last_id', result.newModelId) // update the last_id for next derivations

    if (result.instances)
        result = result.instances

    storeInstances(result)
    if (Array.isArray(result)) result = result[0]

    // if there error returned by Alloy
    if (result.alloy_error) {
        let resmsg = result.msg
        if (result.line) resmsg = `${resmsg} (${result.line}:${result.column})`
        resmsg += '\n'
        displayErrorMsg('There was a problem running the model!', `${resmsg}Please validate your model.`)
    }
    // else, show instance or unsat
    else {
        const command = getCommandLabel()

        if (result.warning_error) {
            let resmsg = result.msg
            if (result.line) resmsg = `${resmsg} (${result.line}:${result.column})`
            resmsg += '\n'
            displayWarningMsg('There is a possible problem with the model!', resmsg)
        }
        if (result.unsat) {
            Session.set('log-message', result.check ? `No counter-examples. ${command} may be valid.` : `No instance found. ${command} may be inconsistent.`)
            Session.set('log-class', result.check ? 'log-complete' : 'log-wrong')
        } else {
            Session.set('log-message', result.check ? `Counter-example found. ${command} is invalid.` : `Instance found. ${command} is consistent.`)
            Session.set('log-class', result.check ? 'log-wrong' : 'log-complete')
            initGraphViewer('instance')
            resetPositions()
            resetState()
            updateGraph(result.instance[currentState()])
            newInstanceSetup()
        }
    }
}
