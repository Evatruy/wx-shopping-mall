/**
 * 1 获取用户的收货地址
 *  1 绑定点击事件
 *  2 获取用户对小程序所授予获取地址的权限状态 scope
 *   1 假设 用户 点击获取收货地址的提示框 确定 authSetting scope.address
 *      scope 值 true 直接调用 获取收货地址
 *   2 假设 用户 点击获取收货地址的提示框 取消
 *      scope 值 false 诱导用户 自己打开授权设置页面
 *   3 假设 用户 从来没有调用过 收货地址的api
 *      scope undefined 直接调用 获取收货地址
 *   4 获取到的地址，放入本地缓存
 * 2 页面加载完毕
 *  0 onLoad  onShow
 *  1 获取本地存储中的地址数据
 *  2 把数据 设置给data中的一个变量
 * 3 onShow
 *  1 获取缓存中的购物车数组
 *  2 把购物车数据 填充到data中
 * 4 全选实现 数据的展示
 *  1 onShow 获取缓存中的购物车数组
 *  2 根据购物车中的商品数据 所有的商品都被选中 checked=true
 * 5 总价格和总数量
 *  1 都需要商品被选中 我们才拿他来计算
 *  2 获取购物车数组
 *  3 遍历
 *  4 判断商品是否被选中
 *  5 总价格+=商品单价*商品数量
 *  6 总数量+=商品数量
 *  7 把计算后的价格和数量都设置回data中
 * 6 商品的选中
 *  1 绑定change事件
 *  2 获取到被修改的商品对象
 *  3 重新填充回data中和缓存中
 *  4 重新计算全选 总价格、总数量
 * 7 全选和反选
 * 8 商品数量的编辑
 *  1 “+”“-”按钮 绑定同一个点击事件 区分的关键 自定义属性
 *    1 “+”“+1”
 *    2 “-”“-1”
 *  2 传递被点击的商品的id goods_id
 *  3 获取data中的购物车数组 来获取需要被修改的商品对象
 *  4 当数量为1同时点减，弹窗询问是否要删除
 *  4 直接修改商品对象的数量 num
 *  5 把cart数组 重新设置回 缓存中
 * 9 点击结算
 *  1 判断有没有收货地址信息
 *  2 判断用户有没有选购商品
 *  3 经过以上验证 跳转到支付页面
 */

import {getSetting, chooseAddress, openSetting,showModal,showToast} from "../../utils/asyncWx.js";
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({
  data:{
    address:{},
    cart:[],
    allChecked:false,
    totalPrice:0,
    totalNum:0
  },

  onShow(){
    const address=wx.getStorageSync('address');
    const cart=wx.getStorageSync('cart')||[];
    this.setData({address});
    this.setCart(cart);
  },

  //点击收货地址
  async handleChooseAddress(){     
    try {
      // 1获取权限状态
      const res1=await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      //2 判断权限状态
      if(scopeAddress === false){
        await openSetting();
      }
      // 3 调用获取收货地址的api
      let address=await chooseAddress();
      address.all=address.provinceName+address.cityName+address.countyName+address.detailInfo;
      wx.setStorageSync('address', address);
    } catch (error) {
      console.log(error);
    }   
  },

  // 商品选中
  handleItemChange(e){
    const goods_id=e.currentTarget.dataset.id;
    // 获取购物车数组
    let {cart}=this.data;
    let index=cart.findIndex(v=>v.goods_id===goods_id);
    cart[index].checked=!cart[index].checked;    
    this.setCart(cart);
  },

  // 设置购物车状态 同时重新计算底部工具栏数据
  setCart(cart){
    //计算全选
    let allChecked=true;
    let totalPrice=0;
    let totalNum=0;
    cart.forEach(v=>{
      if(v.checked){
        totalPrice+=v.num * v.goods_price;
        totalNum+=v.num;
      }else{
        allChecked=false;
      }
    });
    // 判断数组是否为空
    allChecked=cart.length!=0?allChecked:false;
    this.setData({
      cart,
      allChecked,
      totalNum,
      totalPrice
    });
    wx.setStorageSync('cart', cart);
  },

  // 全选和反选
  handleItemAllCheck(){
    let {cart,allChecked}=this.data;
    allChecked=!allChecked;
    cart.forEach(v=>v.checked=allChecked);
    this.setCart(cart);
  },
  // 商品数量的编辑
  async handleItemNumEdit(e){
    const {operation,id}=e.currentTarget.dataset;
    let {cart}=this.data;
    const index=cart.findIndex(v=>v.goods_id===id);
    if(cart[index].num===1&&operation===-1){
      const res=await showModal({content:'您是否要删除？'});
      if(res.confirm){
        cart.splice(index,1);
        this.setCart(cart);
      }
    }else{
      cart[index].num+=operation;
      this.setCart(cart);
    }
  },
  // 点击结算
  async handlePay(){
    const {address,totalNum}=this.data;
    if(!address.userName){
      await showToast({title:"您还没有选择收货地址"});
      return;
    }
    if(totalNum===0){
      await showToast({title:"您还没有选购商品"});
      return;
    }
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }
})