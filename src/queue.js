"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var async = require('async');
var Queue = /** @class */ (function () {
    /**
     * Constructor
     *
     */
    function Queue() {
        /**
         * Main stack which stored all queue items
         * @type {QueueItemInterface[]}
         * @private
         */
        this._stack = [];
        /**
         * Maximun of items each time
         * @type {number}
         * @private
         */
        this._numberOfExecution = 5;
        /**
         * Execute handler
         * @type {QueueHandlerInterface}
         */
        this._handler = void (0);
        /**
         * Running status
         * @type {boolean}
         * @private
         */
        this._status = 0;
        /**
         *
         * @type {number}
         * @private
         */
        this._waitingInterval = 100;
        this._internalEvent = new events_1.EventEmitter();
        var self = this;
        this._internalEvent.on('queued', function () {
            self.checkQueue();
        });
    }
    /**
     *
     * @param callable
     * @returns {QueueInterface}
     */
    Queue.prototype.setHander = function (callable) {
        if (typeof (callable) === 'object') {
            this._handler = callable;
        }
        return this;
    };
    /**
     *
     * @param {number} max
     * @returns {QueueInterface}
     */
    Queue.prototype.setNumberOfExecution = function (max) {
        this._numberOfExecution = max;
        return this;
    };
    /**
     *
     * @returns {QueueItemInterface[]}
     */
    Queue.prototype.getItems = function () {
        return this._stack;
    };
    /**
     *
     * @param {QueueItemInterface} item
     * @returns {QueueInterface}
     */
    Queue.prototype.push = function (item) {
        var self = this;
        if (Array.isArray(item)) {
            item.forEach(function (i) {
                self._stack.push(i);
            });
        }
        else {
            this._stack.push(item);
        }
        this._internalEvent.emit('queued');
        return this;
    };
    /**
     * Check the stack of queue.
     * If it has enough queued items then run exec handle
     */
    Queue.prototype.checkQueue = function () {
        if (this._stack.length > 0 && this._status < this._numberOfExecution) {
            console.log('Received new item');
            var items = [];
            var remainSlots = this._numberOfExecution - this._status;
            var max = this._stack.length > remainSlots ? remainSlots : this._stack.length;
            for (var i = 0; i < max; i++) {
                items.push(this._stack[i]);
            }
            this._stack.splice(0, max);
            this._status -= max;
            this.execute(items).then(function () {
            }, function (error) {
                console.log(error);
            });
        }
    };
    /**
     *
     * @returns {Promise<any>}
     */
    Queue.prototype.execute = function (items) {
        var self = this;
        return new Promise((function (resolve, reject) {
            async.each(items, function (item, next) {
                self._handler.execute(item).then(function (result) {
                    self._status -= 1;
                    next();
                }, function (error) {
                    console.log(error);
                    self._status -= 1;
                    next();
                });
            }, function (error) {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else {
                    resolve(true);
                }
            });
        }));
    };
    /**
     *
     * @returns {QueueInterface}
     */
    Queue.prototype.start = function () {
        var self = this;
        setInterval(function (item) {
            self.checkQueue();
        }, this._waitingInterval);
        return this;
    };
    return Queue;
}());
exports.queue = new Queue();
