<template>
  <div class="apollo-page">
    <draver />
    <Row align="top" justify="start">
      <i-col :xs="12" :sm="12" :md="6" :lg="6" class="leftBar">
        <!-- <Dropdown trigger="custom" :visible="dropdownShow" style="width: 100%;max-height: 500px;">
          <Input
            v-model="searchValue"
            search
            enter-button
            placeholder="Enter something..."
            @on-search="findInDic"
          />
          <DropdownMenu slot="list">
            <DropdownItem v-for="(item, index) in searchResult" :key="index">{{ item.name }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>-->
        <AutoComplete
          @on-select="selectSearchItem"
          v-model="searchValue"
          :data="searchResult"
          @on-search="findInDic"
          placeholder="Enter something..."
          style="width: 100%;"
          clearable
        ></AutoComplete>
        <Tree :data="treeData" @on-select-change="selectChange"></Tree>
      </i-col>
      <i-col :xs="12" :sm="12" :md="12" :lg="12" style="height: 500px; width: 500px;">
        <MonacoEditor class="editor" v-model="code" language="javascript" />
      </i-col>
    </Row>
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco';
import graphqlQuery from '@/apollo/query';
import gql from 'graphql-tag';
import draver from './draver';
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'ApolloPage',
  components: { draver, MonacoEditor },
  data () {
    return {
      code: '',
      dropdownShow: false,
      editValue: '',
      res: {},
      treeData: [],
      draverShow: false,
      dic: {},
      searchValue: '',
      searchResult: []
    }
  },
  computed: {
    ...mapGetters('apollo', ['drawerShow'])
  },
  watch: {
    searchValue () {
      if (this.searchValue == '') {
        this.dropdownShow = false
        this.searchResult = []
      } else {
        this.findInDic()
      }
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    ...mapActions('apollo', [
      'changeDrawerShow',
      'setApiInfo',
      'setDic',
      'setHistoryList'
    ]),
    async getList () {
      localStorage.setItem(
        'token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoiNzgwNzE4MzZAcXEuY29tIiwiaWQiOiI1YWU1ZTNhOTZmYzk0YzAwMDE1NjljOWIiLCJjbGllbnRJZCI6IjU5Zjg2YjQ4MzJlYjI4MDcxYmRkOTIxNCJ9LCJpYXQiOjE1Njc3NjM3NTksImV4cCI6MTU2OTA1OTc1OX0.T38xIo0KOzj_fec7JbTWA2JitBNAm-I9SsGuHn5hq7g'
      )
      let that = this
      let res = await graphqlQuery({
        query: gql`
          query IntrospectionQuery {
            __schema {
              queryType {
                name
              }
              mutationType {
                name
              }
              subscriptionType {
                name
              }
              types {
                ...FullType
              }
              directives {
                name
                description
                locations
                args {
                  ...InputValue
                }
              }
            }
          }
          fragment FullType on __Type {
            kind
            name
            description
            fields(includeDeprecated: true) {
              name
              description
              args {
                ...InputValue
              }
              type {
                ...TypeRef
              }
              isDeprecated
              deprecationReason
            }
            inputFields {
              ...InputValue
            }
            interfaces {
              ...TypeRef
            }
            enumValues(includeDeprecated: true) {
              name
              description
              isDeprecated
              deprecationReason
            }
            possibleTypes {
              ...TypeRef
            }
          }
          fragment InputValue on __InputValue {
            name
            description
            type {
              ...TypeRef
            }
            defaultValue
          }
          fragment TypeRef on __Type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {}
      })
      if (res.data && res.data.__schema && res.data.__schema.types) {
        that.res = res.data.__schema.types
        this.startDeal()
      }
    },

    startDeal () {
      // 将数据转化为树状组件能显示的
      let oldObject = this.res
      let newObject = []
      let name2title = (obj_, type__) => {
        let tmp = obj_
        if (tmp['name'] && typeof tmp['name'] === 'string') {
          tmp['title'] = tmp['name']
          let type_ = null
          if (tmp['title'] == 'Query' || tmp['title'] == 'Mutation') {
            type_ = tmp['title']
          } else {
            type_ = 'Schema';
          }
          if (type__) {
            type_ = type__
          }
          tmp['type_'] = type_
          if (
            tmp['fields'] &&
            typeof tmp['fields'] === 'object' &&
            tmp['fields'].length > 0
          ) {
            tmp['expend'] = true
            tmp = fields2children(tmp, type_)
          } else if (
            tmp['args'] &&
            typeof tmp['args'] === 'object' &&
            tmp['args'].length > 0
          ) {
            tmp['expend'] = true
            tmp = args2children(tmp, type_)
          } else if (
            tmp['inputFields'] &&
            typeof tmp['inputFields'] === 'object' &&
            tmp['inputFields'].length > 0
          ) {
            tmp['expend'] = true
            tmp = input_fields2children(tmp, type_)
          } else {
            tmp['render'] = (h, { root, node, data }) => {
              let that = this
              return h(
                'span',
                {
                  style: {
                    display: 'inline-block',
                    width: '100%'
                  }
                },
                [
                  h(
                    'span',
                    {
                      on: {
                        click (e) {
                          that.showAPIInfo(data)
                        }
                      }
                    },
                    [
                      h(
                        'span',
                        {
                          style: {
                            padding: '3px 6px',
                            backgroundColor:
                              (typeof data.type === 'object'
                                ? data.type.kind
                                : data.kind) == 'NON_NULL'
                                ? '#979696'
                                : '#02ab63',
                            fontWeight: 'bold',
                            color: '#fff',
                            borderRadius: '3px',
                            marginRight: '8px',
                            fontSize: '9px'
                          }
                        },
                        (typeof data.type === 'object'
                          ? data.type.name
                            ? data.type.name
                            : data.type.kind
                          : data.kind
                        ).replace('NON_NULL', '必填')
                      ),
                      h('span', data.title)
                    ]
                  )
                ]
              )
            };
          }
        }
        return tmp
      };
      let input_fields2children = (obj_, type_) => {
        let tmp = obj_
        if (tmp['inputFields']) {
          let children = tmp['inputFields']
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]['_type'] = type_
            }
            children[idx] = name2title(children[idx], type_ || null)
          }
          tmp['children'] = children
          tmp['render'] = (h, { root, node, data }) => {
            let that = this
            return h(
              'span',
              {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  cursor: 'pointer'
                },
                on: {
                  click () {
                    that.showAPIInfo(data)
                  }
                }
              },
              [
                h('span', [
                  h('Icon', {
                    props: {
                      type:
                        data.title == 'Query' || data.title == 'Mutation'
                          ? 'ios-paper-plane-outline'
                          : 'ios-git-branch'
                    },
                    style: {
                      marginRight: '8px'
                    }
                  }),
                  h('span', data.title)
                ])
              ]
            )
          };
        }
        return tmp
      };
      let fields2children = (obj_, type_) => {
        let tmp = obj_
        if (tmp['fields']) {
          let children = tmp['fields']
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]['_type'] = type_
            }
            children[idx] = name2title(children[idx], type_ || null)
          }
          tmp['children'] = children
          tmp['render'] = (h, { root, node, data }) => {
            let that = this
            return h(
              'span',
              {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  cursor: 'pointer'
                },
                on: {
                  click () {
                    that.showAPIInfo(data)
                  }
                }
              },
              [
                h('span', [
                  h('Icon', {
                    props: {
                      type:
                        data.title == 'Query' || data.title == 'Mutation'
                          ? 'ios-paper-plane-outline'
                          : 'ios-git-branch'
                    },
                    style: {
                      marginRight: '8px'
                    }
                  }),
                  h('span', data.title)
                ])
              ]
            )
          };
        }
        return tmp
      };
      let args2children = (obj_, type_) => {
        let tmp = obj_
        if (tmp['args']) {
          let children = tmp['args']
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]['_type'] = type_
            }
            children[idx] = name2title(children[idx], type_ || null)
          }
          tmp['children'] = children
          tmp['render'] = (h, { root, node, data }) => {
            let that = this
            return h(
              'span',
              {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  cursor: 'pointer'
                },
                on: {
                  click () {
                    that.showAPIInfo(data)
                  }
                }
              },
              [
                h('span', [
                  h('Icon', {
                    props: {
                      type: 'ios-list-box-outline'
                    },
                    style: {
                      marginRight: '8px'
                    }
                  }),
                  h('span', data.title)
                ])
              ]
            )
          };
        }
        return tmp
      };
      for (let keys in oldObject) {
        let insert = name2title(oldObject[keys])
        if (insert['name'] == 'Query' || insert['name'] == 'Mutation') {
          newObject.unshift(insert)
          try {
            for (let i = 0; i < insert['fields'].length; i++) {
              this.dic[insert['fields'][i]['name']] = insert['fields'][i]
            }
          } finally {
          }
        } else if (
          insert['kind'] !== 'SCALAR' &&
          insert['kind'] !== 'ENUM' &&
          insert['name'].indexOf('__') == -1
        ) {
          newObject.push(insert)
          this.dic[insert['name']] = insert
        }
      }
      let o1 = newObject[0]
      let o2 = newObject[1]
      newObject[0] = o2
      newObject[1] = o1
      this.treeData = newObject
      this.setDic(this.dic)
      localStorage.setItem('dic', JSON.stringify(this.dic))
    },

    showAPIInfo (info) {
      // alert(JSON.stringify(info));
      this.setApiInfo({ info: info })
      this.setHistoryList(info)
      this.changeDrawerShow({ show: true })
    },

    selectChange (e) {
      alert(JSON.stringify(e))
    },

    findInDic () {
      if (this.searchValue !== '') {
        this.dropdownShow = false
        let val = this.searchValue
        let dic = this.dic
        let arr = []
        for (let key in dic) {
          if (key.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            arr.push(dic[key].name)
          }
        }
        // alert(JSON.stringify(arr));
        this.searchResult = arr
        if (arr.length > 0) {
          this.dropdownShow = true
        }
      }
    },

    selectSearchItem (e) {
      if (this.dic[e]) {
        this.searchValue = '';
        this.setApiInfo({ info: this.dic[e] })
        this.setHistoryList(this.dic[e])
        this.changeDrawerShow({ show: true })
      }
    }
  }
}
</script>

<style>
.editor {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.leftBar {
  padding: 11px;
  border-right: 1px solid #f3f3f3;
}

.leftBar span {
  transition: all 0.3s;
}

.leftBar span:hover {
  color: #57a3f3;
}

.leftBar span:active {
  color: #4487cf;
}

.ivu-select-dropdown {
  max-height: 600px !important;
  overflow-x: hidden;
  overflow-y: scroll;
}

.ivu-auto-complete.ivu-select-dropdown {
  max-height: 600px !important;
}
</style>
