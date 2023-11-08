Meteor.methods({
    /**
      * Meteor method to validate an Alloy model. This will call the Alloy API
      * (webService).
      *
      * @param {String} code the Alloy code to validate
      *
      * @returns a JSON file with {success [, errorMessage, errorLocation]}
      */
    validate(code) {
        return new Promise((resolve, reject) => {
            HTTP.call('POST', `${Meteor.settings.env.API_URL}/validate`, {
                data: {
                    model: code
                }
            }, (error, result) => {
                if (error) reject(error)
                resolve(result.content)
            })
        })
    }
})
