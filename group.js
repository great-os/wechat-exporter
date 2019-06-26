#!/usr/bin/env node

const { Wechaty } = require('wechaty'); // import { Wechaty } from 'wechaty'
const QrcodeTerminal = require('qrcode-terminal');

const fun = async (groupName) => {
  const bot = Wechaty.instance({
    profile: 'business',
  });
  await bot.start();
  await new Promise((resolve) => {
    bot
      .on('scan', (url) => {
        const loginUrl = url.replace('qrcode', 'l');
        QrcodeTerminal.generate(loginUrl);
        // eslint-disable-next-line no-console
        console.log(url);
      })
      .on('login', (user) => {
        // eslint-disable-next-line no-console
        console.log(`User ${user} logined`);
        resolve();
      });
  });
  const roomList = await new Promise(async (resolve) => {
    let tmpRoomList = await bot.Room.findAll();
    await new Promise((loopResolve) => {
      setTimeout(loopResolve, 1000);
    });
    tmpRoomList = await bot.Room.findAll();
    resolve(tmpRoomList);
  });
  const memberList = await new Promise(async (resolve) => {
    for (let i = 0; i < roomList.length; i += 1) {
      if (roomList[i].payload.topic.indexOf(groupName) >= 0) {
        resolve(roomList[i].memberList());
      }
    }
  });
  for (let i = 0; i < memberList.length; i += 1) {
    if (memberList[i] && memberList[i].payload) {
      if (memberList[i].payload.alias) {
        // eslint-disable-next-line no-console
        console.log(memberList[i].payload.alias);
      } else {
        // eslint-disable-next-line no-console
        console.log(memberList[i].payload.name);
      }
    }
  }
  process.exit(0);
};

const doit = async (groupName) => {
  await fun(groupName);
};

const groupName = process.argv[2];

doit(groupName);
