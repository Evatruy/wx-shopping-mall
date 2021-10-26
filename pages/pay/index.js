 /**
  * 1 页面加载的时候
  *  1 从缓存中获取购物车数据 渲染到页面中
  *    这些数据check属性为true
  * 2 微信支付
  *  1 哪些人 哪些账号 可以实现微信支付
  *    1 企业账号 
  *    2 企业账号的小程序后台中 必须 给开发者 添加上白名单
  *      1 一个appid可以同时绑定多个开发者
  *      2 这些开发者可以公用这个appid和它的开发权限
  *  3 支付按钮
  *   1 先判断缓存中有无token
  *   2 没有 跳转到授权页 进行获取token
  *   3 创建订单
  */
 import {getSetting, chooseAddress, openSetting,showModal,showToast, requestPayment} from "../../utils/asyncWx.js";
 import regeneratorRuntime from '../../lib/runtime/runtime';
 import { request } from "../../request/index.js";
 
 Page({
   data:{
     address:{},
     cart:[],
     totalPrice:0,
     totalNum:0
   },
 
   onShow(){
     const address=wx.getStorageSync('address');
     let cart=wx.getStorageSync('cart')||[];
     //  过滤后的购物车数组
     cart=cart.filter(v=>v.checked);

     let totalPrice=0;
     let totalNum=0;
     cart.forEach(v=>{
        totalPrice+=v.num * v.goods_price;
        totalNum+=v.num;
     });
     
     this.setData({
       address,
       cart,
       totalNum,
       totalPrice
     });
   },
  //  点击支付
  async handleOrderPay(){
    try {
      const token=wx.getStorageSync('token');
      if(!token){
        wx.navigateTo({
          url: '/pages/auth/index'
        })
        return;
      }
      const header={Authorization:token};
      const order_price=this.data.totalPrice;
      const consignee_addr= this.data.address.all;
      const cart=this.data.cart;
      let goods=[];
      cart.forEach(v=>goods.push({
        goods_id:v.goods_id,
        goods_number:v.num,
        goods_price:v.goods_price
      }));
      const orderParams={order_price,consignee_addr,goods};
      // 发送请求 创建订单 获取订单编号
      const {order_number}=await request({url:"/my/orders/create",method:"POST",data:orderParams,header});
      // 准备发起 预支付接口
      const {pay} = await request({url:"/my/orders/req_unifiedorder",data:{order_number},method:"POST",header});
      // 发起微信支付
      await requestPayment(pay);
      // 查询后台 订单状态
      const res=await request({url:"/my/orders/chkOrder",data:{order_number},method:"POST",header});
      await showToast({title:"支付成功"});
      // 支付成功 跳转到订单页面
      wx.navigateTo({
        url: '/pages/order/index',
      });
    } catch (error) {
      await showToast({title:"支付失败"});
      console.log(error);
    }
  }
 })