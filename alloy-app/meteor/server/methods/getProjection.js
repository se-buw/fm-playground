Meteor.methods({

    /**
      * Meteor method to get the projection of an Alloy instance. This will
      * call the Alloy API (webService).
      *
      * @param uuid id of the session
      * @param frameInfo object with information about the frame
      *
      * @return JSON object with the projection
      */
    getProjection(uuid, frameInfo, idx) {
        const type = []
        for (const key in frameInfo) {
            type.push(key + frameInfo[key])
        }
        return new Promise((resolve, reject) => {
            HTTP.call('POST', `${Meteor.settings.env.API_URL}/getProjection`, {
                data: {
                    sessionId: uuid,
                    type,
                    index: idx
                }
            }, (error, result) => {
                if (error) reject(error)
                const content = JSON.parse(result.content)
                if (content.unsat) {
                    content.check = true
                } else {
                    Object.keys(content).forEach((k) => {
                        content[k].check = true
                    })
                }
                resolve(content)
            })
        })
    }
})
