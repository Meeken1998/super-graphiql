import { ApolloClient, createNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'
const networkInterfaceTask = createNetworkInterface({
  uri: '/api/tasks/graphql',
  transportBatching: true,
  opts: {
    credentials: 'include'
  }
})

const apolloClientTask = new ApolloClient({
  networkInterface: networkInterfaceTask,
  connectToDevTools: true
})

const apolloProvider = new VueApollo({
  clients: {
    task: apolloClientTask
  },
  defaultClient: apolloClientTask
})

export default {apolloProvider}
