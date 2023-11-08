import { Meteor } from 'meteor/meteor'
import { seedWithModels } from './seed'

import './methods/validate'
import './methods/genURL'
import './methods/getInstances'
import './methods/nextInstances'
import './methods/getProjection'
import './methods/shareInstance'
import './methods/getModel'
import './methods/downloadTree'

import './publications/modelFromLink'

/**
  If the database is empty, seeds a set of default models after startup.
*/
Meteor.startup(() => {
    if (!Model.find().count()) {
        // if there are no models, insert default ones
        const res = seedWithModels()
        console.log(`Seeded Database with ${res} models`)
    }
})
