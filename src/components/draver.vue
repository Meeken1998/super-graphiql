<template>
  <div>
    <Drawer :closable="false" width="640" v-model="modalShow" @on-close="hideDrawer">
      <div class="topBox">
        <p class="firstTitle" :style="pStyle">
          <Tag color="primary">
            <span style="font-size: 14px;font-weight: bold;">{{ apiInfo.type_ || 'Mutation' }}</span>
          </Tag>
          {{ apiInfo.name }}
        </p>
        <p>
          {{ apiInfo.description && apiInfo.description.length > 0 ? apiInfo.description : '暂无描述，详情请见文档：' }}
          <a
            v-if="!(apiInfo.description && apiInfo.description.length > 0)"
            href="https://docs.authing.cn/authing/sdk/open-graphql"
            target="_blank"
          >docs.authing.cn/authing/sdk/open-graphql</a>
        </p>
        <Divider />
        <p v-if="(apiInfo.fields || apiInfo.inputFilds) && fields.length > 0" :style="pStyle">子项（fields）</p>
        <div v-if="(apiInfo.fields || apiInfo.inputFilds) && fields.length > 0" class="demo-drawer-profile">
          <Row>
            <Col v-for="(item, index) in fields" :key="index" span="12" class="setfontsize">
              <Tooltip
                placement="right"
                :content="getTootips((item.type.name
                ? item.type.name
                : item.type.kind).replace('NON_NULL', '必填'))"
              >
                <Tag
                  :color="getTagColor(item.type.name
              ? item.type.name
              : item.type.kind)"
                >
                  <span
                    @click="findInDic((item.type.name
                ? item.type.name
                : item.type.kind))"
                  >
                    {{ (item.type.name
                    ? item.type.name
                    : item.type.kind).replace('NON_NULL', '必填') }}
                  </span>
                </Tag>
              </Tooltip>
              <span class="text">{{ item.name }}</span>
            </Col>
          </Row>
        </div>
        <div v-if="(apiInfo.fields || apiInfo.inputFilds) && fields.length > 0" style="margin-top: 33px;width: 100%; height: 1px;"></div>
        <p v-if="apiInfo.args && args.length > 0" :style="pStyle">参数（args）</p>
        <div v-if="apiInfo.args && args.length > 0" class="demo-drawer-profile">
          <Row>
            <Col v-for="(item, index) in args" :key="index" span="12" class="setfontsize">
              <Tooltip
                placement="right"
                :content="getTootips((item.type.name
                ? item.type.name
                : item.type.kind).replace('NON_NULL', '必填'))"
              >
                <Tag
                  :color="getTagColor(item.type.name
              ? item.type.name
              : item.type.kind)"
                  @click="findInDic((item.type.name
                ? item.type.name
                : item.type.kind))"
                >
                  <span
                    @click="findInDic((item.type.name
                ? item.type.name
                : item.type.kind))"
                  >
                    {{ (item.type.name
                    ? item.type.name
                    : item.type.kind).replace('NON_NULL', '必填') }}
                  </span>
                </Tag>
              </Tooltip>
              <span class="text">{{ item.name }}</span>
            </Col>
          </Row>
        </div>
      </div>
      <div class="bottomBox">
        <div class="bottomItem" @click="lastPage">
          <Icon type="md-arrow-round-back" />
          <span class="txt">上一条：{{ nowHistory - 1 >= 0 ? historyList[nowHistory - 1].name : '无' }}</span>
        </div>
        <div v-if="historyList.length > 0 && (historyList.length - 1) > nowHistory" class="bottomItem" @click="nextPage">
          <span class="txt">下一条：{{ historyList[nowHistory + 1].name }}</span>
          <Icon type="md-arrow-round-forward" />
        </div>
      </div>
    </Drawer>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "draver",
  data() {
    return {
      args: [],
      fields: [],
      modalShow: false,
      pStyle: {
        fontSize: "16px",
        color: "rgba(0,0,0,0.85)",
        lineHeight: "24px",
        display: "block",
        marginBottom: "16px"
      },
      codevalue: "hello"
    };
  },
  computed: {
    ...mapGetters("apollo", [
      "drawerShow",
      "apiInfo",
      "dic",
      "nowHistory",
      "historyList"
    ])
  },
  watch: {
    drawerShow() {
      this.modalShow = this.drawerShow;
      this.dealWithApiInfo();
    },
    apiInfo() {
      this.dealWithApiInfo();
    }
  },
  methods: {
    ...mapActions("apollo", [
      "changeDrawerShow",
      "setApiInfo",
      "clearHistoryList",
      "setNowHistory",
      "addToHistoryList",
      "lastHistory",
      "nextHistory"
    ]),
    hideDrawer() {
      this.changeDrawerShow({ show: false });
      this.modalShow = false;
      this.args = [];
      this.fields = [];
      this.clearHistoryList()
    },
    dealWithApiInfo() {
      let api = this.apiInfo;
      try {
        if (
          api.args &&
          typeof api.args == "object" &&
          api.args.length &&
          api.args.length > 0
        ) {
          this.args = api.args;
        }
      } finally {
        try {
          if (
            api.fields &&
            typeof api.fields == "object" &&
            api.fields.length &&
            api.fields.length > 0
          ) {
            this.fields = api.fields;
          }
        } finally {
          try {
            if (
              api.inputFields &&
              typeof api.inputFields == "object" &&
              api.inputFields.length &&
              api.inputFields.length > 0
            ) {
              this.fields = api.inputFields;
            }
          } finally {
            console.log("ok");
          }
        }
      }
    },
    findInDic(key) {
      if (this.dic[key]) {
        this.setApiInfo({ info: this.dic[key] });
        this.addToHistoryList(this.dic[key])
      }
    },
    getTootips(item) {
      switch (item.toLowerCase()) {
        case "string":
          return "基本类型：字符串 (String) ";
          break;

        case "boolean":
          return "基本类型：布尔值 (Boolean) ";
          break;

        case "int":
          return "基本类型：整数型 (Boolean) ";
          break;

        case "float":
          return "基本类型：浮点型 (Float) ";
          break;

        case "list":
          return "基本类型：数组 (Array / list) ";
          break;

        case "必填":
          return "不可为空";
          break;

        default:
          return "自定义类型：" + item;
      }
    },

    getTagColor(item) {
      switch (item.toLowerCase()) {
        case "string":
          return "success";
          break;

        case "boolean":
          return "success";
          break;

        case "int":
          return "success";
          break;

        case "list":
          return "success";
          break;

        case "float":
          return "success";
          break;

        case "non_null":
          return "default";
          break;

        default:
          return "warning";
      }
      //return 'success'
    },

    nextPage() {
      this.nextHistory()
    },
    lastPage() {
      this.lastHistory()
    }
  }
};
</script>
<style>
.ivu-drawer-body {
  box-sizing: border-box;
  padding: 0 !important;
}

.firstTitle {
  font-size: 18px;
}

.setfontsize {
  font-size: 14px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 6px;
  cursor: pointer;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

span.text {
  margin-left: 8px;
}

.ivu-tooltip-popper {
  z-index: 999 !important;
}

.bottomBar {
  width: 100%;
  height: 33px;
}

.topBox {
  width: 100%;
  height: calc(100% - 61px);
  max-height: calc(100% - 61px);
  overflow-y: scroll;
  padding: 33px;
}

.bottomBox {
  width: 100%;
  border-top: 1px solid #f3f3f3;
  height: 60px;
  padding: 0 33px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 4px 0 8px 0 rgba(132, 164, 194, 0.1);
}

.bottomItem {
  height: 80%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.bottomItem:hover {
  color: #313131;
}

.bottomItem > span.txt {
  margin: 0 6px;
}
</style>