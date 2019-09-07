import defaultClient from './client'
import EmailClient from './EmailClient'
import OAuthClient from './OAuthClient'
import PayClient from './PayClient'

export default function(client) {
  if (!client) {
    return defaultClient
  }

  let clientSelector = {
    client() {
      return defaultClient
    },

    defaultClient() {
      return defaultClient
    },

    EmailClient() {
      return EmailClient
    },

    OAuthClient() {
      return OAuthClient
    },

    PayClient() {
      return PayClient
    },
  }

  if (clientSelector[client]) {
    return clientSelector[client]()
  }
}
