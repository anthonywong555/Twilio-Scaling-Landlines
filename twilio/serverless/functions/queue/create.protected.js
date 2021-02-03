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
    const queue = await twilioClient.queues.create(serverlessEvent);
    return queue;
  } catch (e) {
    throw e;
  }
}

