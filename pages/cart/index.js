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
 */

import {getSetting, chooseAddress, openSetting} from "../../utils/asyncWx.js";
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({
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
      const address=await chooseAddress();
      wx.setStorageSync('address', address);
    } catch (error) {
      console.log(error);
    }   
  }
})