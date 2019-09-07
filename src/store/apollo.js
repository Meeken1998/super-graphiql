const state = {
    drawerShow: false,
    apiInfo: {}
}

const getters = {
    drawerShow: () => state.drawerShow,
    apiInfo: () => state.apiInfo
}

const mutations = {
    changeDrawerShow(state, { show }) {
        state.drawerShow = show
    },
    setApiInfo(state, { info }) {
        state.apiInfo = info
    }
}

const actions = {
    changeDrawerShow({ commit }, { show }) {
        commit("changeDrawerShow", { show });
    },
    setApiInfo({ commit }, { info }) {
        commit("setApiInfo", { info })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}