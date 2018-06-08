
<template>
    <div class="layout-header">
        <img :src="logoImg"/>
        <div style="flex: 1"></div>
        <div class="header-toolbar">
            <p class="welcome-text">您好{{name}}，欢迎回来！</p>

            <img :src="headImg" />
            <el-badge :is-dot="isDot" class="hover-point">
                <svg-icon icon-class="message" class="message-svg"/>
            </el-badge>

            <div class="logout hover-point"  @click="logout">
                <svg-icon icon-class="logout" />
            </div>
        </div>
    </div>
</template>

<script >
    import { mapGetters } from 'vuex'
    export default {
        computed: {
            ...mapGetters([
                'name'
            ])
        },
        data() {
            return {
                logoImg: require('@/assets/layout/logo.png'),
                headImg: require('@/assets/layout/head.png'),
                isDot: true
            }
        },
        methods: {
            logout() {
              this.$store.dispatch('FedLogOut').then(() => {
                this.$confirm('是否确认退出', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  this.$router.push('/login');
                  location.reload(); // 为了重新实例化vue-router对象 避免bug
                });
              })
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    .layout-header {
        background-color: #5cb1ff;
        height: 70px;
        position: fixed;
        width: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 0px 30px;

        .header-toolbar{
            height: 100%;
            display: flex;
            align-items: center;

            .welcome-text{
                font-size: 14px;
                color:#fff;
            }
            >img{
                height: 35px;
                margin:0 10px;
            }
            .message-svg{
                width: 20px;
                height: 20px;
            }
            .logout{
                border-left: 1px solid #ebeef5;
                padding:0 10px;
                margin-left: 10px;

            }
        }

    }

    .hover-point{
        cursor: pointer;
    }

</style>
