import {controller, get, inject, post, provide, put} from "midway";
import {IMessageService, ITageService, IUserService, UserDetailInfo, UserInfo} from "../../interface";
import {
    FreelogContext, visitorIdentityValidator, CommonRegex, IdentityTypeEnum, ArgumentError, ApplicationError
} from "egg-freelog-base";
import headImageGenerator from "../../extend/head-image-generator";
import {isString, isArray, first, omit, isDate, pick} from 'lodash';
import {UserStatusEnum} from "../../enum";

@provide()
@controller('/v2/users')
export class UserInfoController {

    @inject()
    ctx: FreelogContext;
    @inject()
    userService: IUserService;
    @inject()
    messageService: IMessageService;
    @inject()
    tagService: ITageService;
    @inject()
    headImageGenerator: headImageGenerator;

    /**
     * 获取用户列表
     */
    @get('/')
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    async index() {

        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().value;
        const tagIds = ctx.checkQuery('tagIds').ignoreParamWhenEmpty().isSplitNumber().toSplitArray().value;
        const keywords = ctx.checkQuery('keywords').ignoreParamWhenEmpty().trim().value;
        const startRegisteredDate = ctx.checkQuery('startRegisteredDate').ignoreParamWhenEmpty().toDate().value;
        const endRegisteredDate = ctx.checkQuery('endRegisteredDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams().validateOfficialAuditAccount();

        const condition: any = {};
        if (CommonRegex.mobile86.test(keywords)) {
            condition.mobile = keywords;
        } else if (CommonRegex.email.test(keywords)) {
            condition.email = keywords;
        } else if (isString(keywords) && CommonRegex.username.test(keywords)) {
            condition.username = keywords;
        } else if (/^[0-9]{5,12}$/.test(keywords)) {
            condition.userId = parseInt(keywords);
        } else if (isString(keywords)) {
            return ctx.success({skip, limit, totalItem: 0, dataList: []});
        }

        if (isDate(startRegisteredDate) && isDate(endRegisteredDate)) {
            condition.createDate = {$gte: startRegisteredDate, $lte: endRegisteredDate};
        } else if (isDate(startRegisteredDate)) {
            condition.createDate = {$gte: startRegisteredDate};
        } else if (isDate(endRegisteredDate)) {
            condition.createDate = {$lte: endRegisteredDate};
        }

        const pageResult = await this.userService.searchIntervalListByTags(condition, tagIds?.map(x => parseInt(x)), {
            skip, limit, sort: sort ?? {userId: -1}
        });

        const tagMap = await this.tagService.find({status: 0}).then(list => {
            return new Map(list.map(x => [x.tagId.toString(), pick(x, ['tagId', 'tag'])]));
        })

        const list = [];
        for (const user of pageResult.dataList) {
            if (isArray(user?.userDetails) && user.userDetails.length) {
                const userDetail: UserDetailInfo = first(user.userDetails);
                user.tags = userDetail.tagIds.filter(x => tagMap.has(x.toString())).map(x => tagMap.get(x.toString()));
                user.latestLoginIp = userDetail.latestLoginIp ?? '';
                user.latestLoginDate = userDetail.latestLoginDate ?? null;
            } else {
                user.tags = [];
                user.latestLoginIp = '';
                user.latestLoginDate = null;
            }
            list.push(omit(user, ['_id', 'password', 'salt', 'updateDate', 'userDetails', 'tokenSn']))
        }
        pageResult.dataList = list;
        return ctx.success(pageResult);
    }

    /**
     * 批量获取用户
     */
    @get('/list')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async list() {

        const {ctx} = this;
        const userIds = ctx.checkQuery('userIds').exist().isSplitUserIds().toSplitArray().len(1, 200).value;
        const projection = ctx.checkQuery('projection').ignoreParamWhenEmpty().toSplitArray().default([]).value
        ctx.validateParams();

        await this.userService.find({userId: {$in: userIds}}, {projection: projection?.join(' ')}).then(ctx.success);
    }

    /**
     * 获取当前登录用户信息
     */
    @get('/current')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async current() {
        const {ctx} = this;
        await this.userService.findOne({userId: ctx.userId}).then(ctx.success);
    }

    // /**
    //  * 获取用户详情
    //  */
    // @get('/search')
    // @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser | IdentityTypeEnum.UnLoginUser)
    // async searchOne() {
    //     //手机号,邮箱
    //     const {ctx} = this;
    //     const keywords = ctx.checkQuery('keywords').exist().value
    //     ctx.validateParams();
    //
    //     const condition: any = {};
    //     if (ctx.helper.commonRegex.mobile86.test(keywords)) {
    //         condition.mobile = new RegExp(`^${keywords}$`, 'i')
    //     } else if (ctx.helper.commonRegex.email.test(keywords)) {
    //         condition.email = new RegExp(`^${keywords}$`, 'i')
    //     } else if (ctx.helper.commonRegex.username.test(keywords)) {
    //         condition.username = new RegExp(`^${keywords}$`, 'i')
    //     } else {
    //         throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'keywords'))
    //     }
    //     await this.userService.findOne(condition).then(ctx.success)
    // }

    /**
     * 注册用户
     */
    @post('/')
    async create() {

        const {ctx} = this;
        const loginName = ctx.checkBody('loginName').exist().notEmpty().value;
        const password = ctx.checkBody('password').exist().isLoginPassword(ctx.gettext('password_length') + ctx.gettext('password_include')).value;
        const username = ctx.checkBody('username').exist().isUsername().value;
        const authCode = ctx.checkBody('authCode').exist().toInt().value;
        ctx.validateParams();

        const model: Partial<UserInfo> = {};
        if (CommonRegex.mobile86.test(loginName)) {
            model.mobile = loginName;
        } else if (CommonRegex.email.test(loginName)) {
            model.email = loginName;
        } else {
            throw new ArgumentError(ctx.gettext('login-name-format-validate-failed'), {loginName})
        }

        const isVerify = await this.messageService.verify('register', loginName, authCode);
        if (!isVerify) {
            throw new ApplicationError(ctx.gettext('auth-code-validate-failed'));
        }

        const condition = {$or: [{username}, model.mobile ? {mobile: loginName} : {email: loginName}]}
        await this.userService.findOne(condition).then(data => {
            if (data && data.mobile === loginName) {
                throw new ArgumentError(ctx.gettext('mobile-register-validate-failed'))
            } else if (data && data.email === loginName) {
                throw new ArgumentError(ctx.gettext('email-register-validate-failed'))
            } else if (data) {
                throw new ArgumentError(ctx.gettext('username-register-validate-failed'))
            }
        })

        const userInfo = Object.assign({username, password}, model)
        const createdUserInfo = await this.userService.create(userInfo);
        ctx.success(createdUserInfo);

        try {
            await this._generateHeadImage()
        } catch (e) {
            console.log('用户头像创建失败', e.toString());
        }
    }

    /**
     * 重置密码
     */
    @put('/:loginName/resetPassword')
    async resetPassword() {

        const {ctx} = this;
        const loginName = ctx.checkParams('loginName').exist().notEmpty().trim().value;
        const password = ctx.checkBody('password').exist().isLoginPassword(ctx.gettext('password_length') + ctx.gettext('password_include')).value;
        const authCode = ctx.checkBody('authCode').exist().toInt().value;
        ctx.validateParams()

        const condition: Partial<UserInfo> = {};
        if (CommonRegex.mobile86.test(loginName)) {
            condition.mobile = loginName;
        } else if (CommonRegex.email.test(loginName)) {
            condition.email = loginName;
        } else {
            throw new ArgumentError(ctx.gettext('login-name-format-validate-failed'));
        }

        const userInfo = await this.userService.findOne(condition);
        if (!userInfo) {
            throw new ApplicationError(ctx.gettext('user-entity-not-found'));
        }
        const isVerify = await this.messageService.verify('resetPassword', loginName, authCode);
        if (!isVerify) {
            throw new ApplicationError(ctx.gettext('auth-code-validate-failed'));
        }

        await this.userService.resetPassword(userInfo, password).then(ctx.success);
    }

    /**
     * 修改密码
     */
    @put('/current/updatePassword')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async updatePassword() {

        const {ctx} = this;
        const oldPassword = ctx.checkBody('oldPassword').exist().notBlank().trim().len(6, 50).value
        const newPassword = ctx.checkBody('newPassword').exist().isLoginPassword(ctx.gettext('password_length') + ctx.gettext('password_include')).value
        ctx.validateParams();

        const userId = ctx.userId;
        const userInfo = await this.userService.findOne({userId});
        ctx.entityNullObjectCheck(userInfo, {msg: ctx.gettext('login-name-or-password-validate-failed')});

        await this.userService.updatePassword(userInfo, oldPassword, newPassword).then(ctx.success);

    }

    /**
     * 上传头像
     */
    @post('/current/uploadHeadImg')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async uploadHeadImg() {

        const {ctx} = this;
        const fileStream = await ctx.getFileStream()
        if (!fileStream || !fileStream.filename) {
            throw new ApplicationError('Can\'t found upload file');
        }
        ctx.validateParams()

        const fileObjectKey = `headImage/${ctx.userId}`;
        const {mime, fileBuffer} = await this.headImageGenerator.checkHeadImage(ctx, fileStream);
        await this.headImageGenerator.ossClient.putBuffer(fileObjectKey, fileBuffer as any, {headers: {'Content-Type': mime}}).catch(error => {
            throw new ApplicationError('头像上传错误')
        });

        const headImageUrl = `https://image.freelog.com/${fileObjectKey}`
        await this.userService.updateOne({userId: ctx.userId}, {headImage: headImageUrl}).then(() => {
            ctx.success(`${headImageUrl}?x-oss-process=style/head-image`)
        })
    }

    /**
     * 获取用户信息
     */
    @get('/:userIdOrMobileOrUsername')
    async show() {

        const {ctx} = this;
        const userIdOrMobileOrUsername = ctx.checkParams('userIdOrMobileOrUsername').exist().trim().value;
        ctx.validateParams();

        const condition: any = {};
        if (CommonRegex.mobile86.test(userIdOrMobileOrUsername)) {
            condition.mobile = userIdOrMobileOrUsername;
        } else if (CommonRegex.userId.test(userIdOrMobileOrUsername)) {
            condition.userId = parseInt(userIdOrMobileOrUsername);
        } else if (CommonRegex.username.test(userIdOrMobileOrUsername)) {
            condition.username = userIdOrMobileOrUsername;
        } else if (CommonRegex.email.test(userIdOrMobileOrUsername)) {
            condition.email = userIdOrMobileOrUsername;
        } else {
            return ctx.success(null);
        }

        await this.userService.findOne(condition).then(ctx.success);
    }

    @put('/:userId/setTag')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async setUserTag() {
        const {ctx} = this;
        const userId = ctx.checkParams('userId').exist().toInt().gt(10000).value;
        const tagId = ctx.checkBody("tagId").exist().toInt().gt(0).value;
        ctx.validateParams().validateOfficialAuditAccount();

        const tagInfo = await this.tagService.findOne({_id: tagId, status: 0})
        ctx.entityNullObjectCheck(tagInfo);

        const userInfo = await this.userService.findOne({userId});
        ctx.entityNullObjectCheck(userInfo);

        await this.userService.setTag(userId, tagInfo).then(ctx.success);
    }

    @put('/:userId/unsetTag')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async unsetUserTag() {
        const {ctx} = this;
        const userId = ctx.checkParams('userId').exist().toInt().gt(10000).value;
        const tagId = ctx.checkBody("tagId").exist().toInt().gt(0).value;
        ctx.validateParams().validateOfficialAuditAccount();

        const tagInfo = await this.tagService.findOne({_id: tagId, status: 0})
        ctx.entityNullObjectCheck(tagInfo);

        const userInfo = await this.userService.findOne({userId});
        ctx.entityNullObjectCheck(userInfo);

        await this.userService.unsetTag(userId, tagInfo).then(ctx.success);
    }

    // 冻结或恢复用户
    @put('/:userId/freeOrRecoverUserStatus')
    async freeOrRecoverUserStatus() {

        const {ctx} = this;
        const userId = ctx.checkParams('userId').exist().toInt().gt(10000).value;
        const status = ctx.checkBody("status").exist().toInt().in([UserStatusEnum.Freeze, UserStatusEnum.Normal]).value;
        const remark = ctx.checkBody("remark").ignoreParamWhenEmpty().type('string').len(0, 500).default('').value;
        ctx.validateParams().validateOfficialAuditAccount();

        const userInfo = await this.userService.findOne({userId});
        ctx.entityNullObjectCheck(userInfo);

        if (userInfo.status === status) {
            return ctx.success(true);
        }

        const task1 = this.userService.updateOne({userId}, {status});
        const task2 = this.userService.updateOneUserDetail({userId}, {statusChangeRemark: status === UserStatusEnum.Normal ? '' : remark ?? ''});

        await Promise.all([task1, task2]).then(t => ctx.success(true));
    }

    /**
     * 生成头像并保存
     */
    async _generateHeadImage() {
        const userId = this.ctx.userId;
        const headImageUrl = await this.headImageGenerator.generateAndUploadHeadImage(userId.toString())
        await this.userService.updateOne({userId: userId}, {headImage: headImageUrl});
    }
}
