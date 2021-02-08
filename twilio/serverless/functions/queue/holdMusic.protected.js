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
    try {
      // Try to make an outbound call
      const call = await makeOutboundCall(serverlessContext, serverlessEvent, twilioClient);
      if(call) {
        console.log(`Outbound CallSid: ${call.sid}`);
      }
    } catch(e) {
      console.error(`An error has occur when making outbound call: \n${e}`);
    }

    // Hold music
    const twiml = await generateTwiml(serverlessContext, serverlessEvent, twilioClient);
    return twiml;
  } catch (e) {
    throw e;
  }
}

const generateTwiml = async(serverlessContext, serverlessEvent, twilioClient) => {
  try {
    const {HOLD_MUSIC_URL} = serverlessContext;
    const {QueueSid, QueuePosition} = serverlessEvent;

    // Fetch Queue Information.
    const queue = await twilioClient.queues(QueueSid).fetch();
    const {averageWaitTime} = queue;

    // Generate Twiml
    const message = `Your call is important to us, please hold. The average wait time is ${Math.ceil(averageWaitTime / 60)} minute. Your in ${numToOrdinal(QueuePosition)} place.`;
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say(message);
    twiml.play(HOLD_MUSIC_URL);
    return twiml;
  } catch(e) {
    throw e;
  }
}

/**
 * Generate an outbound call to the store using a Twilio Phone Number.
 * @param {*} serverlessContext 
 * @param {*} serverlessEvent 
 * @param {*} twilioClient 
 * @returns Object Call Object or Null
 */
const makeOutboundCall = async(serverlessContext, serverlessEvent, twilioClient) => {
  try {
    const {QueueSid, ToPhoneNumber} = serverlessEvent;
    const FromPhoneNumber = await getAvailablePhoneNumber(serverlessContext, serverlessEvent, twilioClient);
    
    let call = null;
    if(FromPhoneNumber) {
      // Fetch Queue Information.
      const queue = await twilioClient.queues(QueueSid).fetch();
      const {friendlyName} = queue;

      call = await twilioClient.calls
      .create({
        twiml: `<Response><Dial><Queue>${friendlyName}</Queue></Dial></Response>`,
        to: ToPhoneNumber,
        from: FromPhoneNumber
      });
      console.log(`Using ${FromPhoneNumber} to make an outbound call to ${ToPhoneNumber}`);
    } else {
      console.warn('Unable to make an outbound call due to lack available phone number.')
    }

    return call;
  } catch(e) {
    throw e;
  }
}

/**
 * Get available phone number from the number pool.
 * @param {*} serverlessContext 
 * @param {*} serverlessEvent 
 * @param {*} twilioClient 
 * @return String phone number.
 */
const getAvailablePhoneNumber = async(serverlessContext, serverlessEvent, twilioClient) => {
  try {
    const {BUFF_TIME_IN_MINS} = serverlessContext;
    const {ToPhoneNumber} = serverlessEvent;
    // Load Asset
    const phoneNumberPoolPath = Runtime.getAssets()['/PhoneNumberPool.json'].path;
    const phoneNumberPool = JSON.parse(fs.readFileSync(phoneNumberPoolPath, 'utf-8'));

    const activeCallStatus = ['queued', 'ringing', 'in-progress'];

    // Get Current Time.
    const currentTime = new Date(Date.now());

    // Current Time - Past Mins.
    currentTime.setMinutes(currentTime.getMinutes() - BUFF_TIME_IN_MINS);

    // Get All Calls in the Past Mins.
    const calls = await twilioClient.calls.list({
      startTimeAfter: currentTime,
      to: ToPhoneNumber
    });

    // Filter calls based on status
    const activeCalls = calls.filter(aCall => activeCallStatus.includes(aCall.status) && aCall.forwardedFrom === null);

    console.log(`In the past ${BUFF_TIME_IN_MINS} mins, there are ${activeCalls.length} active calls.\n`);

    // Get All Active Phone Numbers.
    const activePhoneNumbers = Array.from(new Set(activeCalls.map(aCall => aCall.from)));

    console.log(`activePhoneNumbers: ${activePhoneNumbers}\n`);

    // Get All Available Phone Numbers
    const availablePhoneNumbers = activePhoneNumbers.length > 0 ? 
      phoneNumberPool.filter(aPhoneNumber => !activePhoneNumbers.includes(aPhoneNumber)) : 
      phoneNumberPool;

    console.log(`availablePhoneNumbers: ${availablePhoneNumbers}\n`);

    // Selecting a random available phone number.
    const phoneNumber = availablePhoneNumbers[Math.floor(Math.random() * availablePhoneNumbers.length)];

    return phoneNumber;
  } catch(e) {
    throw e;
  }
}

/**
 * Credits to: @jibruno
 * Link: https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
 */
const numToOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n%100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}