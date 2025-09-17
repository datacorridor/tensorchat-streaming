/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var TensorchatStreaming = /** @class */ (function () {
    function TensorchatStreaming(config) {
        this.throttleTimers = new Map();
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://api.tensorchat.ai';
        this.throttleMs = config.throttleMs || 50; // Default 50ms throttle
    }
    /**
     * Throttle function calls to prevent UI flooding
     */
    TensorchatStreaming.prototype.throttle = function (key, fn) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (this.throttleTimers.has(key)) {
            clearTimeout(this.throttleTimers.get(key));
        }
        var timeoutId = window.setTimeout(function () {
            fn.apply(void 0, args);
            _this.throttleTimers.delete(key);
        }, this.throttleMs);
        this.throttleTimers.set(key, timeoutId);
    };
    /**
     * Stream process tensors with real-time callbacks
     */
    TensorchatStreaming.prototype.streamProcess = function (request_1) {
        return __awaiter(this, arguments, void 0, function (request, callbacks) {
            var onStart, onProgress, onSearchProgress, onSearchComplete, onTensorChunk, onTensorComplete, onTensorError, onComplete, onError, response, reader, decoder, buffer, _a, done, value, lineEnd, line, data, error_1;
            var _b, _c;
            if (callbacks === void 0) { callbacks = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        onStart = callbacks.onStart, onProgress = callbacks.onProgress, onSearchProgress = callbacks.onSearchProgress, onSearchComplete = callbacks.onSearchComplete, onTensorChunk = callbacks.onTensorChunk, onTensorComplete = callbacks.onTensorComplete, onTensorError = callbacks.onTensorError, onComplete = callbacks.onComplete, onError = callbacks.onError;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/streamProcess"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'x-api-key': this.apiKey,
                                },
                                body: JSON.stringify(request),
                            })];
                    case 2:
                        response = _d.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        reader = (_b = response.body) === null || _b === void 0 ? void 0 : _b.getReader();
                        if (!reader) {
                            throw new Error('Response body is not readable');
                        }
                        decoder = new TextDecoder();
                        buffer = '';
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, , 7, 8]);
                        _d.label = 4;
                    case 4:
                        return [4 /*yield*/, reader.read()];
                    case 5:
                        _a = _d.sent(), done = _a.done, value = _a.value;
                        if (done)
                            return [3 /*break*/, 6];
                        buffer += decoder.decode(value, { stream: true });
                        // Process complete lines
                        while (buffer.includes('\n\n')) {
                            lineEnd = buffer.indexOf('\n\n');
                            line = buffer.slice(0, lineEnd);
                            buffer = buffer.slice(lineEnd + 2);
                            if (line.startsWith('data: ')) {
                                try {
                                    data = JSON.parse(line.slice(6));
                                    switch (data.type) {
                                        case 'start':
                                            console.log("\uD83D\uDE80 Starting ".concat(data.totalTensors, " tensors with ").concat(data.model));
                                            onStart === null || onStart === void 0 ? void 0 : onStart(data);
                                            break;
                                        case 'progress':
                                            console.log("\u23F3 Processing tensor ".concat(data.index, "..."));
                                            onProgress === null || onProgress === void 0 ? void 0 : onProgress(data);
                                            break;
                                        case 'search_progress':
                                            console.log("\uD83D\uDD0D Searching for tensor ".concat(data.index, "..."));
                                            onSearchProgress === null || onSearchProgress === void 0 ? void 0 : onSearchProgress(data);
                                            break;
                                        case 'search_complete':
                                            console.log("\u2705 Search completed for tensor ".concat(data.index));
                                            onSearchComplete === null || onSearchComplete === void 0 ? void 0 : onSearchComplete(data);
                                            break;
                                        case 'tensor_chunk':
                                            console.log("\uD83D\uDCDD Tensor ".concat(data.index, " chunk received"));
                                            // Throttle chunk updates to prevent UI flooding
                                            if (onTensorChunk && data.index !== undefined) {
                                                this.throttle("chunk-".concat(data.index), onTensorChunk, data);
                                            }
                                            break;
                                        case 'tensor_complete':
                                            console.log("\u2705 Tensor ".concat(data.index, " completed"));
                                            onTensorComplete === null || onTensorComplete === void 0 ? void 0 : onTensorComplete(data);
                                            break;
                                        case 'tensor_error':
                                            console.warn("\u274C Tensor ".concat(data.index, " failed: ").concat((_c = data.result) === null || _c === void 0 ? void 0 : _c.error));
                                            onTensorError === null || onTensorError === void 0 ? void 0 : onTensorError(data);
                                            break;
                                        case 'complete':
                                            console.log("\uD83C\uDF89 All tensors completed!");
                                            onComplete === null || onComplete === void 0 ? void 0 : onComplete(data);
                                            return [2 /*return*/];
                                        case 'error':
                                        case 'fatal_error':
                                            throw new Error(data.error || data.details || 'Streaming error');
                                    }
                                }
                                catch (parseError) {
                                    console.warn('Failed to parse streaming data:', line, parseError);
                                }
                            }
                        }
                        return [3 /*break*/, 4];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        reader.releaseLock();
                        return [7 /*endfinally*/];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _d.sent();
                        console.error('Streaming error:', error_1);
                        onError === null || onError === void 0 ? void 0 : onError(error_1 instanceof Error ? error_1 : new Error(String(error_1)));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process a single tensor (non-streaming)
     */
    TensorchatStreaming.prototype.processSingle = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl, "/process"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(this.apiKey),
                                'x-api-key': this.apiKey,
                            },
                            body: JSON.stringify(request),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    /**
     * Clean up any pending throttled calls
     */
    TensorchatStreaming.prototype.destroy = function () {
        this.throttleTimers.forEach(function (timerId) { return clearTimeout(timerId); });
        this.throttleTimers.clear();
    };
    return TensorchatStreaming;
}());

/**
 * Framework-agnostic Tensorchat streaming client manager
 * This replaces the React hook with a generic class-based approach
 */
var TensorchatStreamingManager = /** @class */ (function () {
    function TensorchatStreamingManager(config) {
        this.client = null;
        this.config = config;
        this.initialize();
    }
    TensorchatStreamingManager.prototype.initialize = function () {
        if (this.client) {
            this.client.destroy();
        }
        this.client = new TensorchatStreaming(this.config);
    };
    /**
     * Update configuration and reinitialize client
     */
    TensorchatStreamingManager.prototype.updateConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
        this.initialize();
    };
    /**
     * Stream process tensors with real-time callbacks
     */
    TensorchatStreamingManager.prototype.streamProcess = function (request_1) {
        return __awaiter(this, arguments, void 0, function (request, callbacks) {
            if (callbacks === void 0) { callbacks = {}; }
            return __generator(this, function (_a) {
                if (!this.client) {
                    throw new Error('Tensorchat client not initialized');
                }
                return [2 /*return*/, this.client.streamProcess(request, callbacks)];
            });
        });
    };
    /**
     * Process a single tensor (non-streaming)
     */
    TensorchatStreamingManager.prototype.processSingle = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.client) {
                    throw new Error('Tensorchat client not initialized');
                }
                return [2 /*return*/, this.client.processSingle(request)];
            });
        });
    };
    /**
     * Get the underlying client instance
     */
    TensorchatStreamingManager.prototype.getClient = function () {
        return this.client;
    };
    /**
     * Clean up resources
     */
    TensorchatStreamingManager.prototype.destroy = function () {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
    };
    return TensorchatStreamingManager;
}());
/**
 * Factory function for creating a Tensorchat streaming manager
 * @param config - Configuration for the Tensorchat client
 * @returns A new TensorchatStreamingManager instance
 */
function createTensorchatStreaming(config) {
    return new TensorchatStreamingManager(config);
}

export { TensorchatStreaming, TensorchatStreamingManager, createTensorchatStreaming };
