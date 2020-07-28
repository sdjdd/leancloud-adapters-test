const AV = require('../../lib/av-live-query-core-min')
const adapters = require('../../lib/leancloud-adapters-toutiao')

AV.setAdapters(adapters)

AV.init({
  appId: '',
  appKey: '',
  serverURL: ''
})

function chooseImage() {
  return new Promise((resolve, reject) => {
    tt.chooseImage({
      success: resolve,
      fail: reject
    });
  })
}

async function testUploadFile() {
  const image = await chooseImage()
  const path = image.tempFilePaths[0]
  const file = new AV.File('test-toutiao-upload.jpg', {
    blob: { uri: path }
  })
  await file.save()
  file.destroy()
}

async function testLiveQuery() {
  let test = new AV.Object('Test')
  test.set('str', 'test toutiao adapters')
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

Page({
  data: {},
  testUploadFile() {
    tt.showLoading({ title: '正在上传' })
    testUploadFile().then(() => {
      tt.hideLoading()
      tt.showToast({ title: '上传成功' })
    }).catch(() => {
      tt.hideLoading()
      tt.showToast({ title: '上传失败', icon: 'fail' })
    })
  },
  testLiveQuery() {
    tt.showLoading({ title: '正在测试 LiveQuery' })
    testLiveQuery().then(() => {
      tt.hideLoading()
      tt.showToast({ title: '测试成功' })
    }).catch((err) => {
      console.error(err)
      tt.hideLoading()
      tt.showToast({ title: '测试失败', icon: 'fail' })
    })
  }
})
