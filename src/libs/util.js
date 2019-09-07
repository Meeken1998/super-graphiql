import JSEncrypt from 'jsencrypt'
import config from '../authing_config/config'
import pingpp from 'pingpp-js'
let util = {}
util.title = function (title) {
  title = title
    ? title + ' - Authing 领先的身份认证云 | 云端身份认证服务 - Authing.cn'
    : 'Authing 领先的身份认证云 | 云端身份认证服务 - Authing.cn'
  window.document.title = title
}

util.checkEmail = email => {
  const reg = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
  const isok = reg.test(email)
  return isok
}

util.checkPhone = phone => {
  const reg = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/
  const isok = reg.test(phone)
  return isok
}

util.clone = obj => {
  let ret, k, b
  if ((b = obj instanceof Array) || obj instanceof Object) {
    ret = b ? [] : {}
    for (k in obj) {
      if (k !== '__typename') {
        if (obj[k] instanceof Array || obj[k] instanceof Object) {
          ret[k] = util.clone(obj[k])
        } else {
          ret[k] = obj[k]
        }
      }
    }
  }
  return ret
}

util.encryption = paw => {
  const encrypt = new JSEncrypt() // 实例化加密对象
  encrypt.setPublicKey(config.openSSLSecret) // 设置公钥
  const encryptoPasswd = encrypt.encrypt(paw) // 加密明文
  return encryptoPasswd
}

util.aliPay = (charge, vm) => {
  pingpp.createPayment(charge, function (result) {
    if (result == 'success') {
      // 只有微信公众账号 (wx_pub)、QQ 公众号 (qpay_pub)、支付宝口碑 (alipay_qr)
      // 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
    } else if (result == 'fail') {
      // charge 不正确或者微信公众账号/QQ 公众号/支付宝口碑支付失败时会在此处返回
    } else if (result == 'cancel') {
      // 微信公众账号、QQ 公众号、支付宝口碑支付取消支付
    }
    vm.$Spin.hide()
  })
}

util.getStringLen = str => {
  /* eslint-disable no-control-regex */
  return str.replace(/[^\x00-\xff]/g, '01').length
}

util.escapeHtml = value => {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/[&<>`"'/]/g, function (result) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '`': '&#x60;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2f;'
    }[result]
  })
}

util.escapeScript = value => {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/<script.*?>.*?<\/script>/gi, '')
  // return value.replace(/<script><\/script>/g, function(result) {
  //     return {
  //         '<script>': '&lt;script&gt;',
  //         '</script>': '&lt;script&#x2f;&gt;'
  //     }[result];
  // });
}

util.isUrl = value => {
  // eslint-disable-next-line
  return /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/gi.test(
    value
  )
}

/**
 * 深度比较 b 中的属性是否都等于 a 的属性, 若是数组要完全相等才会返回 true
 * const a = {
 *  id: 1,
 *  name: 'fuck',
 *  mappings: {
 *    subname: 'ha',
 *    nickname: 'en',
 *  },
 * }
 * const b = {
 *   id: 1,
 *   mappings: {
 *   subname: 'ha',
 *  },
 * }
 *
 * objPartEqual(a, b) 返回 true
 */
util.objPartEqual = (a, b) => {
  if (typeof a !== typeof b) {
    return false
  }
  return Object.keys(b).every(attr => {
    const val = b[attr]

    if (Array.isArray(val)) {
      return (
        val.length === a[attr] &&
        a[attr].length &&
        val.every((aryItem, index) => {
          return util.objPartEqual(a[attr][(index, aryItem)])
        })
      )
    }

    if (typeof val === 'object' && val !== null) {
      return util.objPartEqual(a[attr], b[attr])
    }

    return val === a[attr]
  })
}

util.validateXml = function validateXML (xmlContent) {
  // errorCode 0是xml正确，1是xml错误，2是无法验证
  let xmlDoc
  // code for IE
  if (window.ActiveXObject) {
    // eslint-disable-next-line
    xmlDoc = new ActiveXObject('Microsoft.XMLDOM')
    xmlDoc.async = 'false'
    xmlDoc.loadXML(xmlContent)
    return xmlDoc.parseError.errorCode === 0
  }
  // code for Mozilla, Firefox, Opera, chrome, safari,etc.
  else if (document.implementation.createDocument) {
    var parser = new DOMParser()
    xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
    var error = xmlDoc.getElementsByTagName('parsererror')
    return error.length === 0
  }
}

export default util
