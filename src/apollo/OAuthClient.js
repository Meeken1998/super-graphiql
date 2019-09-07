import { ApolloClient, createNetworkInterface } from 'apollo-client'
import AuthHeaderMiddleware from './AuthHeaderMiddleware'
import configs from './configs'

const networkInterface = createNetworkInterface({
  uri: configs.clients.oauth.uri,
  transportBatching: true
})

networkInterface.use([
  {
    applyMiddleware (req, next) {
      AuthHeaderMiddleware(req, next)
    }
  }
])

const OAuthClient = new ApolloClient({
  networkInterface,
  connectToDevTools: true
})

export default OAuthClient
