/**
 * 1 输入框绑定 值改变事件 input事件
 *  1 获取到输入框的值
 *  2 合法性判断
 *  3 检验通过 把输入框的值发送到后台
 *  4 返回的数据打印到页面上
 * 2 防抖 （防止抖动） 定时器 节流
 *  0 防抖 一般 输入框中 防止重复输入 重复发送请求
 *  1 定义全局的定时器id
 *  2 节流一般用在 页面的上拉 下拉
 * 
 */
 import {request} from "../../request/index";
 import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  data: {
    goods:[],
    // 取消 按钮是否显示
    isFocus:false,
    // 输入框的值
    inpValue:""
  },
  TimeId:-1,

  // 输入框的值改变 就会触发的事件
  handleInput(e){
    const {value}=e.detail;
    if(!value.trim()){
      this.setData({
        goods:[],
        isFocus:false
      });
      return;
    }
    this.setData({
      isFocus:true
    });
    clearTimeout(this.TimeId);
    this.TimeId=setTimeout(() => {
      this.qsearch(value);
    }, 1000);
  },

  async qsearch(query){
    const res=await request({url:"/goods/qsearch",data:{query}});
    this.setData({
      goods:res
    });
  },

  // 取消按钮
  handleCancel(){
    this.setData({
      inpValue:"",
      isFocus:false,
      goods:[]
    })
  }
})