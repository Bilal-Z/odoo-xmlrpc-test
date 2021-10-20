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
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var xmlrpc_1 = __importDefault(require("xmlrpc"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const client = xmlrpc.createSecureClient('https://demo.odoo.com/start');
// client.methodCall('start', [], function (error, value) {
// 	console.log(value);
// });
var host = process.env.HOST;
var db = process.env.DB;
var username = process.env.USERNAME;
var apikey = process.env.API_KEY;
var headers = {
    'User-Agent': 'NodeJS XML-RPC Client',
    'Content-Type': 'text/xml',
    Accept: 'text/xml',
    'Accept-Charset': 'UTF8',
    Connection: 'Keep-Alive',
};
var common = xmlrpc_1.default.createSecureClient({
    host: host,
    path: '/xmlrpc/2/common',
    headers: headers,
});
function getServerVersion() {
    return new Promise(function (resolve, reject) {
        common.methodCall('version', [], function (error, value) {
            if (value) {
                return resolve(value);
            }
            console.error(error);
            reject(error);
        });
    });
}
function authenticate() {
    return new Promise(function (resolve, reject) {
        common.methodCall('authenticate', [db, username, apikey, []], function (error, value) {
            if (value) {
                return resolve(value);
            }
            console.error(error);
            reject(error);
        });
    });
}
var models = xmlrpc_1.default.createSecureClient({
    host: host,
    path: '/xmlrpc/2/object',
    headers: headers,
});
function getProducts(uid, options, filter) {
    return new Promise(function (resolve, reject) {
        models.methodCall('execute_kw', [db, uid, apikey, 'product.product', 'search_read', [[filter]], options], function (error, value) {
            if (value) {
                return resolve(value);
            }
            console.error(error);
            reject(error);
        });
    });
}
function getSingleProduct(uid, options, filter) {
    return new Promise(function (resolve, reject) {
        models.methodCall('execute_kw', [db, uid, apikey, 'product.product', 'search_read', [[filter]], options], function (error, value) {
            if (value) {
                return resolve(value[0]);
            }
            console.error(error);
            reject(error);
        });
    });
}
function updateProductQuantity(uid, prodId, tmplId, newQty) {
    var pushNewQty = new Promise(function (resolve, reject) {
        models.methodCall('execute_kw', [
            db,
            uid,
            apikey,
            'stock.change.product.qty',
            'create',
            [
                {
                    product_id: prodId,
                    new_quantity: newQty,
                    product_tmpl_id: tmplId,
                },
            ],
        ], function (error, value) {
            if (value) {
                console.log(value);
                return resolve(value);
            }
            console.error(error);
            reject(error);
        });
    });
    return new Promise(function (resolve, reject) {
        models.methodCall('execute_kw', [
            db,
            uid,
            apikey,
            'stock.change.product.qty',
            'change_product_qty',
            [[pushNewQty]],
            {
                context: {
                    active_id: prodId,
                    active_ids: [prodId],
                    active_model: 'product.template',
                    allowed_company_ids: [1],
                    default_product_id: prodId,
                    default_product_tmpl_id: prodId,
                    default_type: 'product',
                    uid: uid,
                },
            },
        ], function (error, value) {
            if (value) {
                return resolve(value);
            }
            console.error(error);
            reject(error);
        });
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var uid, product, update;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, authenticate()];
                case 1:
                    uid = _a.sent();
                    return [4 /*yield*/, getSingleProduct(uid, { fields: ['name', 'qty_available', 'product_tmpl_id'] }, ['name', '=', 'Test product'])];
                case 2:
                    product = _a.sent();
                    return [4 /*yield*/, updateProductQuantity(uid, product.id, product.product_tmpl_id[0], 11)];
                case 3:
                    update = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
test();
// ['id', '=', 343]
