import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot('5103577026:AAEnbA3z4QQSEw3cxaKSy7Hf9kFWhxJ6ivQ', {polling: true});
import fs from 'fs'
import path from 'path'
import  fetch from 'node-fetch'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

bot.on('text', async(msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let users = await select('data')
    let admin = await select('admin')[0].userId
    let st = 'hom'
    if(users.length) st = (users.find(el => el.userId == chatId))?.steep
    if(text == '/start'){
        bot.sendMessage(chatId, "Assalomualekum siz bu bot orqali\nopenbudget.uz saytidagi loyhamizga sms orqali ovoz berishingiz mumkin").then(data => {
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
        } else {
            let obj = {
                userId: chatId,
                steep: 'home',
                phonenumber: null,
            }
            await insert('data',[obj])
        }
    }
    else if(text == '/admin' && chatId == admin){
        bot.sendMessage(admin, "Id raqamni kiriting")
        users.map(el => {
            if(el.userId == chatId){
                el.steep = 'admin'
            }
        })
        await insert('data', users);
    }
    else if (st == 'home'){
        let ress = await select('number')
        if(!/^(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/.test(text)){
            bot.sendMessage(chatId, "<b>Telefon raqamingizni to`gri kiriting </b>\n\n<i>Namuna 901234567</i>",{parse_mode:"HTML"})
        } else if (ress.includes(text)){
            bot.sendMessage(chatId, 'Bu raqam dan ovoz berib bo`lingan').then(data => {
                bot.sendMessage(chatId, "Boshqa telefon raqamni yuboring\n\n<i>Namuna: 991234567</i>",{parse_mode: 'HTML'})
            })
        }
        else {
            bot.sendMessage(chatId,"Iltimos bir oz kuting...")
            users.map(el => el.phonenumber = text)
            await insert('data', users);
            let res = await request(text);
            if(res?.token){
                users.map(el => {
                    if(el.userId == chatId){
                        el.steep = 'tel'
                        el.token = res.token
                    }
                })
                await insert('data', users);
                bot.deleteMessage(chatId, msg.message_id - 1)
                bot.sendMessage(chatId, text+' telefon raqamiga yuborilgan kodni kiriting')
            } 
            else {
                bot.sendMessage(chatId,"Bu raqamdan ovoz berib bo'lingan yoki ovoz berish uchun saytdan shahsiy kabinetingizga kirishingiz kerak").then( data => {
                    bot.sendMessage(chatId,"Boshqa telefon raqamni yuboring\n\n<i>Namuna: 991234567</i>",{parse_mode: 'HTML'})
                })
            }
        }   
    } else if (st == 'tel'){
        let ress = await select('number')
        const { phonenumber, token } = (await select('data')).find(el => el.userId == chatId)
        let res =  await req(phonenumber,text,token)
        if(res?.date){
            bot.sendMessage(chatId,"Kod noto`g`ri etiborli boling!!!\n\nQayta kiriting yoki /start tugmasini bosing")
        } else {
            bot.sendMessage(chatId, "Ovoz qabul qilindi ovoz berganingiz uchun rahmat").then(data => {
                bot.sendMessage(chatId,"Yana telefon raqam yuborishingiz mumkin\n\n<i>Namuna: 991234567</i>",{parse_mode: 'HTML'})
            })
            users.map(el => {
                if(el.userId == chatId){
                    el.steep = 'hom'
                }
            })
            await insert('data',users)
            ress.push(text)
            await insert('number', ress);
        }
    } else if (st == 'admin'){
        let res = await select('admin')
        res.map(el => el.id = text)
        await insert('admin', res)
        bot.sendMessage(admin, "ID O`zgardi")
        users.map(el => {
            if(el.userId == chatId){
                el.steep = 'home'
            }
        })
        await insert('data',users)
    } else {
        bot.sendMessage(chatId, "Sizni tushunmadim")
    }
});

const select = (fileName) =>  {
    let files = fs.readFileSync(path.join(process.cwd(), 'src', fileName+".json"), 'UTF-8')
    files = files ? JSON.parse(files): []
    return files
}

const insert = (fileName, data) => {
    let files = fs.writeFileSync(path.join(process.cwd(), 'src',fileName+".json"), JSON.stringify(data, null, 4))
    return true
}


const request = async(num) => {
    try {
        let id = (await select('admin'))[0].id 
        let obj = {
            "phone": "+998 "+num,
            "application": `${id}`
        }

        let data = await fetch('https://admin.openbudget.uz/api/v1/user/validate_phone/',{
            method: 'POST',
            headers:{
                'Content-Type':'Application/json'
            },
            body: JSON.stringify(obj)
        })

        return (await data.json())
	}catch(error) {
		return error.message
	}	
}

const req = async(num,kod, token) => {
    try {
        let id = (await select('admin'))[0].id 
        let obj = {
            "phone": "998"+num,
            "otp": `${kod}`,
            "token": `${token}`,
            "application": `${id}`
        }

        let data = await fetch('https://admin.openbudget.uz/api/v1/user/temp/vote/',{
            method: 'POST',
            headers:{
                'Content-Type':'Application/json'
            },
            body: JSON.stringify(obj)
        })

        return await data.json()
	}catch(error) {
		return error.message
	}	
}

