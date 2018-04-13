# nqueue 
Simple processing queue for nodejs

## Quick start

```
$ npm i --save @ivoglent/nqueue
```

## Usage

Example code : 

```typescript
import {expect} from 'chai';
import 'mocha';
import {queue} from "../src/queue";
import {QueueItemInterface} from "../src/queue.interface";
describe('Test internal queue', () => {
    it('Test enqueue with handler timeout', (done) => {
        queue.clearItems().setNumberOfExecution(2);
        queue.setHander(
            {
                execute: function (item: QueueItemInterface): Promise<boolean> {
                    return new Promise((resolve => {
                        console.log('Test handler. Executing item after 10s:', item);
                        setTimeout(function () {
                            resolve(true);
                        }, 2000);
                    }));
                }
            }
        );
        queue.push([1, 2, 3]);
        expect(queue.getItems().length).to.be.equal(1);
        setTimeout(function () {
            expect(queue.getItems().length).to.be.equal(0);
            done();
            process.exit(0);
        }, 3000);
    });
});


```
