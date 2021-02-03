const fs = require('fs');

exports.handler = async (context, event, callback) => {
  try {
    const twilioClient = context.getTwilioClient();
    const result = await driver(context, event, twilioClient);
    return callback(null, result);
  } catch (e) {
    return callback(e);
  }
};

const driver = async (serverlessContext, serverlessEvent, twilioClient) => {
  try {
    // Load Asset
    const storeListPath = Runtime.getAssets()['/stores/list.json'].path;
    const storeList = JSON.parse(fs.readFileSync(storeListPath, 'utf-8'));
    const seKeys = Object.keys(serverlessEvent);
    const store = seKeys.length > 0 ? storeList.find((aStore) => {
      let result = true;

      for(const aKey of seKeys) {
        if(!(serverlessEvent[aKey] === aStore[aKey])) {
          result = false;
          break;
        }
      }

      return result;
    }) : null;

    return store;
  } catch (e) {
    throw e;
  }
}