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
    const queue = queues.find(aQueue => {
      let result = true;
      Object.keys(serverlessEvent).forEach((aKey) => {
        result = serverlessEvent[aKey] === aQueue[aKey];
      });

      return result;
    });

    return queue;
  } catch (e) {
    throw e;
  }
}