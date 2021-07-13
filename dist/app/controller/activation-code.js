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
exports.activationCodeController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
let activationCodeController = class activationCodeController {
    ctx;
    userService;
    activationCodeService;
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().emptyStringAsNothingness().value;
        const status = ctx.checkQuery('status').optional().toInt().value;
        const keywords = ctx.checkQuery('keywords').optional().emptyStringAsNothingness().trim().value;
        ctx.validateParams().validateOfficialAuditAccount();
        const condition = {};
        if ([0, 1, 2].includes(status)) {
            condition.status = status;
        }
        if (lodash_1.isString(keywords) && keywords.length) {
            condition.$or = [{ username: keywords }, { code: keywords }];
        }
        await this.activationCodeService.findIntervalList(condition, {
            skip, limit,
            sort: sort ?? { createDate: -1 }
        }).then(ctx.success);
    }
    async batchCreate() {
        const { ctx } = this;
        const createQuantity = ctx.checkBody('createQuantity').optional().toInt().gt(0).lt(51).default(10).value;
        const limitCount = ctx.checkBody('limitCount').exist().toInt().gt(0).value;
        const startEffectiveDate = ctx.checkBody('startEffectiveDate').optional().toDate().value;
        const endEffectiveDate = ctx.checkBody('endEffectiveDate').optional().toDate().value;
        ctx.validateParams().validateOfficialAuditAccount();
        await this.activationCodeService.batchCreate(createQuantity, {
            limitCount, startEffectiveDate, endEffectiveDate
        }).then(ctx.success);
    }
    async batchUpdate() {
        const { ctx } = this;
        const codes = ctx.checkBody('codes').exist().isArray().len(1, 100).value;
        const status = ctx.checkBody('status').exist().in([0, 1]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        await this.activationCodeService.batchUpdate(codes, status).then(ctx.success);
    }
    // 使用授权码激活测试资格
    async activateTestQualification() {
        const { ctx } = this;
        const code = ctx.checkBody('code').exist().type('string').len(8, 8).value;
        ctx.validateParams();
        const userInfo = await this.userService.findOne({ userId: ctx.userId });
        if ((userInfo.userType & 1) === 1) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('test-qualification-apply-refuse-error'));
        }
        await this.activationCodeService.activateAuthorizationCode(userInfo, code).then(ctx.success);
    }
    async usedRecords() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().value;
        const code = ctx.checkQuery('code').optional().emptyStringAsNothingness().type('string').len(8, 8).value;
        const keywords = ctx.checkQuery('keywords').optional().emptyStringAsNothingness().trim().value;
        ctx.validateParams();
        const condition = {};
        if (lodash_1.isString(keywords) && keywords.length) {
            condition.username = keywords.toString();
        }
        if (lodash_1.isString(code)) {
            condition.code = code;
        }
        await this.activationCodeService.findUsedRecordIntervalList(condition, {
            skip, limit, sort: sort ?? { createDate: -1 }
        }).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const code = ctx.checkParams('code').type('string').len(8, 8).value;
        ctx.validateParams();
        await this.activationCodeService.findOne({ code }).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], activationCodeController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], activationCodeController.prototype, "userService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], activationCodeController.prototype, "activationCodeService", void 0);
__decorate([
    midway_1.get('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "index", null);
__decorate([
    midway_1.post('/batchCreate'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "batchCreate", null);
__decorate([
    midway_1.put('/batchUpdate'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "batchUpdate", null);
__decorate([
    midway_1.post('/activate'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "activateTestQualification", null);
__decorate([
    midway_1.get('/usedRecords'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "usedRecords", null);
__decorate([
    midway_1.get('/:code'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], activationCodeController.prototype, "show", null);
activationCodeController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/testQualifications/beta/codes')
], activationCodeController);
exports.activationCodeController = activationCodeController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGlvbi1jb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2FjdGl2YXRpb24tY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUU7QUFDbkUsdURBQThHO0FBRTlHLG1DQUFnQztBQUloQyxJQUFhLHdCQUF3QixHQUFyQyxNQUFhLHdCQUF3QjtJQUdqQyxHQUFHLENBQWlCO0lBRXBCLFdBQVcsQ0FBZTtJQUUxQixxQkFBcUIsQ0FBeUI7SUFJOUMsS0FBSyxDQUFDLEtBQUs7UUFFUCxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekYsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNoRixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNqRSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FB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