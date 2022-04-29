import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot('5103577026:AAEnbA3z4QQSEw3cxaKSy7Hf9kFWhxJ6ivQ', {polling: true});
import fs from 'fs'
import path from 'path'
import  fetch from 'node-fetch'

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let users = await select('data')
    let st = 'hom'
    if(users.length) st = (users.find(el => el.userId == chatId)).steep
    if(text == '/start'){
        bot.sendMessage(chatId, "Assalomualekum siz bu bot orqali\nopenbudged.uz da loyhagangizga sms orqali ovoz yig`ishingiz mumkin").then(data => {
            if(data) bot.sendMessage(chatId, "<b>Telefon raqamingizni yuboring</b>\n\n<i>Namuna 901234567</i>",{parse_mode:"HTML"})
        })

        let users = await select('data')
        if(users.length) {
            let user = users.find(el => el.userId == chatId)
            if (!user) {
                let obj = {
                    userId: chatId,
                    steep: 'home',
                    phonenumber: null,
                }
                users.push(obj)
                await insert('data',users)
            }
            else {
                users.map(el => {
                    if(el.userId == chatId){
                        el.steep = 'home'
                    }
                })
                await insert('data', users);
            }
        }else {
            let obj = {
                userId: chatId,
                steep: 'home',
                phonenumber: null,
            }
            await insert('data',[obj])
        }
    }else if (st == 'home'){
        if(!/^(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/.test(text)){
            bot.sendMessage(chatId, "<b>Telefon raqamingizni to`gri kiriting </b>\n\n<i>Namuna 901234567</i>",{parse_mode:"HTML"})
        }
        else {
            bot.sendMessage(chatId,"Iltimos bir oz kuting...")
            users.map(el => {
                if(el.userId == chatId){
                    el.steep = 'tel'
                }
            })
            await insert('data', users);
            let res = await request(text)
            console.log(res)
        }
    }
});

const select = (fileName) =>  {
    let files = fs.readFileSync(path.join(process.cwd(), fileName+".json"), 'UTF-8')
    files = files ? JSON.parse(files): []
    return files
}

const insert = (fileName, data) => {
    let files = fs.writeFileSync(path.join(process.cwd(), fileName+".json"), JSON.stringify(data, null, 4))
    return true
}

const request = async(num) => {
    try {
        // let obj = {
        //     "phone": "+998 (33) 206-03-98",
        //     "application": "113705"
        // }

        // let data = await fetch('https://admin.openbudget.uz/api/v1/user/validate_phone/',{
        //     method: 'POST',
        //     headers:{
        //         'Content-Type':'Application/json'
        //     },
        //     body: JSON.stringify(obj)
        // })

        // console.log(data)
        let response = await fetch("http://admin.openbudget.uz/api/v1/user/validate_phone/", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ru,en-US;q=0.9,en;q=0.8,uz;q=0.7,tg;q=0.6",
                "content-type": "application/json;charset=UTF-8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://openbudget.uz/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "X-Frame-Options":'DENY',
                "X-Content-Type-Options":"nosniff"
            },
            "body": `{\"phone\":\"+998 (33) 206-03-98\",\"application\":\"113705\"}`,
            "method": "POST"
            });
            console.log(response)

	}catch(error) {
        console.log(error)
		// return error.message
	}	
}

