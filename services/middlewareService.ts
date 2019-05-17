
import { RedisClientTypes, SYSTEM_STATES } from 'database/enums/enums';
import { redis } from 'infra/redis/redis';
import { MessagingClient } from 'infra/messaging/messagingClient'


export module MiddlewareService {

    const redisClient = redis.getClient(RedisClientTypes.RABBIT_MIDDLEWARE_EXAMPLE);

    export let middlewareConsumer: any;


    export const subscribeToTransferQueueIfNeeded = async () => {
        let systemPaused = await redisClient.getAsync(SYSTEM_STATES.SYSTEM_PAUSED);
        if (systemPaused && systemPaused === 'true') {
            return;
        }
        await subscribeMiddleware();
    }

    const subscribeMiddleware = async () => {
        return await MessagingClient.subscribeMiddleware(transferMessage);
    }

    //subscribing to the manager always happen upon instantiation
    export const subscribeToMiddlewareManagerExchange = async () => {
        MessagingClient.subscribeMiddlewareManager(changeMiddlewareStatus)
    }

    export const pauseSystem = async () => {
        if (!middlewareConsumer) {
            console.log('Request for pauseSystem: No middlewareConsumer found to pause, exiting.');
            return;
        }
        let channel = await MessagingClient.getMqChannel();
        await channel.cancel(middlewareConsumer.consumerTag);
        await MessagingClient.cancelConsumer(middlewareConsumer.consumerTag);
        middlewareConsumer = undefined;
        await redisClient.setAsync(SYSTEM_STATES.SYSTEM_PAUSED, true);
        console.log('System paused, no longer listening to the transfer queue...');

    }

    export const resumeSystem = async () => {
        if (middlewareConsumer) {
            console.log('Request for resumeSystem: middlewareConsumer already exists, exiting.');
            return;
        }
        console.log('Subscribing to middleware transfer queue again...')
        await subscribeMiddleware();
        await redisClient.setAsync(SYSTEM_STATES.SYSTEM_PAUSED, false);
    }

    const transferMessage = (err, message) => {

        if (err) {
            return;
        }

        let queue = message.receipientChannel;
        console.log('transfering messsage to: ' + message.receipientChannel);
        MessagingClient.sendMessageToQueue(queue, message);
    }


    const changeMiddlewareStatus = async (err, message) => {

        if (err) {
            return;
        }

        let newStatus = message.commandType;

        switch (newStatus) {
            case SYSTEM_STATES.PAUSE_SYSTEM: {
                await pauseSystem();
                break;

            }
            case SYSTEM_STATES.RESUME_SYSTEM: {
                await resumeSystem();
                break;
            }
            default: {
                return;
            }
        }
    }

};


