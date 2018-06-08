<template>
    <div class="layout-container">
        <layout-header></layout-header>
        <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
            <sidebar class="sidebar-container"></sidebar>
            <div class="main-container">
                <navbar></navbar>
                <tags-view></tags-view>
                <app-main class="app-main"></app-main>
            </div>

        </div>
    </div>

</template>

<script>
    import {Navbar, Sidebar, AppMain, LayoutHeader, TagsView} from '@/views/layout/components'

    export default {
        name: 'layout',
        components: {
            Navbar,
            Sidebar,
            AppMain,
            LayoutHeader,
            TagsView
        },
        computed: {
            sidebar() {
                return this.$store.state.app.sidebar
            }
        },
        method: {
            logout() {
                this.$store.dispatch('LogOut').then(() => {
                    location.reload() // 为了重新实例化vue-router对象 避免bug
                })
            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    @import "src/styles/mixin.scss";

    .sidebar-container{
        /*border-right: 1px solid #97a8be;*/
        box-shadow: 1px 2px 1px 1px #e8ebf2;
    }

    .layout-container {
        display: flex;
        flex-direction: column;

        .app-wrapper {
            @include clearfix;
            position: relative;
            height: 100%;
            width: 100%;
            margin-top: 70px;
        }
    }

    .app-main{
        margin-top: 10px;
    }

</style>
