import { Model } from '../../lib/collections/model'
import { Link } from '../../lib/collections/link'
import {
  extractSecrets,
  containsValidSecret
} from '../../lib/editor/text'
Meteor.methods({
  /**
   * Meteor method to get persistent links to share an Alloy model. Only
   * generates private link if secrets are present. If the model contains
   * secrets, will become a new derivation root (although it still
   * registers the derivation).
  *
  * @param {String} code the Alloy model to be shared
  * @param {String} currentModelId the id of the current model
  * @param {Object} themeData the theme information for cytoscape
  *
  * @return The 'id' of the model link, used in Share Model option
  */
  genURL(code, currentModelId, themeData, cmd_i) {
    let permalink;
    let meta = "{cmd_i: " + cmd_i + "}"
    const synchronousCall = Meteor.wrapAsync(HTTP.call);
    try {
      const result = synchronousCall('POST', `http://localhost:8000/api/save-with-meta`, {
        data: {
          parent: null,
          check: "ALS",
          code: code,
          meta: meta
        }
      });
      console.log(result);
      permalink = result.data.permalink;
    }
    catch (e) {
      console.log(e);
    }
    // a new model is always created, regardless of having secrets or not
    const model = {
      time: new Date().toLocaleString(),
      code,
      derivationOf: currentModelId,
      theme: themeData
    }

    // insert new model
    const modelId = Model.insert(model)

    console.log(permalink);
    // generate the public link
    const publicLinkId = Link.insert({
      _id: permalink,
      model_id: modelId,
      private: false
    })

    // generate the private link if secrets are present
    let privateLinkId
    let original
    if (containsValidSecret(code) || !currentModelId) {
      original = modelId
      privateLinkId = Link.insert({
        model_id: modelId,
        private: true
      })
    } else {
      original = Model.findOne(currentModelId).original
    }

    Model.update({ _id: modelId }, { $set: { original } })

    return {
      public: publicLinkId,
      // will be undefined if no secret is present
      private: privateLinkId,
      last_id: modelId
    }
  }
})
