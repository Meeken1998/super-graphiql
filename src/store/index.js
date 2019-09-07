import Vue from 'vue'
import Vuex from 'vuex'

import apollo from './apollo'
Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        apollo
    }
})