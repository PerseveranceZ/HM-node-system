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
        <el-button type="primary" @click="openDialog('new')">
          <i class="el-icon-upload2"></i>
          新增app客户端
        </el-button>
      </el-header>
      <el-main style="padding: 10px 0">
        <el-table stripe :data="tableData" border style="width: 100%">
          <el-table-column fixed type="index" width="30"></el-table-column>
          <el-table-column prop="displayName" label="app应用名" width="100"></el-table-column>
          <el-table-column prop="appName" label="app工程名" width="100"></el-table-column>
          <el-table-column prop="iOSBundleId" label="iOS BundleId" width="200"></el-table-column>
          <el-table-column prop="androidAppId" label="android AppId" width="200"></el-table-column>
          <el-table-column prop="downloadUrl" label="下载地址" width="400"></el-table-column>
          <el-table-column prop="isDiff" label="是否差分更新" width="130"></el-table-column>
          <el-table-column prop="appCliPath" label="脚手架所在路径" width="400"></el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" @click="openDialog('edit' ,scope.row)" size="small">编辑</el-button>
              <!--<el-button type="text" @click="deleteClient(scope.row)" size="small">删除</el-button>-->
            </template>
          </el-table-column>
        </el-table>
      </el-main>

    </el-container>
    <el-dialog :title="dialogType == 'edit'? '编辑客户端信息':'新增客户端信息'" :visible.sync="dialogFormVisible"
               :close-on-click-modal="false" :before-close="closeDialog">

      <el-form :model="form" class="upload-package-dialog" :rules="rules" ref="clientInfoDialog">
        <el-form-item label="app应用名:" prop="displayName">
          <el-input :disabled="isEdit" v-model="form.displayName"></el-input>
          <el-tooltip class="item" effect="dark" content="app的显示名称" placement="top">
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="app工程名:" prop="appName">
          <el-input :disabled="isEdit" v-model="form.appName"></el-input>
          <el-tooltip class="item" effect="dark" content="app所在工程config/eros.native.js中的appName" placement="top">
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="iOS bundleId:" prop="iOSBundleId">
          <el-input v-model="form.iOSBundleId"></el-input>
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">ios工程中的bundle identifier<br/>通常是官网域名倒写+app名。<br/> 例如：com.anxintrust.home</div>
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="android AppId:" prop="androidAppId">
          <el-input v-model="form.androidAppId"></el-input>
          <el-tooltip class="item" effect="dark" content="android工程中的applicationId，规范同iOS BundleId" placement="top">
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="下载地址:" prop="downloadUrl">
          <el-input v-model="form.downloadUrl"></el-input>
          <el-tooltip class="item" effect="dark" content="客户端下载页面" placement="top">
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="是否差分更新:">
          <el-radio-group v-model="form.isDiff">
            <el-radio label='true'>是</el-radio>
            <el-radio label='false'>否</el-radio>
          </el-radio-group>
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">差分更新是针对客户端内js包和本地最新的全量包之间<br/>使用diff工具生成两个包之间的增量包的更新。<br/> 如果选择是，需要提供差分包所在路径</div>
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="脚手架所在路径:" prop="appCliPath">
          <el-input v-model="form.appCliPath"></el-input>
          <el-tooltip class="item" effect="dark" content="差分包所在绝对路径，(和node在同一台服务器的绝对路径)" placement="top">
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="saveClientInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as util from '@/utils'
  import {isValidateURL} from '@/utils/validate'
  import {
    isValidateAppPackageName,
    addOrUpdateClientInfo,
    getClientInfo,
    isValidateDisplayName,
    deleteClientInfo
  } from '@/api/appManager'
  export default {
    created() {
      this.getClinetInfos();
    },
    data() {
      const validateDisplayName = (rule, value, callback) => {
        if (value) {
          let params = {
            displayName: value,
            id: this.form._id
          }
          isValidateDisplayName(params).then(res => {
            callback()
          }, err => {
            callback(new Error('app应用名已存在，请换一个'))
          })
        } else {
          callback(new Error('请输入app应用名'))
        }
      }
      const validateURL = (rule, value, callback) => {
        if (!isValidateURL(value)) {
          callback(new Error('请输入正确的url'))
        } else {
          callback()
        }
      }
      const validateAppPackageName = (rule, value, callback) => {
        if (value) {
          let params = {
            appName: value,
            id: this.form._id
          }
          isValidateAppPackageName(params).then(res => {
            callback()
          }, err => {
            callback(new Error('app工程名已存在，请换一个'))
          })
        } else {
          callback(new Error('请输入app工程名称'))
        }
      }
      return {
        dialogType: 'new',
        dialogFormVisible: false,
        isLoading: true,
        rules: {
          displayName: [
            {required: true, trigger: 'blur', validator: validateDisplayName}
          ],
          appName: [
            {required: true, trigger: 'blur', validator: validateAppPackageName}
          ],
          iOSBundleId: [
            {required: true, message: '请输入iOS端的bundle identifier', trigger: 'blur'}
          ],
          androidAppId: [
            {required: true, message: '请输入android端的applicationId', trigger: 'blur'}
          ],
          downloadUrl: [
            {required: true, trigger: 'blur', validator: validateURL}
          ],
          appCliPath: [
            {required: true, message: '请输入工程所在目录', trigger: 'blur'}
          ]
        },
        form: {
          displayName: '',
          appName: '',
          iOSBundleId: '',
          androidAppId: '',
          downloadUrl: '',
          isDiff: 'false',
          appCliPath: ''
        },
        formLabelWidth: '120px',
        tableData: [],
        isEdit: false
      }
    },
    watch: {},
    methods: {
      getClinetInfos(){
        getClientInfo().then(res => {
          this.tableData = res.data.data;
        }, err => {
          this.$message.error(err.message);
        }).finally(() => {
          this.isLoading = false;
        })
      },
      saveClientInfo(){
        this.isLoading = true;
        addOrUpdateClientInfo(this.form).then(res => {
          this.$confirm('是否确认保存?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.dialogFormVisible = false;
            this.$refs.clientInfoDialog.clearValidate();
            this.clearDialog();
            this.$message.success('新增客户端信息成功');
            this.getClinetInfos();
          });
        }, err => {
          this.$message.error(err.message);

        }).finally(() => {
          this.isLoading = false;
        })
      },
      openDialog(type, data){
        this.dialogFormVisible = true
        this.dialogType = type
        if (type == 'edit') {
          this.form = data;
          this.isEdit = true;
        }
      },
      closeDialog(done){
        this.$confirm('是否确认取消?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (done) {
            done();
          } else {
            this.dialogFormVisible = false;
          }
          this.$refs.clientInfoDialog.clearValidate();
          this.clearDialog();
          this.getClinetInfos();
        });
      },
      clearDialog(){
        this.isEdit = false;
        this.form = {
          displayName: '',
          appName: '',
          iOSBundleId: '',
          androidAppId: '',
          downloadUrl: '',
          isDiff: 'false',
          appCliPath: ''
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'app-release-infos.scss';

</style>
