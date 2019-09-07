import getClient from './getClient'

import libs from '../libs/util'

/* 统一错误处理 */
const query = async (option, clientName, ret) => {
  let result
  let client = getClient(clientName)
  try {
    result = await client.query(option)
    result = libs.clone(result)
  } catch (e) {
    console.error(e)
    let graphQLErrors = e.graphQLErrors
    if (graphQLErrors && graphQLErrors.length) {
      if (ret) {
        throw graphQLErrors
      }
      if (option.$graphqlError) {
        option.$graphqlError(graphQLErrors)
      } else {
        graphQLErrors.forEach(item => {
          console.error(item.message.message)
        })
      }
    }
    if (e.networkError) {
      console.error('网络错误')
    }
  }
  return result
}

export default query
