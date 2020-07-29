const AV = require('../../lib/av-live-query-core-min')
const adapters = require('../../lib/leancloud-adapters-weapp')

AV.setAdapters(adapters)

AV.init({
  appId: '',
  appKey: '',
  serverURL: ''
})

Page({
  data: {},
  testLiveQuery() {
    wx.showLoading({ title: '正在测试 LiveQuery' })
    testLiveQuery().then(() => {
      wx.hideLoading()
      wx.showToast({ title: '测试成功' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '测试失败', icon: 'none' })
    })
  },
  testUploadFile() {
    wx.showLoading({ title: '正在上传文件' })
    testUploadFile().then(() => {
      wx.hideLoading()
      wx.showToast({ title: '上传成功' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '上传失败', icon: 'none' })
    })
  },
  testStorage() {
    testStorage().then(() => {
      wx.showToast({ title: 'Storage ok' })
    }).catch(() => {
      wx.showToast({ title: 'Storage error', icon: 'none' })
    })
  }
})

async function testLiveQuery() {
  let test = new AV.Object('Test')
  test.set('str', 'test weapp adapters')
  await test.save()
  console.log('test object created, id =', test.id)

  let query = new AV.Query('Test')
  query.equalTo('objectId', test.id)
  let liveQuery = await query.subscribe()

  return new Promise((resolve, reject) => {
    const randStr = Math.random().toString().substring(2)
    liveQuery.on('update', obj => {
      if (obj.get('str') === randStr) {
        resolve()
      } else {
        reject()
      }
    })
    setTimeout(() => {
      test.destroy()
      liveQuery.unsubscribe()
      reject()
    }, 3000)
    test.set('str', randStr)
    test.save()
  })
}

function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      success: resolve,
      fail: reject
    })
  })
}

async function testUploadFile() {
  const image = await chooseImage()
  const path = image.tempFilePaths[0]
  const file = new AV.File('test-weapp-upload.jpg', {
    blob: { uri: path }
  })
  await file.save()
  file.destroy()
}

async function testStorage() {
  const storage = adapters.storage
  storage.setItem('test', 'test')
  if (storage.getItem('test') !== 'test') {
    throw 'value not correct'
  }
  storage.removeItem('test')
  if (storage.getItem('test')) {
    throw 'value not removed'
  }
  storage.setItem('test1', 'test1')
  storage.setItem('test2', 'test2')
  storage.clear()
  if (storage.getItem('test1') || storage.getItem('test2')) {
    throw 'storage not cleared'
  }
}