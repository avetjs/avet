"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const avet_1 = require("avet");
const fs_1 = require("fs");
/**
 * Util Api Service
 */
class Util extends avet_1.Service {
    async getRandomUserAgent() {
        return new Promise((resolve, reject) => {
            const { userAgentFile } = this.ctx.app.config;
            const ws = fs_1.createReadStream(userAgentFile);
            const ret = [];
            ws.on('data', data => {
                ret.push(data);
            });
            ws.on('end', () => {
                resolve(ret);
            });
            ws.on('error', reject);
        });
    }
    getRandomOne(arr) {
        if (!arr)
            return null;
        const len = arr.length;
        const idx = Math.floor(Math.random() * len);
        return arr[idx];
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQXNDO0FBRXRDOztHQUVHO0FBQ0gsVUFBVyxTQUFRLGNBQU87SUFDeEIsS0FBSyxDQUFDLGtCQUFrQjtRQUN0QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUM5QyxNQUFNLEVBQUUsR0FBRyxxQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFFZixFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsR0FBRztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBRUQsa0JBQWUsSUFBSSxDQUFDIn0=