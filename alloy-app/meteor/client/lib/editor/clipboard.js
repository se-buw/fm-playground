/**
 * Module with functions that handle clipboard operations.
 *
 * @module client/lib/editor/clipboard
 */

/**
 * Copy the data in the "data-clipboard-text" attribute into the user's
 * clipboard, when a button with that element as target is clicked.
 *
 * @param {DOMElement} element the clicked element
 */
export function copyToClipboard(element) {
    let el = $(element.target)
    el = el.is('button') ? el : el.parent('button')
    const text = el.attr('data-clipboard-text')

    const $temp = $('<input>')
    $('body').append($temp)
    $temp.val(text).select()
    document.execCommand('copy')
    $temp.remove()
}
