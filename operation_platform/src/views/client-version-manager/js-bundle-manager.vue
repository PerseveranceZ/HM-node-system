/**
* Created by tangsicheng on 2018/3/1.
*/
<template>
  <div>
    <el-container v-loading.fullscreen.lock="isLoading"
                  element-loading-text="loading。。。"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-header style="height: auto;padding: 0">
        <el-button type="primary" @click="openDialog">
          <i class="el-icon-download"></i>
          下载最新bundle资源包
        </el-button>
      </el-header>
      <el-main style="padding: 10px 0">
        <el-table
          :data="currentTableData"
          style="width: 100%;overflow: scroll;">
          <el-table-column fixed prop="appName" :filters="filters"
                           :filter-method="filterHandler"
                           filter-placement="bottom-end" label="工程名称"></el-table-column>
          <el-table-column sortable prop="createTimeFormate" label="发布日期">
          </el-table-column>
          <el-table-column prop="iOS" label="ios版本"></el-table-column>
          <el-table-column prop="android" label="android版本"></el-table-column>
          <el-table-column prop="jsVersion" label="js版本" width="300"></el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template slot-scope="scope">
              <el-button v-if="scope.row.isRelease == true" type="text" @click="release(false ,scope.row)" size="small">
                取消发布
              </el-button>
              <el-button v-else type="text" @click="release(true ,scope.row)" size="small">发布</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="display: flex;align-items: center;justify-content: center"
          @current-change="handleCurrentChange"
          :page-size="8"
          layout="total, prev, pager, next, jumper"
          :total="tableData.length">
        </el-pagination>
      </el-main>
    </el-container>
    <el-dialog :title="'下载最新bundle资源包'" :visible.sync="downloadDialogVisible"
               :close-on-click-modal="false" :before-close="closeDialog">
      <el-form :model="form" class="upload-package-dialog" :rules="rules" ref="downloadDialog">
        <el-form-item label="客户端名称:" prop="appName">
          <el-select v-model="form.appName" filterable placeholder="请选择">
            <el-option v-for="item in clientInfo" :key="item.appName" :label="item.displayName"
                       :value="item.appName">
              <span style="float: left">{{ item.displayName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.appName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="download()">下载</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getJsBundleInfos, getClientInfo, downloadBundle, updateJsBundleStatus} from '@/api/appManager'
  import * as util from '@/utils'
  export default {
    methods: {
      deleteRow(index, rows) {
        rows.splice(index, 1);
      },
      handleCurrentChange(val) {
        this.currentTableData = this.tableData.slice((val - 1) * 8, val * 8);
      },
      getBundleVersions(){
        getJsBundleInfos().then(res => {
          let data = res.data.data
          //createTimeFormate
          let set = new Set();
          for (let i = 0; i < data.length; i++) {
            data[i].createTimeFormate = util.formatDate(new Date(parseInt(data[i].createTime)))
            set.add(data[i].appName);
          }
          this.tableData = data
          this.currentTableData = this.tableData.slice(0, 8);
          this.filters = [];
          for (let item of set.keys()) {
            this.filters.push({text: item, value: item})
          }

        }).catch(err => {
          this.$message.error(err.message);
        }).finally(() => {
          this.isLoading = false;
        })
      },
      openDialog(){
        this.downloadDialogVisible = true;
      },
      closeDialog(done){
        if (done) {
          done();
        } else {
          this.downloadDialogVisible = false;
        }
        this.appName = ''
      },
      release(flag, row){
        let param = {
          _id: row._id,
          status: flag
        }
        this.$confirm(flag?'是否确认需要发布开放给用户热更新？':'是否确认取消发布？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateJsBundleStatus(param).then(res=>{
            this.$notify({
              title: '成功',
              message:`${flag?'发布':'取消发布'}成功`,
              type: 'success'
            });
            this.getClinetInfos();
            this.getBundleVersions();
          }).catch(err=>{
            this.$notify.error({
              title: '错误',
              message: err.message
            });
          })
        }).catch(err => {
          console.log(err);
        });
      },
      getClinetInfos(){
        getClientInfo().then(res => {
          this.clientInfo = res.data.data;
        }, err => {
          this.$message.error(err.message);
        }).finally(() => {
          this.isLoading = false;
        })
      },
      //todo 分页的时候，这里的过滤功能有bug，稍后有时间了再处理
      filterHandler(value, row, column){
        const property = column['property'];
        return row[property] === value;
      },
      download(){
        this.$refs.downloadDialog.validate((valid) => {
          if (valid) {
            downloadBundle(this.form.appName).then(res => {
              this.closeDialog();
            }, err => {
              this.$message.error(err.message);
            }).finally(() => {
              this.isLoading = false;
            })
          } else {
            return false;
          }

        });
      }
    },
    created() {
      this.getBundleVersions();
      this.getClinetInfos();
    },
    data() {
      return {
        tableData: [],
        isLoading: true,
        downloadDialogVisible: false,
        currentTableData: [],
        clientInfo: [],
        filters: [],
        form: {
          appName: '',
        },
        rules: {
          appName: [
            {required: true, message: '请选择客户端名称', trigger: 'blur'}
          ]
        },
      }
    }
  }
</script>

<style lang="scss">
  @import 'app-release-infos.scss';

  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

</style>
