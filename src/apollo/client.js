import { ApolloClient, createNetworkInterface } from 'apollo-client'
import AuthHeaderMiddleware from './AuthHeaderMiddleware'
import configs from './configs'

const networkInterface = createNetworkInterface({
  uri: configs.clients.users.uri,
  transportBatching: true
})

networkInterface.use([
  {
    applyMiddleware (req, next) {
      AuthHeaderMiddleware(req, next)
    }
  }
])

const apolloClient = new ApolloClient({
  networkInterface,
  connectToDevTools: true
})

export default apolloClient
