export interface QueueItemInterface{

}
export interface QueueHandlerInterface{
    execute(item: QueueItemInterface): Promise<boolean>;
}
export interface QueueInterface{
    /**
     *
     * @param {QueueHandlerInterface} handler
     * @returns {QueueInterface}
     */
    setHander(handler: QueueHandlerInterface): QueueInterface;

    /**
     *
     * @param {number} max
     * @returns {QueueInterface}
     */
    setNumberOfExecution(max: number): QueueInterface;

    /**
     *
     * @returns {QueueItemInterface[]}
     */
    getItems() : QueueItemInterface[];


    clearItems() : void;

    /**
     *
     * @param {QueueItemInterface} item
     * @returns {QueueInterface}
     */
    push(item: QueueItemInterface): QueueInterface;

    start(): any
}
