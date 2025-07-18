<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{ title }}</h3>
      <div class="login-type-switch">
        <el-radio-group v-model="loginType" size="large">
          <el-radio-button label="admin">管理员登录</el-radio-button>
          <el-radio-button label="merchant">商家登录</el-radio-button>
        </el-radio-group>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2025 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user';
import SHA256 from 'crypto-js/sha256';
import { queryShopList } from '@/api/mall/shop'

const loginType = ref('admin');
const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "123456",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(false);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 记住密码仅用localStorage
      if (loginForm.value.rememberMe) {
        localStorage.setItem("username", loginForm.value.username);
        localStorage.setItem("password", encrypt(loginForm.value.password));
        localStorage.setItem("rememberMe", loginForm.value.rememberMe);
        localStorage.setItem("loginType", loginType.value);
      } else {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("loginType");
      }
      // 密码加密处理
      const loginData = {
        ...loginForm.value,
        password: SHA256(loginForm.value.password.trim()).toString(),
        loginType: loginType.value
      };
      userStore.login(loginData).then(async () => {
        // 仅 merchant 端登录后自动获取 shopId
        if (loginType.value === 'merchant') {
          try {
            const res = await queryShopList({});
            if (res.data && res.data.records && res.data.records.length > 0) {
              localStorage.setItem('shopId', res.data.records[0].id)
            }
          } catch (e) {}
        } else {
          localStorage.removeItem('shopId')
        }
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.data.enabled;
    if (captchaEnabled.value) {
      codeUrl.value = res.data.image;
      loginForm.value.uuid = res.data.key;
    }
  });
}

function getCookie() {
  // 记住密码仅用localStorage
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  const rememberMe = localStorage.getItem("rememberMe");
  const savedLoginType = localStorage.getItem("loginType");
  loginForm.value = {
    username: username === null ? loginForm.value.username : username,
    password: password === null ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === null ? false : rememberMe === 'true'
  };
  if (savedLoginType) {
    loginType.value = savedLoginType;
  }
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-type-switch {
  text-align: center;
  margin-bottom: 20px;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
