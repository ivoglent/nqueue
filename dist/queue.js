"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const async = require('async');
class Queue {
    /**
     * Constructor
     *
     */
    constructor() {
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
        this._current = 0;
        /**
         * Lock queue processing
         *
         * @type {boolean}
         * @private
         */
        this._locked = false;
        this._internalEvent = new events_1.EventEmitter();
        let self = this;
        this._internalEvent.on('queued', function () {
            self.checkQueue();
        });
    }
    /**
     *
     * @param callable
     * @returns {QueueInterface}
     */
    setHander(callable) {
        if (typeof (callable) === 'object') {
            this._handler = callable;
        }
        return this;
    }
    /**
     *
     * @param {number} max
     * @returns {QueueInterface}
     */
    setNumberOfExecution(max) {
        this._numberOfExecution = max;
        return this;
    }
    /**
     *
     * @returns {QueueItemInterface[]}
     */
    getItems() {
        return this._stack;
    }
    /**
     *
     * @returns {this}
     */
    clearItems() {
        this._stack = [];
        this._current = 0;
        return this;
    }
    /**
     *
     * @param {QueueItemInterface} item
     * @returns {QueueInterface}
     */
    push(item) {
        let self = this;
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
    }
    /**
     * Check the stack of queue.
     * If it has enough queued items then run exec handle
     */
    checkQueue() {
        if (this._locked === false && this._stack.length > 0 && this._current < this._numberOfExecution) {
            this._locked = true;
            console.log('Received new item');
            let items = [];
            let remainSlots = this._numberOfExecution - this._current;
            let max = this._stack.length > remainSlots ? remainSlots : this._stack.length;
            for (let i = 0; i < max; i++) {
                items.push(this._stack[i]);
            }
            this._stack.splice(0, max);
            this._current += max;
            this.execute(items).then(function () {
            }, function (error) {
                console.log(error);
            });
            this._locked = false;
        }
    }
    /**
     *
     * @returns {Promise<any>}
     */
    execute(items) {
        let self = this;
        return new Promise(((resolve, reject) => {
            async.each(items, function (item, next) {
                self._handler.execute(item).then(function (result) {
                    self._current -= 1;
                    next();
                    self._internalEvent.emit('queued');
                }, function (error) {
                    console.log(error);
                    self._current -= 1;
                    next();
                    self._internalEvent.emit('queued');
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
    }
}
exports.Queue = Queue;
exports.queue = new Queue();
