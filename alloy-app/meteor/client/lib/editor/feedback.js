/**
 * Module with feedback functions.
 *
 * @module client/lib/editor/feedback
 */

/**
 * Display meteor error to the user and report in the console.
 *
 * @param {Error} err the meteor error
 * @returns {Error} the meteor error
 */
export function displayError(err) {
    console.error(err)
    swal({
        type: 'error',
        title: err.error,
        text: err.reason
    })
    return err
}

/**
 * Display error message to the user and report in the console.
 *
 * @param {String} title the title of the message
 * @param {String} text the actual message
 */
export function displayErrorMsg(title, text) {
    console.error(`${title}\n${text}`)
    swal({
        type: 'error',
        title,
        text
    })
}

/**
 * Display warning message to the user and report in the console.
 *
 * @param {String} title the title of the message
 * @param {String} text the actual message
 */
export function displayWarningMsg(title, text) {
    console.error(`${title}\n${text}`)
    swal({
        type: 'warning',
        title,
        text
    })
}

/**
 * Display information message to the user.
 *
 * @param {String} title the title of the message
 * @param {String} text the actual message
 */
export function displayInfoMsg(title, text) {
    swal({
        type: 'info',
        title,
        text
    })
}
