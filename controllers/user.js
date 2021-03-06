const jwt = require("jsonwebtoken"); // 用于签发、解析`token`
const {
    addSalt,
    comparePassword
} = require("./../lib/util/pwd"); //加盐加密，加盐加密比较
const model = require("../app/model");
const User = model.user; //引入user的model
const fs = require("fs");
class UserController {
    //登录
    static async login(ctx) {
        const {
            userName,
            password
        } = ctx.request.body;
        const userData = await User.findOne({
            where: {
                userName
            }
        });
        if (!userData) {
            return (ctx.body = {
                code: 1,
                message: "用户不存在"
            });
        }
        if (userData) {
            const isMatch = await comparePassword(password, userData.password);
            console.log(isMatch);
            if (isMatch) {
                const token = jwt.sign({
                        userName: userData.userName,
                        userId: userData.id
                    },
                    "jgchen", {
                        expiresIn: "24h"
                    }
                );
                ctx.body = {
                    code: 0,
                    token,
                    avatar: userData.avatar,
                    userName: userData.userName,
                    message: "登录成功"
                };
            } else {
                ctx.body = {
                    code: 1,
                    message: "用户名或者密码不正确"
                };
            }
        }
    }
    //注册
    static async register(ctx) {
        const {
            userName,
            password
        } = ctx.request.body;
        const checkData = await User.findOne({
            where: {
                userName
            }
        });
        if (checkData !== null) {
            return (ctx.body = {
                code: 1,
                message: "用户名已经存在"
            });
        }
        const saltPassword = await addSalt(password);
        const result = await User.create({
            userName,
            password: saltPassword
        });
        return result !== null ?
            (ctx.body = {
                code: 0,
                message: "注册成功"
            }) :
            (ctx.body = {
                code: 1,
                message: "注册失败"
            });
    }
    //获取个人信息
    static async getInfo(ctx) {
        const userId = ctx.state.user.userId;
        const userData = await User.findOne({
            where: {
                id: userId
            },
            attributes: ["userName", "introduction", "avatar"]
        });
        return (ctx.body = {
            code: 0,
            data: userData
        });
    }
    //修改个人头像
    static async editAvatar(ctx) {
        const id = ctx.state.user.userId;
        const file = ctx.request.files.avatar; // 获取上传文件
        const reader = fs.createReadStream(file.path); // 创建可读流
        const ext = file.name.split(".").pop(); // 获取上传文件扩展名
        const uploadUrl = `avatar/${Date.now()}.${ext}`;
        const upStream = fs.createWriteStream(`static/${uploadUrl}`); // 创建可写流
        reader.pipe(upStream); // 可读流通过管道写入可写流
        const avatarUrl = `/${uploadUrl}`;
        const data = await User.update({
            avatar: avatarUrl,
            fields: ["avatar"]
        }, {
            where: {
                id
            }
        });
        return ctx.body = {
            code: 0,
            data,
            avatar: avatarUrl
        };
    }
}
module.exports = UserController;