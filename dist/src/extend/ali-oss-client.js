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
exports.aliOssClient = exports.AliOssClient = void 0;
const aliOss = require('ali-oss');
const midway_1 = require("midway");
let AliOssClient = class AliOssClient {
    constructor(config) {
        const wrapper = aliOss.Wrapper || aliOss;
        this.client = new wrapper(config);
    }
    /**
     * 复制对象
     * @param toObjectName
     * @param fromObjectName
     * @param options
     */
    copyObject(toObjectName, fromObjectName, options) {
        return this.client.copy(toObjectName, fromObjectName, options);
    }
    /**
     * 删除对象
     * @param objectName 对象名,存在路径就用/分隔
     */
    deleteObject(objectName) {
        return this.client.delete(objectName);
    }
    /**
     * 获取文件流
     * @param objectName 对象名,存在路径就用/分隔
     */
    getStream(objectName) {
        return this.client.getStream(objectName);
    }
    /**
     * 以buffer的形式写入文件
     * @param objectName 对象名,存在路径就用/分隔
     * @param fileBuffer 文件buffer
     * @param options
     */
    putBuffer(objectName, fileBuffer, options) {
        return this.client.put(objectName, fileBuffer, options);
    }
    /**
     * 以流的形式写入文件
     * @param objectName 对象名,存在路径就用/分隔
     * @param fileStream 文件流,一般指可读流
     * @param options
     */
    putStream(objectName, fileStream, options) {
        return this.client.putStream(objectName, fileStream, options);
    }
};
AliOssClient = __decorate([
    midway_1.scope(midway_1.ScopeEnum.Prototype),
    __metadata("design:paramtypes", [Object])
], AliOssClient);
exports.AliOssClient = AliOssClient;
function aliOssClient(_context) {
    return (config) => {
        return new AliOssClient(config);
    };
}
exports.aliOssClient = aliOssClient;
midway_1.providerWrapper([{
        id: 'aliOssClientFactory',
        provider: aliOssClient,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpLW9zcy1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2FsaS1vc3MtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUdsQyxtQ0FBOEU7QUFHOUUsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJQUtyQixZQUFZLE1BQWM7UUFDdEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxVQUFVLENBQUMsWUFBb0IsRUFBRSxjQUFzQixFQUFFLE9BQWdCO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsWUFBWSxDQUFDLFVBQWtCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxVQUFrQjtRQUN4QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQVMsQ0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQUUsT0FBZ0I7UUFDOUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQVMsQ0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQUUsT0FBZ0I7UUFDOUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FDSixDQUFBO0FBdkRZLFlBQVk7SUFEeEIsY0FBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDOztHQUNkLFlBQVksQ0F1RHhCO0FBdkRZLG9DQUFZO0FBeUR6QixTQUFnQixZQUFZLENBQUMsUUFBNkI7SUFDdEQsT0FBTyxDQUFDLE1BQWMsRUFBeUIsRUFBRTtRQUM3QyxPQUFPLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFKRCxvQ0FJQztBQUVELHdCQUFlLENBQUMsQ0FBQztRQUNiLEVBQUUsRUFBRSxxQkFBcUI7UUFDekIsUUFBUSxFQUFFLFlBQVk7S0FDekIsQ0FBQyxDQUFDLENBQUMifQ==