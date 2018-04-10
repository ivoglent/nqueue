"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var queue_1 = require("../src/queue");
queue_1.queue.setHander({
    execute: function (item) {
        return new Promise((function (resolve) {
            console.log('Test handler. Executing item:', item);
            resolve(true);
        }));
    }
});
queue_1.queue.start();
describe('Test internal queue', function () {
    it('Test enqueue capacity', function (done) {
        queue_1.queue.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
        queue_1.queue.push([11, 22, 33, 44]);
        for (var i = 0; i < 10; i++) {
            queue_1.queue.push(i);
        }
        chai_1.expect(queue_1.queue.getItems().length).to.be.equal(0);
        done();
    });
    it('Test queue quota', function (done) {
        queue_1.queue.clearItems();
        queue_1.queue.setHander({
            execute: function (item) {
                return new Promise((function (resolve) {
                    console.log('Test handler. Executing item after 5s:', item);
                    setTimeout(function () {
                        resolve(true);
                    }, 5000);
                }));
            }
        });
        queue_1.queue.push([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        chai_1.expect(queue_1.queue.getItems().length).to.be.equal(4);
        done();
    });
});
