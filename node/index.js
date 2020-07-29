const AV = require('leancloud-storage/live-query-core')
const adapters = require('@leancloud/platform-adapters-node')

AV.setAdapters(adapters)
AV.init({
  appId: '',
  appKey: '',
  serverURL: ''
})

testLiveQuery().then(() => {
  console.log('live query ok')
}).catch(err => {
  console.error('live query failed:', err)
})

async function testLiveQuery() {
  const test = new AV.Object('Test')
  test.set('str', 'test node adapters')
  await test.save()
  console.log('test object created, objectId=%s', test.id)

  const query = new AV.Query('Test')
  query.equalTo('objectId', test.id)

  const randStr = Math.random().toString().substring(2)
  console.log('generate random string:', randStr)

  const liveQuery = await query.subscribe()
  return new Promise((resolve, reject) => {
    liveQuery.on('update', obj => {
      const str = obj.get('str')
      console.log('test object updated, str=%s', str)
      if (str === randStr) {
        resolve()
      } else {
        reject()
      }
    })
    setTimeout(() => {
      test.destroy()
      console.log('destroy test object')
      reject()
    }, 3000)
    test.set('str', randStr)
    test.save()
  })
}
