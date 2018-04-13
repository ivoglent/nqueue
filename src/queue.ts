import {QueueHandlerInterface, QueueInterface, QueueItemInterface} from "./queue.interface";
import {EventEmitter} from "events";

const async = require('async');

export class Queue implements QueueInterface{
    /**
     * Main stack which stored all queue items
     * @type {QueueItemInterface[]}
     * @private
     */
    _stack: QueueItemInterface[] = [];
    /**
     * Maximun of items each time
     * @type {number}
     * @private
     */
    _numberOfExecution: number = 5;

    /**
     * Execute handler
     * @type {QueueHandlerInterface}
     */
    _handler: QueueHandlerInterface = void(0) ;

    /**
     * Running status
     * @type {boolean}
     * @private
     */
    _current: number = 0;

    /**
     * Internal event handle
     * @type {EventEmitter}
     */
    _internalEvent: EventEmitter;


    /**
     * Lock queue processing
     *
     * @type {boolean}
     * @private
     */
    _locked : boolean = false;

    /**
     * Constructor
     *
     */
    constructor() {
        this._internalEvent = new  EventEmitter();
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
    public setHander(callable: QueueHandlerInterface) {
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
    public setNumberOfExecution(max: number) {
        this._numberOfExecution = max;
        return this;
    }

    /**
     *
     * @returns {QueueItemInterface[]}
     */
    getItems() : QueueItemInterface[] {
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
    public push(item? : QueueItemInterface) {
        let self = this;
        if (Array.isArray(item)) {
            item.forEach(function (i) {
                self._stack.push(i);
            });
        } else {
            this._stack.push(item);
        }
        this._internalEvent.emit('queued');
        return this;
    }

    /**
     * Check the stack of queue.
     * If it has enough queued items then run exec handle
     */
    private checkQueue() {
        if (this._locked === false && this._stack.length > 0  && this._current < this._numberOfExecution) {
            this._locked = true;
            console.log('Received new item');
            let items = [];
            let remainSlots = this._numberOfExecution - this._current;
            let max = this._stack.length >  remainSlots ? remainSlots : this._stack.length;
            for(let i = 0; i <  max; i++) {
                items.push(this._stack[i]);
            }
            this._stack.splice(0,  max);
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
    private execute(items: QueueItemInterface[]): Promise<any> {
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
                })
            }, function (error) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    resolve(true);
                }

            })
        }));
    }

}

export const queue = new Queue();
