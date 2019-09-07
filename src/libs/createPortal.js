/**
 * 很多 modal 每次显示都需要初始化数据
 * 可以用这个工具函数，每次都会新建一个实例
 * 避免每次都要手动初始化数据
 * 默认跟随使用此命令的组件上下文一起销毁
 * modal 必须定义 show 方法
 */
import Vue from 'vue'

export default function createPortal(options) {
  const {
    context,
    component,
    config = { autoDestroy: true },
    children,
    event,
    ...attributes
  } = options
  const container = document.createElement('div')

  if (context) {
    if (!context._isVue) {
      throw new TypeError('context is not a Vue instance')
    }
    context.$el.appendChild(container)
  }

  let instance = new Vue({
    el: container,
    name: 'PortalContainer',
    parent: context,
    components: {
      PortalComponent: component,
    },
    data() {
      return {
        payload: attributes,
      }
    },
    mounted() {
      this.$refs.component.show()
    },
    methods: {
      update(payload) {
        Object.keys(payload).forEach(key => {
          this.$set(this.payload, key, payload[key])
        })
      },
      updateProps(payload) {
        Object.keys(payload).forEach(key => {
          this.payload.props[key] = payload[key]
        })
      },
    },
    render(h) {
      return (
        <PortalComponent {...attributes} ref="component">
          {children}
        </PortalComponent>
      )
    },
  })

  if (config.autoDestroy && context) {
    context.$on('hook:beforeDestroy', () => {
      instance.$destroy()
      instance = null
    })
  }

  return instance
}
