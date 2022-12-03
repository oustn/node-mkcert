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
exports.__esModule = true;
var node_process_1 = require("node:process");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var node_forge_1 = require("node-forge");
var config_1 = require("@/config");
var fs_extra_1 = require("fs-extra");
var Cert = /** @class */ (function () {
    function Cert(installMode, uninstallMode, csrPath, pkcs12, ecdsa, client, certFile, keyFile, p12File) {
        this.installMode = installMode;
        this.uninstallMode = uninstallMode;
        this.csrPath = csrPath;
        this.pkcs12 = pkcs12;
        this.ecdsa = ecdsa;
        this.client = client;
        this.certFile = certFile;
        this.keyFile = keyFile;
        this.p12File = p12File;
        this.CAROOT = Cert.getCAROOT();
    }
    Object.defineProperty(Cert.prototype, "CARootFile", {
        get: function () {
            return node_path_1.posix.join(this.CAROOT, config_1.config.rootName);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cert.prototype, "CARootKeyFile", {
        get: function () {
            return node_path_1.posix.join(this.CAROOT, config_1.config.rootKeyName);
        },
        enumerable: false,
        configurable: true
    });
    Cert.prototype.run = function (hosts) {
        if (hosts === void 0) { hosts = []; }
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.CAROOT) {
                            throw new Error('ERROR: failed to find the default CA location, set one as the CAROOT env var');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, fs_extra_1.ensureDir)(this.CAROOT, 493)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new Error("ERROR: failed to create the CAROOT: ".concat(this.CAROOT));
                    case 4: return [4 /*yield*/, this.loadCA()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Cert.prototype.loadCA = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(0, fs_extra_1.existsSync)(this.CARootFile)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.newCA()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Cert.prototype.newCA = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keypair, e_2, cert, limitDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.generateKeyPair(true)];
                    case 1:
                        keypair = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        throw new Error('ERROR: failed to generate the CA keypair');
                    case 3:
                        cert = node_forge_1.pki.createCertificate();
                        cert.publicKey = keypair.publicKey;
                        cert.serialNumber = Cert.randomSerialNumber();
                        limitDate = Cert.getLimitDate();
                        cert.validity.notBefore = limitDate.notBefore;
                        cert.validity.notAfter = limitDate.notAfter;
                        cert.setSubject(Cert.caAttrs);
                        cert.setIssuer(Cert.caAttrs);
                        cert.setExtensions(Cert.caExtensions);
                        cert.sign(keypair.privateKey, node_forge_1.md.sha256.create());
                        return [4 /*yield*/, (0, fs_extra_1.writeFile)(this.CARootFile, node_forge_1.pki.certificateToPem(cert))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, (0, fs_extra_1.writeFile)(this.CARootKeyFile, node_forge_1.pki.privateKeyToPem(keypair.privateKey))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Cert.prototype.generateKeyPair = function (rootCA) {
        return __awaiter(this, void 0, void 0, function () {
            var bits;
            return __generator(this, function (_a) {
                if (this.ecdsa) {
                    throw new Error("ERROR: ECDSA is not supported yet, see: https://github.com/digitalbazaar/forge/pull/925");
                }
                bits = rootCA ? 3072 : 2048;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        node_forge_1.pki.rsa.generateKeyPair({ bits: bits, workers: 2 }, function (err, keypair) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(keypair);
                            }
                        });
                    })];
            });
        });
    };
    Cert.getCAROOT = function () {
        if (node_process_1.env && node_process_1.env.CAROOT) {
            return node_process_1.env.CAROOT;
        }
        var dir = '';
        switch (node_process_1.platform) {
            case 'win32':
                dir = node_process_1.env.LOCALAPPDATA || node_process_1.env.LocalAppData || '';
                break;
            case 'darwin': {
                var home = node_process_1.env.HOME || '';
                if (home) {
                    dir = node_path_1.posix.join(home, 'Library', 'Application Support');
                }
                break;
            }
            default: {
                var home = node_process_1.env.HOME || '';
                if (home) {
                    dir = node_path_1.posix.join(home, '.local', 'share');
                }
            }
        }
        if (!dir && node_process_1.env.XDG_DATA_HOME) {
            dir = node_process_1.env.XDG_DATA_HOME;
        }
        if (!dir) {
            dir = (0, node_os_1.homedir)();
        }
        return node_path_1.posix.join(dir, config_1.config.base);
    };
    Cert.randomSerialNumber = function () {
        return node_forge_1.util.bytesToHex(node_forge_1.random.getBytesSync(16));
    };
    Object.defineProperty(Cert, "userAndHostname", {
        get: function () {
            var user = (0, node_os_1.userInfo)().username || 'node-mkcert';
            var host = (0, node_os_1.hostname)() || 'node-mkcert.org';
            return "".concat(user, "@").concat(host);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cert, "caAttrs", {
        get: function () {
            return [
                {
                    name: 'commonName',
                    value: "node-mkcert ".concat(Cert.userAndHostname)
                },
                {
                    name: 'organizationName',
                    value: 'node-mkcert development CA'
                },
                {
                    shortName: 'OU',
                    value: Cert.userAndHostname
                }
            ];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cert, "caExtensions", {
        get: function () {
            return [
                {
                    name: 'basicConstraints',
                    cA: true
                },
                {
                    name: 'keyUsage',
                    keyCertSign: true,
                    digitalSignature: true,
                    nonRepudiation: true,
                    keyEncipherment: true,
                    dataEncipherment: true
                },
                {
                    name: 'extKeyUsage',
                    serverAuth: true,
                    clientAuth: true,
                    codeSigning: true,
                    emailProtection: true,
                    timeStamping: true
                },
                {
                    name: 'nsCertType',
                    client: true,
                    server: true,
                    email: true,
                    objsign: true,
                    sslCA: true,
                    emailCA: true,
                    objCA: true
                },
                {
                    name: 'subjectAltName',
                    altNames: [{
                            type: 6,
                            value: 'https://example.org/webid#me'
                        }, {
                            type: 7,
                            ip: '127.0.0.1'
                        }]
                },
                {
                    name: 'subjectKeyIdentifier'
                }
            ];
        },
        enumerable: false,
        configurable: true
    });
    Cert.getLimitDate = function (shortPeriod) {
        if (shortPeriod === void 0) { shortPeriod = false; }
        var oneDay = 1000 * 60 * 60 * 24;
        var minDate = oneDay * 20;
        var date = new Date();
        var year = date.getFullYear();
        var notBefore = shortPeriod ? new Date(date.getTime() - minDate)
            : new Date(new Date().setFullYear(year - 1));
        var notAfter = new Date((new Date()).setFullYear(year + (shortPeriod ? 1 : 10)));
        return {
            notBefore: notBefore,
            notAfter: notAfter
        };
    };
    return Cert;
}());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var cert;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cert = new Cert(false, false, '', false, false, false, '', '', '');
                return [4 /*yield*/, cert.run()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
