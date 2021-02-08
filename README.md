# Twilio Scaling Landlines

This demo illustrates how you can use Twilio to scale landline phones.

## Prerequisite
Before you can get started you will need the following:

- [Twilio Project](https://www.twilio.com/try-twilio)
- [Twilio CLI](https://github.com/twilio/twilio-cli)
- [Twilio CLI Plugin: Serverless](https://github.com/twilio-labs/plugin-serverless)

## Setup Twilio

### Setup Phone Numbers

You will need to buy 2 Twilio Phone Numbers. One to represent the "public" phone number. The other as an outbound dialer. Here is [how to search for and buy a Twilio Phone Number.](https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console)

### Deploy Twilio Serverless Code

1. git clone this repo.
2. Navigate to the following directory:
`twilio/serverless/assets`.
3. Add your Outbound Dialer Phone Number in the `PhoneNumberPool.private.json`.
4. Add your "Public" Phone Number and Landline Number in the `StoreList.private.json`.
5. In the `twilio/serverless/` directory, rename .env.example to be .env.
5. In terminal navigate to the folder ./twilio/serverless and execute the following commands.
```sh
twilio serverless:deploy
```

### Deploy Twilio Studio

1. Import the following studio flow: 
`twilio/studio/Customer-Flow`.

2. Modify the **all** Run Function widgets to reflect the Twilio Serverless URLs.