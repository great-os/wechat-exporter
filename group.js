#!/usr/bin/env node

const { Wechaty } = require('wechaty'); // import { Wechaty } from 'wechaty'
const QrcodeTerminal = require('qrcode-terminal');
const colors = require('colors/safe');

const outMemberList = (groups) => {
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    const memberList = group.users;
    // eslint-disable-next-line no-console
    console.log(colors.green(`Members of ${group.topic}`));
    for (let memberId = 0; memberId < memberList.length; memberId += 1) {
      const member = memberList[memberId];
      if (member && member.payload) {
        if (member.payload.alias) {
          // eslint-disable-next-line no-console
          console.log(member.payload.alias);
        } else {
          // eslint-disable-next-line no-console
          console.log(member.payload.name);
        }
      }
    }
  }
};

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
  const groupList = await new Promise(async (resolve) => {
    const listOfMemberList = [];
    for (let i = 0; i < roomList.length; i += 1) {
      if (roomList[i].payload.topic.indexOf(groupName) >= 0) {
        listOfMemberList.push({
          topic: roomList[i].payload.topic,
          // eslint-disable-next-line no-await-in-loop
          users: await roomList[i].memberList(),
        });
      }
    }
    resolve(listOfMemberList);
  });
  outMemberList(groupList);

  process.exit(0);
};

const doit = async (groupName) => {
  await fun(groupName);
};

const groupName = process.argv[2];

doit(groupName);
