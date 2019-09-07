<template>
  <div>
    <Drawer :closable="false" width="640" v-model="modalShow" @on-close="hideDrawer">
      <p class="firstTitle" :style="pStyle">
        <Tag color="primary">
          <span style="font-size: 14px;font-weight: bold;">Mutation</span>
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
      <!-- <p :style="pStyle">Personal</p>
      <div class="demo-drawer-profile">
        <Row>
          <Col span="12">Full Name: Aresn</Col>
        </Row>
      </div>-->
      <Divider />
      <p v-if="fields.length > 0" :style="pStyle">子项（fields）</p>
      <div v-if="fields.length > 0" class="demo-drawer-profile">
        <Row>
          <Col v-for="(item, index) in fields" :key="index" span="12" class="setfontsize">
            <Tooltip
              :content="item.type.name
                ? item.type.name
                : item.type.kind"
            >
              <Tag
                :color="(item.type.name
              ? item.type.name
              : item.type.kind) == 'NON_NULL' ? 'default' : 'success'"
              >
                {{ item.type.name
                ? item.type.name
                : item.type.kind }}
              </Tag>
            </Tooltip>
            <span class="text">{{ item.name }}</span>
          </Col>
        </Row>
      </div>
      <p v-if="args.length > 0" :style="pStyle">参数（args）</p>
      <div v-if="args.length > 0" class="demo-drawer-profile">
        <Row>
          <Col v-for="(item, index) in args" :key="index" span="12" class="setfontsize">
            <Tooltip
              :content="item.type.name
                ? item.type.name
                : item.type.kind"
            >
              <Tag
                :color="(item.type.name
              ? item.type.name
              : item.type.kind) == 'NON_NULL' ? 'default' : 'success'"
              >
                {{ item.type.name
                ? item.type.name
                : item.type.kind }}
              </Tag>
            </Tooltip>
            <span class="text">{{ item.name }}</span>
          </Col>
        </Row>
      </div>
      <!-- <Divider />
      <p :style="pStyle">Contacts</p>
      <div class="demo-drawer-profile">
        <Row>
          <Col span="12">Email: admin@aresn.com</Col>
          <Col span="12">Phone Number: +86 18888888888</Col>
        </Row>
        <Row>
          <Col span="12">
            GitHub:
            
          </Col>
        </Row>
      </div>-->
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
    ...mapGetters("apollo", ["drawerShow", "apiInfo"])
  },
  watch: {
    drawerShow() {
      this.dealWithApiInfo();
      this.modalShow = this.drawerShow;
    }
  },
  methods: {
    ...mapActions("apollo", ["changeDrawerShow"]),
    hideDrawer() {
      this.changeDrawerShow({ show: false });
      this.modalShow = false;
      this.args = [];
      this.fields = [];
    },
    dealWithApiInfo() {
      let api = this.apiInfo;
      if (
        typeof api.args == "object" &&
        api.args.length &&
        api.args.length > 0
      ) {
        this.args = api.args;
      }
      if (
        typeof api.fields == "object" &&
        api.fields.length &&
        api.fields.length > 0
      ) {
        this.fields = api.fields;
      }
    }
  }
};
</script>
<style>
.ivu-drawer-body {
  box-sizing: border-box;
  padding: 33px !important;
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
}

span.text {
  margin-left: 8px;
}
</style>