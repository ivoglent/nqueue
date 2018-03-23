import {expect} from 'chai';
import 'mocha';
import {queue} from "../src/queue";
import {QueueItemInterface} from "../src/queue.interface";
queue.setHander(
    {
        execute : function (item: QueueItemInterface): Promise<boolean> {
            return new Promise((resolve => {
                console.log('Test handler. Executing item:', item);
                resolve(true);
            }))
        }
    }
);
queue.start();
describe('Test internal queue', () => {
   it('Test enqueue', (done) => {
        queue.push([1,2,3,4,5,6,7,8,9,0]);
        queue.push([11,22,33,44]);
        for(let i = 0; i < 10; i++) {
            queue.push(i);
        }
        expect(queue.getItems().length).to.be.equal(0);
        done();
   });
});
