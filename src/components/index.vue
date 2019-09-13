<template>
  <div class="apollo-page">
    <draver />
    <div class="titleBar">
      <Menu
        style="width: 100%;"
        mode="horizontal"
        theme="dark"
        active-name="1"
        @on-select="menuOnSelect"
      >
        <MenuItem name="1">
          <Icon type="ios-game-controller-b" />Super GQLi
        </MenuItem>
        <MenuItem name="2">
          <Icon type="ios-construct" />服务配置
        </MenuItem>
        <MenuItem name="3">
          <Icon type="ios-play" />调试运行
        </MenuItem>
      </Menu>
    </div>
    <Row align="top" justify="start">
      <i-col :xs="12" :sm="12" :md="6" :lg="6" class="leftBar">
        <AutoComplete
          icon="ios-search"
          @on-select="selectSearchItem"
          v-model="searchValue"
          :data="searchResult"
          @on-search="findInDic"
          placeholder="查询方法和 Schema，生成查询语句"
          style="width: 100%;"
          clearable
        ></AutoComplete>
        <Tree :data="treeData" empty-text="文档加载中..."></Tree>
      </i-col>
      <i-col :xs="12" :sm="12" :md="18" :lg="18">
        <Row align="top" justify="start">
          <i-col span="12">
            <div class="fullTitle">
              <span>Query / Mutation</span>
              <Icon type="ios-trash" style="cursor: pointer" size="16" @click="emptyCode" />
            </div>
            <MonacoEditor
              class="editor"
              theme="vs"
              v-model="code"
              :options="monacoOptions"
              language="graphql"
              :style="fullHeight > 0 ? 'margin-top: 2px;height:' + (fullHeight - 62 - 60) / 2 + 'px;' : ''"
            />
            <div class="fullTitle">
              <div class="checkBox">
                <span
                  class="a"
                  :style="check == 0 ? '' : 'color: #a6abb2;'"
                  @click="changeCheck(0)"
                >Variables</span>
                <span style="margin: 0 6px;"></span>
                <span
                  class="a"
                  :style="check == 1 ? '' : 'color: #a6abb2;'"
                  @click="changeCheck(1)"
                >Headers</span>
              </div>
              <Icon
                v-if="check == 0"
                type="ios-trash"
                style="cursor: pointer"
                size="16"
                @click="emptyVariables"
              />
              <Icon
                v-if="check == 1"
                type="md-checkbox-outline"
                style="cursor: pointer"
                size="16"
                @click="settingOK"
              />
            </div>
            <MonacoEditor
              v-if="check == 0"
              class="editor"
              theme="vs"
              :options="monacoOptions"
              v-model="variables"
              language="json"
              :style="fullHeight > 0 ? 'margin-top: 2px;height:' + (fullHeight - 62 - 60) / 2 + 'px;' : ''"
            />
            <Input
              v-model="headers"
              type="textarea"
              :style="fullHeight > 0 ? 'margin-top: 2px;max-height:' + (fullHeight - 62 - 60) / 2 + 'px;' : ''"
              :placeholder="`请以key:value的形式输入，多个请换行，如：\nauthorization:yourtoken\ntimeout:1`"
              :autosize="{minRows: 6}"
            ></Input>
            <!-- :style="fullHeight > 0 ? 'height:' + (fullHeight - 54) + 'px;' : ''" -->
          </i-col>
          <i-col span="12">
            <div class="fullTitle">
              <span>Result</span>
              <Icon type="ios-trash" style="cursor: pointer" size="16" @click="emptyResult" />
            </div>
            <MonacoEditor
              class="editor"
              theme="vs"
              :options="monacoOptions"
              v-model="result"
              language="json"
              :style="fullHeight > 0 ? 'margin-top: 2px;height:' + (fullHeight - 62 - 30) + 'px;' : ''"
            />
          </i-col>
        </Row>
      </i-col>
    </Row>
    <Modal v-model="settingShow" title="服务配置" @on-ok="settingOK" @on-cancel="settingCancel">
      <Form :model="settings" :label-width="110">
        <FormItem label="选择 GraphQL 源">
          <Select v-model="settings.url">
            <Option v-for="(item, index) in urlList" :key="index" :value="item">{{ item }}</Option>
          </Select>
          <p>关于用户管理的 API 都在此 GraphQL 源内</p>
        </FormItem>
        <FormItem label="配置请求头（header）">
          <Input
            v-model="headers"
            type="textarea"
            :autosize="{minRows: 2,maxRows: 20}"
            :placeholder="`请以key:value的形式输入，多个请换行，如：\nauthorization:yourtoken\ntimeout:1`"
          ></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import MonacoEditor from "vue-monaco";
import graphqlQuery from "@/apollo/query";
import graphqlMutation from "@/apollo/mutation";
import gql from "graphql-tag";
import draver from "./draver";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "ApolloPage",
  components: { draver, MonacoEditor },
  data() {
    return {
      check: 0,
      settingShow: false,
      settings: {
        url: "https://users.authing.cn/graphql"
      },
      headers: "",
      gqlUrl: "https://users.authing.cn/graphql",
      urlList: ["https://users.authing.cn/graphql"],
      code: "",
      variables: "",
      result: "",
      dropdownShow: false,
      editValue: "",
      res: {},
      treeData: [],
      draverShow: false,
      dic: {},
      searchValue: "",
      searchResult: [],
      fullHeight: document.documentElement.clientHeight,
      monacoOptions: {
        wordWrap: "on",
        autoIndent: true,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true
      }
    };
  },
  computed: {
    ...mapGetters("apollo", ["drawerShow"])
  },
  watch: {
    searchValue() {
      if (this.searchValue == "") {
        this.dropdownShow = false;
        this.searchResult = [];
      } else {
        this.findInDic();
      }
    },
    fullHeight(val) {
      if (!this.timer) {
        this.fullHeight = val;
        this.timer = true;
        let that = this;
        setTimeout(function() {
          that.timer = false;
        }, 400);
      }
    }
  },
  mounted() {
    this.getList();
    this.getHeader();
    const that = this;
    window.onresize = () => {
      return (() => {
        window.fullHeight = document.documentElement.clientHeight;
        that.fullHeight = window.fullHeight;
      })();
    };
  },
  methods: {
    ...mapActions("apollo", [
      "changeDrawerShow",
      "setApiInfo",
      "setDic",
      "setHistoryList"
    ]),
    getHeader() {
      let header = JSON.parse(localStorage.getItem("headers")) || "";
      let tmp = "";
      if (header !== "" && typeof header == "object") {
        for (let key in header) {
          tmp = tmp + key + ":" + header[key] + "\n";
        }
        this.headers = tmp;
      } else {
        this.headers = "";
      }
    },
    async getList() {
      localStorage.setItem(
        "token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoiNzgwNzE4MzZAcXEuY29tIiwiaWQiOiI1YWU1ZTNhOTZmYzk0YzAwMDE1NjljOWIiLCJjbGllbnRJZCI6IjU5Zjg2YjQ4MzJlYjI4MDcxYmRkOTIxNCJ9LCJpYXQiOjE1Njc3NjM3NTksImV4cCI6MTU2OTA1OTc1OX0.T38xIo0KOzj_fec7JbTWA2JitBNAm-I9SsGuHn5hq7g"
      );
      let that = this;
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
      });
      if (res.data && res.data.__schema && res.data.__schema.types) {
        that.res = res.data.__schema.types;
        this.startDeal();
      }
    },

    changeCheck(idd) {
      this.check = idd;
    },

    startDeal() {
      // 将数据转化为树状组件能显示的
      let oldObject = this.res;
      let newObject = [];
      let name2title = (obj_, type__) => {
        let tmp = obj_;
        if (tmp["name"] && typeof tmp["name"] === "string") {
          tmp["title"] = tmp["name"];
          let type_ = null;
          if (tmp["title"] == "Query" || tmp["title"] == "Mutation") {
            type_ = tmp["title"];
          } else {
            type_ = "Schema";
          }
          if (type__) {
            type_ = type__;
          }
          tmp["type_"] = type_;
          if (
            tmp["fields"] &&
            typeof tmp["fields"] === "object" &&
            tmp["fields"].length > 0
          ) {
            tmp["expend"] = true;
            tmp = fields2children(tmp, type_);
          } else if (
            tmp["args"] &&
            typeof tmp["args"] === "object" &&
            tmp["args"].length > 0
          ) {
            tmp["expend"] = true;
            tmp = args2children(tmp, type_);
          } else if (
            tmp["inputFields"] &&
            typeof tmp["inputFields"] === "object" &&
            tmp["inputFields"].length > 0
          ) {
            tmp["expend"] = true;
            tmp = input_fields2children(tmp, type_);
          } else {
            tmp["render"] = (h, { root, node, data }) => {
              let that = this;
              return h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    width: "100%"
                  }
                },
                [
                  h(
                    "span",
                    {
                      on: {
                        click(e) {
                          that.showAPIInfo(data);
                        }
                      }
                    },
                    [
                      h(
                        "span",
                        {
                          style: {
                            padding: "3px 6px",
                            backgroundColor:
                              (typeof data.type === "object"
                                ? data.type.kind
                                : data.kind) == "NON_NULL"
                                ? "#979696"
                                : "#02ab63",
                            fontWeight: "bold",
                            color: "#fff",
                            borderRadius: "3px",
                            marginRight: "8px",
                            fontSize: "9px"
                          }
                        },
                        (typeof data.type === "object"
                          ? data.type.name
                            ? data.type.name
                            : data.type.kind
                          : data.kind
                        ).replace("NON_NULL", "必填")
                      ),
                      h("span", data.title)
                    ]
                  )
                ]
              );
            };
          }
        }
        return tmp;
      };
      let input_fields2children = (obj_, type_) => {
        let tmp = obj_;
        if (tmp["inputFields"]) {
          let children = tmp["inputFields"];
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]["_type"] = type_;
            }
            children[idx] = name2title(children[idx], type_ || null);
          }
          tmp["children"] = children;
          tmp["render"] = (h, { root, node, data }) => {
            let that = this;
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  cursor: "pointer"
                },
                on: {
                  click() {
                    that.showAPIInfo(data);
                  }
                }
              },
              [
                h("span", [
                  h("Icon", {
                    props: {
                      type:
                        data.title == "Query" || data.title == "Mutation"
                          ? "ios-paper-plane-outline"
                          : "ios-git-branch"
                    },
                    style: {
                      marginRight: "8px"
                    }
                  }),
                  h("span", data.title)
                ])
              ]
            );
          };
        }
        return tmp;
      };
      let fields2children = (obj_, type_) => {
        let tmp = obj_;
        if (tmp["fields"]) {
          let children = tmp["fields"];
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]["_type"] = type_;
            }
            children[idx] = name2title(children[idx], type_ || null);
          }
          tmp["children"] = children;
          tmp["render"] = (h, { root, node, data }) => {
            let that = this;
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  cursor: "pointer"
                },
                on: {
                  click() {
                    that.showAPIInfo(data);
                  }
                }
              },
              [
                h("span", [
                  h("Icon", {
                    props: {
                      type:
                        data.title == "Query" || data.title == "Mutation"
                          ? "ios-paper-plane-outline"
                          : "ios-git-branch"
                    },
                    style: {
                      marginRight: "8px"
                    }
                  }),
                  h("span", data.title)
                ])
              ]
            );
          };
        }
        return tmp;
      };
      let args2children = (obj_, type_) => {
        let tmp = obj_;
        if (tmp["args"]) {
          let children = tmp["args"];
          for (let idx = 0; idx < children.length; idx++) {
            if (type_) {
              children[idx]["_type"] = type_;
            }
            children[idx] = name2title(children[idx], type_ || null);
          }
          tmp["children"] = children;
          tmp["render"] = (h, { root, node, data }) => {
            let that = this;
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  cursor: "pointer"
                },
                on: {
                  click() {
                    that.showAPIInfo(data);
                  }
                }
              },
              [
                h("span", [
                  h("Icon", {
                    props: {
                      type: "ios-list-box-outline"
                    },
                    style: {
                      marginRight: "8px"
                    }
                  }),
                  h("span", data.title)
                ])
              ]
            );
          };
        }
        return tmp;
      };
      for (let keys in oldObject) {
        let insert = name2title(oldObject[keys]);
        if (insert["name"] == "Query" || insert["name"] == "Mutation") {
          newObject.unshift(insert);
          try {
            for (let i = 0; i < insert["fields"].length; i++) {
              this.dic[insert["fields"][i]["name"]] = insert["fields"][i];
            }
          } finally {
          }
        } else if (
          insert["kind"] !== "SCALAR" &&
          insert["kind"] !== "ENUM" &&
          insert["name"].indexOf("__") == -1
        ) {
          newObject.push(insert);
          this.dic[insert["name"]] = insert;
        }
      }
      let o1 = newObject[0];
      let o2 = newObject[1];
      let o3 = {};
      let o4 = [];
      newObject[0] = o2;
      newObject[1] = o1;
      if (newObject.length > 2) {
        o4 = newObject.slice(2);
        o3 = {
          kind: "OBJECT",
          name: "Schemas",
          description: "",
          fields: o4,
          inputFields: null,
          interfaces: [],
          title: "Schemas",
          children: o4,
          type_: "Schema",
          type: "Schema",
          expend: true,
          render: (h, { root, node, data }) => {
            let that = this;
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  cursor: "pointer"
                },
                on: {
                  click() {
                    that.showAPIInfo(data);
                  }
                }
              },
              [
                h("span", [
                  h("Icon", {
                    props: {
                      type: "ios-paper-plane-outline"
                    },
                    style: {
                      marginRight: "8px"
                    }
                  }),
                  h("span", data.title)
                ])
              ]
            );
          }
        };
        let tmp = newObject.slice(0, 2);
        tmp.push(o3);
        this.treeData = tmp;
      } else {
        this.treeData = newObject;
      }
      this.setDic(this.dic);
      localStorage.setItem("dic", JSON.stringify(this.dic));
      localStorage.setItem("tmp", JSON.stringify(this.treeData));
    },

    showAPIInfo(info) {
      // alert(JSON.stringify(info));
      this.setApiInfo({ info: info });
      this.setHistoryList(info);
      this.changeDrawerShow({ show: true });
    },

    // selectChange(e) {
    //   alert(JSON.stringify(e));
    // },

    findInDic() {
      if (this.searchValue !== "") {
        this.dropdownShow = false;
        let val = this.searchValue;
        let dic = this.dic;
        let arr = [];
        for (let key in dic) {
          if (key.toLowerCase().indexOf(val.toLowerCase()) > -1) {
            arr.push(dic[key].name);
          }
        }
        // alert(JSON.stringify(arr));
        this.searchResult = arr;
        if (arr.length > 0) {
          this.dropdownShow = true;
        }
      }
    },

    selectSearchItem(e) {
      if (this.dic[e]) {
        this.searchValue = "";
        this.setApiInfo({ info: this.dic[e] });
        this.setHistoryList(this.dic[e]);
        this.changeDrawerShow({ show: true });
      }
    },

    async menuOnSelect(name) {
      if (name == 2) {
        this.openSettings();
      } else if ((name = 3)) {
        try {
          let json = JSON.stringify(this.variables);
          if (json) {
            await this.startRun();
          }
        } catch (err) {
          this.$Message.info(
            "请输入正确的 variables 字段，它可以是数组或者对象"
          );
        }
      }
    },

    openSettings() {
      this.settingShow = true;
    },

    settingOK() {
      let arr = this.headers.split("\n");
      let obj = {};
      if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          if (typeof arr[i] == "string" && arr[i].indexOf(":") > -1) {
            let sp = arr[i].split(":");
            obj[sp[0]] = sp[1];
          }
        }
      }
      localStorage.setItem("headers", JSON.stringify(obj));
      this.getHeader();
      this.$Message.success("配置成功");
    },

    settingCancel() {
      this.settingShow = false;
    },

    async startRun() {
      let res;

      try {
        if (this.code.toLowerCase().indexOf("mutation") > -1) {
          //alert(this.code);
          res = await graphqlMutation({
            mutation: gql`
              ${this.code}
            `,
            variables: JSON.parse(
              this.variables.length > 0 ? this.variables : "{}"
            )
            //variables: {}
          });
        } else {
          res = await graphqlQuery({
            query: gql`
              ${this.code}
            `,
            variables: JSON.parse(
              this.variables.length > 0 ? this.variables : "{}"
            )
            // variables: {
            //   token:
            //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoiNzgwNzE4MzZAcXEuY29tIiwiaWQiOiI1YWU1ZTNhOTZmYzk0YzAwMDE1NjljOWIiLCJjbGllbnRJZCI6IjU5Zjg2YjQ4MzJlYjI4MDcxYmRkOTIxNCJ9LCJpYXQiOjE1Njc3NjM3NTksImV4cCI6MTU2OTA1OTc1OX0.T38xIo0KOzj_fec7JbTWA2JitBNAm-I9SsGuHn5hq7g"
            // }
          });
        }
        this.result = JSON.stringify(res, null, 4);
      } catch (err) {
        console.log(err);
        this.result = JSON.stringify(err, null, 4);
      }
    },

    emptyResult() {
      this.result = "";
    },
    emptyVariables() {
      this.variables = "";
    },
    emptyCode() {
      this.code = "";
    }
  }
};
</script>

<style>
.apollo-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fafafa;
}

.editor {
  width: calc(100% - 10px);
  overflow-x: hidden;
  margin: 0 5px;
}

.leftBar {
  padding: 11px;
  border-right: 1px solid #f3f3f3;
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  overflow-y: scroll;
  overflow-x: hidden;
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

.titleBar {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.middleBar {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: hidden;
}

.checkBox {
  display: flex;
  flex-direction: row;
}

.fullTitle {
  padding: 0 5px;
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

span.a {
  cursor: pointer;
}
</style>
