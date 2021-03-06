const AV = require('leancloud-storage/live-query-core')
const adapters = require('@leancloud/platform-adapters-alipay')

AV.setAdapters(adapters)

AV.init({
  appId: '',
  appKey: '',
  serverURL: ''
})

Page({
  testUploadFile() {
    testUploadFile().then(() => {
      my.showToast({ content: '上传成功', type: 'success' })
    }).catch((err) => {
      console.error(err)
      my.showToast({ content: '上传失败', type: 'fail' })
    })
  },
  async testLiveQuery() {
    my.showLoading({ content: '测试中' })
    try {
      await testLiveQuery()
      my.showToast({ content: 'LiveQuery ok', type: 'success' })
    } catch(err) {
      console.error(err)
      my.showToast({ content: 'LiveQuery error', type: 'fail' })
    } finally {
      my.hideLoading()
    }
  }
});

function chooseImage() {
  return new Promise((resolve, reject) => {
    my.chooseImage({
      success: resolve,
      fail: reject
    });
  })
}

async function testUploadFile() {
  const image = await chooseImage()
  const path = image.tempFilePaths[0]
  my.showLoading({ content: '上传中' })
  const file = new AV.File('test-alipay-upload.jpg', {
    blob: { uri: path }
  })
  try {
    await file.save()
    file.destroy()
  } finally {
    my.hideLoading()
  }
}

async function testLiveQuery() {
  const test = new AV.Object('Test')
  test.set('str', 'test alipay adapters')
  await test.save()
  console.log('test object created, objectId =', test.id)

  const query = new AV.Query('Test')
  query.equalTo('objectId', test.id)
  const liveQuery = await query.subscribe()

  return new Promise((resolve, reject) => {
    const randStr = Math.random().toString().substring(2)
    console.log('generate random str:', randStr)
    liveQuery.on('update', obj => {
      const str = obj.get('str')
      console.log('test object updated, str =', str)
      if (str === randStr) {
        resolve()
      } else {
        reject()
      }
    })
    setTimeout(() => {
      test.destroy()
      reject()
    }, 3000)
    test.set('str', randStr)
    test.save()
  })
}
