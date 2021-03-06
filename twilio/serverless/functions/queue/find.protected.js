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
    const queues = await twilioClient.queues.list();
    const seKeys = Object.keys(serverlessEvent);;
    const queue = seKeys.length > 0 ? queues.find(aQueue => {
      let result = true;

      for(const aKey of seKeys) {
        if(!(serverlessEvent[aKey] === aQueue[aKey])) {
          result = false;
          break;
        }
      }

      return result;
    }) : null;

    return queue;
  } catch (e) {
    throw e;
  }
}