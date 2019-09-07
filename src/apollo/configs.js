import baseConfig from '../authing_config/config'

export default {
  clients: {
    pay: {
      uri: baseConfig.baseUrls.pay.uri + '/graphql'
    },

    users: {
      uri: baseConfig.baseUrls.users.uri + '/graphql'
    },

    emails: {
      uri: baseConfig.baseUrls.emails.uri + '/graphql'
    },

    oauth: {
      uri: baseConfig.baseUrls.oauth.uri + '/graphql'
    }
  }
}
