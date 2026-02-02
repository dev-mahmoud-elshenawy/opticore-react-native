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
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Performance Test Script for State Management Core
 * Uses stand-alone execution to verify performance requirements.
 */
var BaseStore_1 = require("../src/state/BaseStore");
var StateObserver_1 = require("../src/state/StateObserver");
function runPerformanceTests() {
    return __awaiter(this, void 0, void 0, function () {
        var observer, perfStore, updateCount, unsubscribe, start, i, end, duration, avg, largeStore, items, startLarge, endLarge, state;
        return __generator(this, function (_a) {
            console.log('🚀 Starting Performance Tests...\n');
            // T037: 1000 state updates with StateObserver
            console.log('🔹 T037: Testing Observer Throughput (1000 updates)');
            observer = StateObserver_1.StateObserver.getInstance();
            perfStore = (0, BaseStore_1.createBaseStore)({
                name: 'perf-store',
                initialState: { count: 0, inc: function () { } },
                devtools: false
            }, function (set) { return ({
                inc: function () { return set(function (state) { state.count += 1; }); }
            }); });
            updateCount = 0;
            unsubscribe = observer.subscribe(perfStore, function () {
                updateCount++;
            });
            start = performance.now();
            for (i = 0; i < 1000; i++) {
                perfStore.getState().inc();
            }
            end = performance.now();
            duration = end - start;
            avg = duration / 1000;
            console.log("   Total Time: ".concat(duration.toFixed(2), "ms"));
            console.log("   Avg per update: ".concat(avg.toFixed(4), "ms"));
            console.log("   Target: < 10ms per update");
            if (avg < 10) {
                console.log('   ✅ PASS: Throughput requirement met');
            }
            else {
                console.error('   ❌ FAIL: Too slow');
            }
            unsubscribe();
            console.log('');
            // T038: Store with 10,000 items (Memory/Responsiveness)
            console.log('🔹 T038: Large Dataset Test (10,000 items)');
            largeStore = (0, BaseStore_1.createBaseStore)({
                name: 'large-store',
                initialState: { items: [], addBatch: function () { } },
                devtools: false
            }, function (set) { return ({
                addBatch: function (newItems) { return set(function (state) {
                    var _a;
                    (_a = state.items).push.apply(_a, newItems);
                }); }
            }); });
            items = Array.from({ length: 10000 }, function (_, i) { return ({
                id: "item-".concat(i),
                val: i,
                payload: 'x'.repeat(100)
            }); });
            startLarge = performance.now();
            largeStore.getState().addBatch(items);
            endLarge = performance.now();
            console.log("   Batch add 10k items: ".concat((endLarge - startLarge).toFixed(2), "ms"));
            state = largeStore.getState();
            if (state.items.length === 10000) {
                console.log('   ✅ PASS: 10,000 items handled successfully');
            }
            else {
                console.log('   ❌ FAIL: Item count mismatch');
            }
            return [2 /*return*/];
        });
    });
}
runPerformanceTests().catch(console.error);
