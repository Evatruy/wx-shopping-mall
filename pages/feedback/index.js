/**
 * 1 点击“+”触发tap点击事件
 *   1 调用小程序内置的 选择图片的api
 *   2 获取到 图片的路径 数组
 *   3 把图片路径 存入 data的变量中
 *   4 页面就可以根据 图片数组 进行循环显示 自定义组件
 * 2 点击 自定义图片 组件
 *  1 获取被点击的元素索引
 *  2 获取 data中的图片数组
 *  3 根据索引 数组中删除对应的元素
 *  4 把数组重新设置回data中
 * 3 点击“提交”
 *  1 获取文本域内容
 *    1 data中定义变量 表示 输入框内容
 *    2 文本域 绑定事件 事件触发 把输入框的值存入变量中
 *  2 对这些内容 合法性验证
 *  3 验证通过 用户选择的图片 上传到专门的图片服务器 返回图片外网链接
 *    1 遍历图片数组
 *    2 挨个上传
 *    3 自己再维护图片数组 存放 图片上传后的外网链接
 *  4 文本域 和 外网图片路径 一起提交到服务器 前段的模拟 不会发送请求到后台
 *  5 清空当前页面
 *  6 返回上一页
 */
Page({

  data: {
    tabs:[
      {
        id:0,
        value:"体验问题",
        isActive:true
      },
      {
        id:1,
        value:"商品、商家投诉",
        isActive:false
      }
    ],
    // 被选中的图片路径数组
    chooseImgs:[],
    // 文本域内容
    textVal:""
  },
  // 外网的图片路径数组
  UploadImgs:[],

  //标题点击事件 从子组件传递过来
  handleTabsItemChange(e){
    // 1 获取被点击的标题索引
    const {index}=e.detail;
    // 2 修改源数组
    let {tabs}=this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    // 3 赋值到data中
    this.setData({
      tabs
    })
  },
  // 点击“+”选择图片
  handleChooseImg(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          // 图片数组 进行拼接
          chooseImgs:[...this.data.chooseImgs, ...result.tempFilePaths]
        });
      }
    });
  },
  // 点击 自定义图片组件
  handleRemoveImg(e){
    const {index}=e.currentTarget.dataset;
    let {chooseImgs}=this.data;
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    });
  },
  // 文本域的输入事件
  handleTextInput(e){
    this.setData({
      textVal:e.detail.value
    });
  },
  // 提交
  handleFormSubmit(){
    const {textVal,chooseImgs}=this.data;
    if(!textVal.trim()){
      // 不合法
      wx.showToast({
        title:'输入不合法',
        icon:'none',
        mask:true
      });
      return;
    }
    // 上传文件的 api 不支持 多个文件同时上传 遍历数组 挨个上传
    // 显示正在等待
    wx.showLoading({
      title: "正在上传中",
      mask: true,
    });

    // 判断有无需要上传的图片
    if(chooseImgs.length!=0){
      chooseImgs.forEach((v, i) => {
        wx.uploadFile({
          url: 'https://images.ac.cn/Home/Index/UploadAction/',
          filePath: v,
          name: "file",
          formData: {},
          success: (result)=>{
            let url=Json.parse(result.data).url;
            this.UploadImgs.push(url);

            // 所有图片上传完毕后才触发
            if(i===chooseImgs.length-1){
              wx.hideLoading();
              // 把文本内容及图片数组 提交到后台 提交成功 重置页面
              this.setData({
                textVal:"",
                chooseImgs:[]
              });
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      });
    }else{
      wx.hideLoading();
      console.log("只提交文本");
      wx.navigateBack({
        delta: 1
      });
    }
  }
})