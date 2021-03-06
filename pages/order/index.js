/**
 * 1 页面被打开的时候 onshow
 *  0 onShow 不同于onLoad 无法在形参上接受参数
 *  0.5 判断缓存中有没有token
 *  1 获取url上的参数
 *  2 根据type来决定页面标题谁被选中
 *  2 根据type去发送请求获取数据
 *  3 渲染页面
 * 2 点击不同的标题 重新发送请求来获取和渲染数据
 */
 import {request} from "../../request/index";
 import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    tabs:[
      {
        id:0,
        value:"全部",
        isActive:true
      },
      {
        id:1,
        value:"待付款",
        isActive:false
      },
      {
        id:2,
        value:"待收货",
        isActive:false
      },
      {
        id:3,
        value:"退款/退货",
        isActive:false
      }
    ]
  },

  onShow(options){
    const token = wx.getStorageSync('token')||'111';
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/index'
      });
      return;
    }
    // 1 获取当前的小程序的页面栈-数组 长度最大是10页面
    let pages = getCurrentPages();
    let currentPage=pages[pages.length-1];
    const {type}=currentPage.options;
    this.changeTitleByIndex(type-1);
    this.getOrders(type);
  },
  // 获取订单列表
  async getOrders(type){
    const res=await request({url:"/my/orders/all",data:{type}});
    this.setData({
      orders:res.orders.map(v=>({...v,create_time_cn:(new Date(v.create_time*1000).toLocaleString())}))
    });
  },

  //根据标题索引来激活选中 标题数组
  changeTitleByIndex(index){
    // 2 修改源数组
    let {tabs}=this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    // 3 赋值到data中
    this.setData({
      tabs
    })
  },

  handleTabsItemChange(e){
    // 1 获取被点击的标题索引
    const {index}=e.detail;
    this.changeTitleByIndex(index);
    // 重新发送请求 type=1 index=0
    this.getOrders(index+1);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})