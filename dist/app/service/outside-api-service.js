"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutsideApiService = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const crypto_helper_1 = require("egg-freelog-base/lib/crypto-helper");
let OutsideApiService = class OutsideApiService {
    thirdPartyInfo;
    ctx;
    /**
     * 根据code获取accessToken, 注意微信一般有调用次数限制.
     * @param code
     */
    async getWeChatAccessToken(code) {
        const { appid, secret } = this.thirdPartyInfo.weChat;
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${(0, crypto_helper_1.base64Decode)(secret)}&code=${code}&grant_type=authorization_code`;
        return this.ctx.app.curl(url).then(response => {
            return JSON.parse(response.data.toString());
        });
    }
    /**
     * 获取微信个人信息
     * https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Authorized_Interface_Calling_UnionID.html
     * @param token
     * @param openId
     */
    async getWeChatUserInfo(token, openId) {
        const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${token}&openid=${openId}`;
        return this.ctx.app.curl(url).then(response => {
            return JSON.parse(response.data.toString());
        });
    }
    /**
     * 发送运营活动事件
     * @param taskConfigCode
     * @param userId
     */
    async sendActivityEvent(taskConfigCode, userId) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.baseUrl}/client/v2/activities/task/records/complete4TaskConfigCode`, {
            method: 'post', contentType: 'json', data: {
                taskConfigCode, userId
            }
        }, egg_freelog_base_1.CurlResFormatEnum.Original).then(response => {
            if (response.status >= 400) {
                console.error(`运营活动调用失败,taskCode:${taskConfigCode}, userId:${userId}`);
            }
        });
    }
};
__decorate([
    (0, midway_1.config)(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "thirdPartyInfo", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "ctx", void 0);
OutsideApiService = __decorate([
    (0, midway_1.provide)()
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUErQztBQUMvQyx1REFBbUU7QUFDbkUsc0VBQWdFO0FBSWhFLElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBRzFCLGNBQWMsQ0FBTTtJQUdwQixHQUFHLENBQWlCO0lBRXBCOzs7T0FHRztJQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFZO1FBQ25DLE1BQU0sRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFDbkQsTUFBTSxHQUFHLEdBQUcsMkRBQTJELEtBQUssV0FBVyxJQUFBLDRCQUFZLEVBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxnQ0FBZ0MsQ0FBQztRQUN6SixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDMUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsTUFBYztRQUNqRCxNQUFNLEdBQUcsR0FBRyx1REFBdUQsS0FBSyxXQUFXLE1BQU0sRUFBRSxDQUFDO1FBQzVGLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBc0IsRUFBRSxNQUFjO1FBQzFELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLDREQUE0RCxFQUFFO1lBQ3BILE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQ3ZDLGNBQWMsRUFBRSxNQUFNO2FBQ3pCO1NBQ0osRUFBRSxvQ0FBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtnQkFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsY0FBYyxZQUFZLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDMUU7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBOUNHO0lBREMsSUFBQSxlQUFNLEdBQUU7O3lEQUNXO0FBR3BCO0lBREMsSUFBQSxlQUFNLEdBQUU7OzhDQUNXO0FBTlgsaUJBQWlCO0lBRDdCLElBQUEsZ0JBQU8sR0FBRTtHQUNHLGlCQUFpQixDQWlEN0I7QUFqRFksOENBQWlCIn0=