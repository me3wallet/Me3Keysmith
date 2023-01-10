"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var lodash_1 = __importDefault(require("lodash"));
var url_1 = __importDefault(require("url"));
var stream_1 = require("stream");
var googleapis_1 = require("googleapis");
var SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
];
var Google = (function () {
    function Google(clientId, clientSecret, redirectUrls) {
        this._redirectUrl = redirectUrls[0];
        this._auth = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, this._redirectUrl);
        googleapis_1.google.options({ auth: this._auth });
        this._drive = googleapis_1.google.drive({ version: 'v3' });
    }
    Google.prototype.generateAuthUrl = function () {
        return this._auth.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
    };
    Google.prototype.getTokens = function (redirectUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var code, query, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        code = redirectUrl;
                        if (lodash_1["default"].startsWith(redirectUrl, 'https://') ||
                            lodash_1["default"].startsWith(redirectUrl, 'http://')) {
                            if (!lodash_1["default"].startsWith(redirectUrl, this._redirectUrl))
                                return [2, false];
                            query = url_1["default"].parse(redirectUrl, true).query;
                            code = lodash_1["default"].get(query, 'code');
                        }
                        if (lodash_1["default"].isEmpty(code))
                            return [2, false];
                        return [4, this._auth.getToken(code)];
                    case 1:
                        tokens = (_a.sent()).tokens;
                        console.log(tokens);
                        this._auth.setCredentials(tokens);
                        return [2, true];
                }
            });
        });
    };
    Google.prototype.getUserEmail = function () {
        return __awaiter(this, void 0, void 0, function () {
            var googleAuth, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        googleAuth = googleapis_1.google.oauth2({ version: 'v2' });
                        return [4, googleAuth.userinfo.get()];
                    case 1:
                        data = (_a.sent()).data;
                        return [2, data.email];
                }
            });
        });
    };
    Google.prototype.saveFiles = function (body, fileName, mimeType) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._drive.files.create({
                            requestBody: {
                                name: fileName
                            },
                            media: {
                                mimeType: mimeType,
                                body: body
                            },
                            fields: 'id'
                        })];
                    case 1:
                        file = _a.sent();
                        return [2, file.data.id];
                }
            });
        });
    };
    Google.prototype.loadFile = function (fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._drive.files.get({
                            fileId: fileId,
                            alt: 'media'
                        })];
                    case 1:
                        file = _a.sent();
                        return [2, file.data];
                }
            });
        });
    };
    Google.prototype.b642Readable = function (base64) {
        return stream_1.Readable.from(Buffer.from(base64, 'base64'));
    };
    Google.prototype.str2Readable = function (str) {
        return stream_1.Readable.from(str, { encoding: 'utf8' });
    };
    return Google;
}());
exports["default"] = Google;
//# sourceMappingURL=google.js.map