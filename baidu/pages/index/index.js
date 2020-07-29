const AV = require('leancloud-storage/live-query-core')
const adapters = require('@leancloud/platform-adapters-baidu')

AV.setAdapters(adapters)

AV.init({
  appId: '',
  appKey: '',
  serverURL: ''
})

Page({
    data: {},
    testUploadFile() {
        testUploadFile().then(() => {
            swan.showToast({ title: '上传成功' })
        }).catch((err) => {
            console.error(err)
            swan.showToast({ title: '上传失败', icon: 'none' })
        })
    },
    async testLiveQuery() {
        swan.showLoading({ title: '测试中' })
        try {
            await testLiveQuery()
            swan.showToast({ title: 'LiveQuery ok' })
        } catch(err) {
            console.error(err)
            swan.showToast({ title: 'LiveQuery error', icon: 'none' })
        } finally {
            swan.hideLoading()
        }
    }
})

function chooseImage() {
    return new Promise((resolve, reject) => {
        swan.chooseImage({
            success: resolve,
            fail: reject
        });
    })
}

async function testUploadFile() {
    const image = await chooseImage()
    const path = image.tempFilePaths[0]
    swan.showLoading({ title: '上传中' })
    const file = new AV.File('test-baidu-upload.jpg', {
        blob: { uri: path }
    })
    try {
        await file.save()
        file.destroy()
    } finally {
        swan.hideLoading()
    }
}

async function testLiveQuery() {
    const test = new AV.Object('Test')
    test.set('str', 'test baidu adapters')
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
