/**
* Created by tangsicheng on 2018/3/1.
*/
<template>
  <div>
    <div v-show="isUpdate" class="update-dialog" :style="{ 'z-index' : zIndex }">
      <el-progress type="circle" :percentage="percentage" :width="80"></el-progress>
      <p style="color: white;"> 上传中,请稍等。。。</p>
    </div>
    <el-container v-loading.fullscreen.lock="isLoading"
                  element-loading-text="please waiting...."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-header style="height: auto;padding: 0">
        <el-button type="primary" @click="openDialog('iOS')">iOS客户端上传<i
          class="el-icon-upload el-icon--right"></i></el-button>
        <el-button type="primary" @click="openDialog('android')">android客户端上传<i
          class="el-icon-upload el-icon--right"></i></el-button>
      </el-header>
      <el-main style="padding: 10px 0">
        <el-table :data="tableData" border stripe>
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table-expand">
                <el-form-item label="发布描述">
                  <el-input wrap="hard" disabled type="textarea" :rows="3" placeholder="请输入内容"
                            :value="props.row.description"></el-input>

                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="上传日期" sortable prop="updateTimeFormate"></el-table-column>
          <el-table-column label="客户端" sortable prop="appName"></el-table-column>
          <el-table-column label="发布时间" sortable prop="issueDateFormate"></el-table-column>
          <el-table-column label="客户端类型" prop="clientType"></el-table-column>
          <el-table-column label="是否强制更新" prop="isForcedUpdating"></el-table-column>
          <el-table-column label="客户端版本" sortable prop="clientVersion"></el-table-column>
          <el-table-column fixed="right" label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" @click="edit(scope.row)" size="small">编辑</el-button>
              <el-button type="text" @click="uploadToPgyer(scope.row)" size="small">上传蒲公英</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>

    </el-container>
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false"
               :before-close="closeDialog">
      <el-form :model="form" class="upload-package-dialog" :rules="rules" ref="uploadFrom">
        <el-form-item v-if="!isEdit" ref="fileUploadDiv" label="上传客户端:" prop="file">
          <label for="file-upload" class="el-button el-button--primary">
            上传<i class="el-icon-upload el-icon--right"></i>
          </label>
          <el-tag v-if="form.file" :key="form.file.name" closable @close="tagClose">
            {{form.file.name}}
          </el-tag>
          <input ref="fileUpload" id="file-upload" type="file" @change="handleFileChange" autocomplete="off">
        </el-form-item>
        <el-form-item label="客户端:" prop="appName">
          <el-select :disabled="isEdit" v-model="form.appName" filterable placeholder="请选择">
            <el-option v-for="item in clientInfo" :key="item.appName" :label="item.appName"
                       :value="item.appName">
              <span style="float: left">{{ item.displayName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.appName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="期望发布时间:" prop="issueDate">
          <el-date-picker v-model="form.issueDate" type="datetime" placeholder="选择日期时间" align="right" :editable="false">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="版本号:" prop="clientVersion">
          <el-input v-model="form.clientVersion" :disabled="form.appName==''"></el-input>
          <el-tooltip class="item" effect="dark" placement="top">
            <div slot="content">版本号格式为xxx.xxx.xxx<br/>其中，每个xxx可以是0，但是<br/>不可以是首位为0的数字<br/>每个xxx的范围区间为0-999之间<br/>
              正确格式：1.0.0 或 999.999.999
            </div>
            <el-button class="tool-tip"><i class="el-icon-question"></i></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="是否强制更新:">
          <el-radio-group v-model="form.isForcedUpdating">
            <el-radio label='true'>是</el-radio>
            <el-radio label='false'>否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发布描述:">
          <el-input v-model="form.description" wrap="hard" type="textarea" :rows="3" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="saveInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import {addClass, removeClass, getStyle} from 'element-ui/src/utils/dom';
  import * as util from '@/utils'
  import {
    addReleaseInfos,
    getReleaseInfos,
    getClientInfo,
    checkReleaseVersion,
    postToPgyer,
    updateReleaseInfos
  } from '@/api/appManager'
  import {isValidatClientVersion} from '@/utils/validate'
  export default {
    created() {
      this.getReleaseInfos();
      this.getClinetInfos();
    },
    data() {
      const validateClientVersion = (rule, value, callback) => {
        if (value) {

          if (!isValidatClientVersion(value)) {
            callback(new Error('版本号格式不正确，请参照xxx.xxx.xxx的格式填写'))
            return;
          }
          let params = {
            appName: this.form.appName,
            clientVersion: value,
            clientType: this.dialogType
          }
          checkReleaseVersion(params).then(res => {
            let data = res.data;

            if (data.resCode == 'APP0000') {
              callback();
            } else {
              callback(new Error(data.msg))
            }
          }, err => {
            callback(new Error('版本校验失败，请联系程序员哥哥！'))
          })
        } else {
          callback(new Error('请输入版本号'))
        }
      }

      const validateFile = (rule, value, callback) => {
        if (!this.isEdit && !value) {
          callback(new Error('请上传客户端'))
        } else {
          callback()
        }
      }
      return {
        zIndex: 2000,
        isUpdate: false,
        percentage: 0,
        dialogType: '',
        dialogTitle: '',
        dialogFormVisible: false,
        isLoading: false,
        clientInfo: [],
        isEdit: false,

        rules: {
          file: [
            {required: true, trigger: 'change', validator: validateFile}
          ],
          appName: [
            {required: true, message: '请选择客户端名称', trigger: 'change'}
          ],
          issueDate: [
            {type: 'date', required: true, message: '请选择发布时间', trigger: 'change'}
          ],
          clientVersion: [
            {required: true, trigger: 'blur', validator: validateClientVersion}
          ]
        },
        form: {
          file: '',
          appName: '',
          issueDate: '',
          clientVersion: '',
          clientPath: '',
          description: '',
          isForcedUpdating: 'false'
        },
        formLabelWidth: '120px',
        tableData: []
      }
    },
    watch: {
      isUpdate: function (val, oldVal) {

        if (val == true) {
          this.zIndex = parseInt(getStyle(document.querySelector('.el-dialog__wrapper'), 'z-index')) + 5;
          addClass(document.body, 'el-loading-parent--hidden');

        } else {
          removeClass(document.body, 'el-loading-parent--hidden');
        }
      }
    },
    methods: {
      uploadToPgyer(data)
      {
        this.$confirm('是否确认上传蒲公英?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.isLoading = true;
          postToPgyer(data._id).then(res => {
            if (res.data.resCode == 'APP0000') {
              this.$message.success('上传成功');
            } else {
              this.$message.warning(res.data.msg);
            }
          }).catch(err => {
            this.$message.error(err.message);
          }).finally(() => {
            this.isLoading = false;
          })
        });

      }
      ,
      getClinetInfos()
      {
        getClientInfo().then(res => {
          this.clientInfo = res.data.data;
        }, err => {
          this.$message.error(err.message);
        }).finally(() => {
          this.isLoading = false;
        })
      }
      ,
      getReleaseInfos()
      {
        getReleaseInfos().then(res => {
            console.log(res);
          var data = res.data.data;
          for (let i = 0; i < data.length; i++) {

            data[i].issueDateFormate = util.formatDate(new Date(data[i].issueDate))
            data[i].updateTimeFormate = util.formatDate(new Date(data[i].updateTime))
          }
          this.tableData = data;
        }, err => {
          this.$message.error(err.message);
        })
      }
      ,
      openDialog(clientType, isEdit)
      {
        this.dialogFormVisible = true
        this.dialogType = clientType
        if (isEdit) {
          this.dialogTitle = clientType + '客户端编辑'
        } else {
          this.dialogTitle = clientType + '客户端上传'
        }

      }
      ,
      saveInfo()
      {
        var that = this;
        this.$refs.uploadFrom.validate((valid) => {
          if (valid) {
            if (this.isEdit) {
              this.$confirm('是否确认更新发布信息？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.isLoading = true;
                updateReleaseInfos(this.form).then(res=>{
                  console.log(res);
                  if(res.data.resCode=='APP0000'){
                    this.$message.success('更新发布信息成功');
                    this.getReleaseInfos();
                    this.clearDialog();
                    this.dialogFormVisible = false;
                  }
                }).catch(err=>{
                  this.$message.error(err.message);
                }).finally(()=>{
                  this.isLoading = false;
                })
              });
            } else {
              this.$confirm('是否确认上传包信息？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.isUpdate = true;
                let formData = new FormData();
                formData.append('file', this.form.file);
                formData.append('appName', this.form.appName);
                formData.append('issueDate', this.form.issueDate);
                formData.append('clientVersion', this.form.clientVersion);
                formData.append('description', this.form.description);
                formData.append('isForcedUpdating', this.form.isForcedUpdating);
                let config = {
                  url: `/app/releaseInfos/${this.dialogType}`,
                  onProgress: function (e) {
                    "use strict";
                    e.percent = e.loaded / e.total * 100;
                    that.percentage = Number(util.toFixedNum(e.percent));
                  }
                }
                addReleaseInfos(formData, config).then(res => {
                  this.getReleaseInfos();
                  this.$message.success('新版本发布成功');
                  this.clearDialog();
                  this.dialogFormVisible = false;
                }).catch(err=>{
                  this.$message.error(err.message);
                }).finally(()=>{
                  this.isUpdate = false;
                });
              })
            }
          } else {
            return false;
          }
        });
      }
      ,
      handleFileChange(e)
      {
        if (this.dialogType == 'iOS') {
          if (typeof e.target === 'undefined') {
            this.$message.error('未获取到文件');
          } else {
            let appName = e.target.files[0].name;
            let strRegex = "(.ipa)$";
            let re = new RegExp(strRegex);
            if (re.test(appName)) {
              this.form.file = e.target.files[0];
              this.$refs.fileUploadDiv.clearValidate();
            } else {
              this.$message.error('只能上传.ipa文件');
              this.$refs.fileUpload.value = '';
            }
          }
        } else if (this.dialogType == 'android') {
          if (typeof e.target === 'undefined') {
            this.$message.error('未获取到文件');
          } else {
            let appName = e.target.files[0].name;
            let strRegex = "(.apk)$";
            let re = new RegExp(strRegex);
            if (re.test(appName)) {
              this.form.file = e.target.files[0];
              this.$refs.fileUploadDiv.clearValidate();
            } else {
              this.$message.error('只能上传.apk文件');
              this.$refs.fileUpload.value = '';
            }
          }
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
          this.clearDialog();
          this.getReleaseInfos();
        });

      },
      clearDialog(){
        this.form = {
          file: '',
          appName: '',
          issueDate: '',
          clientVersion: '',
          description: '',
          isForcedUpdating: 'false'
        }
        this.dialogTitle = ''
        this.$refs.uploadFrom.clearValidate();
        if(this.$refs.fileUpload){
          this.$refs.fileUpload.value = '';
        }
        this.isEdit = false;
      },
      edit(data){

        this.form = data;
        this.openDialog(data.clientType, true);
        this.form.issueDate = new Date(this.form.issueDate);
        this.isEdit = true;
      },
      tagClose(){
        this.form.file = ''
        if(this.$refs.fileUpload){
          this.$refs.fileUpload.value = '';
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'app-release-infos.scss';

</style>
