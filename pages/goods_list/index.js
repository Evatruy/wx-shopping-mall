/**
 * 1 用户上滑页面 滚动条触底 开始加载下一页数据
*   1 找到滚动条触底事件 微信小程序官方开发文档中寻找
*   2 判断还有没有下一页数据
      1 获取到总页数
        总页数 = Math.ceil(总条数 / 页容量)
      2 获取到当前页面
      3 判断一下 当前页码是否大于等于总页数 表示没有下一页数据
*   3 假如没有下一页数据 弹出一个提示
*   4 假如还有下一页数据 来加载下一页数据
      1 当前页面++
      2 重新发送请求
      3 数据请求回来 要对data中的数组进行 拼接 而不是全部替换
  2 下拉刷新页面
   1 触发下拉刷新事件
   2 重置数据数组
   3 重置页码为1
 */
import {request} from "../../request/index";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id:1,
        value:"销量",
        isActive:false
      },
      {
        id:2,
        value:"价格",
        isActive:false
      }
    ],
    goodsList:[]
  },

  //接口要的参数
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  //总页数
  totalPages:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid=options.cid;
    this.getGoodsList();
  },

  //获取商品列表数据
  async getGoodsList(){
    const res=await request({url:"/goods/search", data:this.QueryParams});
    //获取 总条数
    const total=res.total;
    //计算总页数
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    this.setData({
      //拼接了数组
      goodsList:[...this.data.goodsList,...res.goods]
    });

    //关闭下拉刷新窗口
    wx.stopPullDownRefresh();
  },

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

  //页面上滑 滚动条触底事件
  onReachBottom(){
    if(this.QueryParams.pagenum>=this.totalPages){
      //没有下一页数据
      wx-wx.showToast({
        title: '没有下一页数据了'
      })
    }else{
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  //下拉刷新
  onPullDownRefresh(){
    this.setData({
      goodsList:[]
    });
    this.QueryParams.pagenum=1;
    this.getGoodsList();
  }
})