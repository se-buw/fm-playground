import { Model } from '../../lib/collections/model'

/**
 * This is used to retrieve data when the Route contains a link /:_id
 */
editor = RouteController.extend({
    template: 'alloyEditor',

    // see http://iron-meteor.github.io/iron-router/#subscriptions
    subscriptions() {
        this.subscribe('modelFromLink', this.params.query.p).wait()
    },

    // see http://iron-meteor.github.io/iron-router/#the-waiton-option
    waitOn() {},

    data() {
        var checkParam = this.params.query.check;
        
        if (checkParam == "ALS"){
            var p = this.params.query.p
            if (p) {
              console.log(Model.findOne(p))
                return Model.findOne(p) 
            }
            // this.render(); 
        }
        else {
            alert("Not found")
        }
    },

    onRun() {
        this.next()
    },
    onRerun() {
        this.next()
    },
    onBeforeAction() {
        this.next()
    },
    action() {
        this.render()
    },
    onAfterAction() {},
    onStop() {}
})
