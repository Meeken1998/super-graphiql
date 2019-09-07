import Vue from 'vue'
import VueApollo from 'vue-apollo'
import apolloClient from './client'
import OAuthClient from './OAuthClient'
import EmailClient from './EmailClient'
import PayClient from './PayClient'

Vue.use(VueApollo)

// This can hold multiple apollo clients
const apolloProvider = new VueApollo({
  clients: {
    apolloClient,
    OAuthClient,
    EmailClient,
    PayClient
  },
  defaultClient: apolloClient,
  errorHandler (error) {
    console.log('global error', error)
  }
})

export default apolloProvider
