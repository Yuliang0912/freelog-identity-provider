import { IMessageService, ITageService, IUserService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
import headImageGenerator from '../../extend/head-image-generator';
export declare class UserInfoController {
    ctx: FreelogContext;
    userService: IUserService;
    messageService: IMessageService;
    tagService: ITageService;
    headImageGenerator: headImageGenerator;
    /**
     * 获取用户列表
     */
    index(): Promise<FreelogContext>;
    /**
     * 批量获取用户
     */
    list(): Promise<void>;
    /**
     * 获取当前登录用户信息
     */
    current(): Promise<void>;
    /**
     * 验证登录密码
     */
    verifyLoginPassword(): Promise<void>;
    /**
     * 注册用户
     */
    create(): Promise<void>;
    /**
     * 重置密码
     */
    resetPassword(): Promise<void>;
    /**
     * 修改密码
     */
    updatePassword(): Promise<void>;
    /**
     * 更新基础信息
     */
    updateUserInfo(): Promise<void>;
    /**
     * 上传头像
     */
    uploadHeadImg(): Promise<void>;
    /**
     * 绑定(换绑)手机号或邮箱
     */
    updateMobileOrEmail(): Promise<void>;
    /**
     * 查询用户详情
     */
    detail(): Promise<FreelogContext>;
    /**
     * 获取用户信息
     */
    show(): Promise<FreelogContext>;
    setUserTag(): Promise<void>;
    unsetUserTag(): Promise<void>;
    freeOrRecoverUserStatus(): Promise<FreelogContext>;
    checkHeadImage(): Promise<void>;
    /**
     * 生成头像并保存
     */
    _generateHeadImage(userId: number): Promise<void>;
}
