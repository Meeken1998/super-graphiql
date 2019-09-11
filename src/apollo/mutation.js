//import vm from '../main'
import getClient from './getClient'

import libs from '../libs/util'

/*统一错误处理*/
const mutation = async (option, clientName) => {
  let result
  let client = getClient(clientName)
  try {
    result = await client.mutate(option, clientName)
  } catch (e) {
    // if(e !== '用户不存在') {
    //     console.error(e);
    // }

    let graphQLErrors = e.graphQLErrors
    if (graphQLErrors && graphQLErrors.length) {
      throw graphQLErrors
      if (option.$graphqlError) {
        option.$graphqlError(graphQLErrors)
      } else {
        graphQLErrors.forEach(item => {
          if (item.message !== '用户不存在') {
            console.error({
              content: item.message.message,
              duration: 3,
            })
          }
        })
      }
    }
    if (e.networkError) {
      console.error('请求失败，网络错误')
    }
  }
  return libs.clone(result)
}

export default mutation
