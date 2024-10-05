import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';

interface IQueue {
    publish<T>(queueName: string, payload: T): Promise<boolean>;
    consume(
        queueName: string,
        callback: (msg: ConsumeMessage | null) => void,
        noAck: boolean
    ): Promise<void>;
}

export class Queue implements IQueue {
    private url: string;
    private connection?: Connection;
    public channel?: Channel;
    private isConnected: boolean;

    constructor(queueUrl: string) {
        this.url = queueUrl;
        this.isConnected = false;
    }

    private async createConnection(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.isConnected = true;

            this.connection.on('close', (err) => { //event lstnr to hndl dscnnctn scnrs
                console.error('Connection closed', err);
                this.isConnected = false;
                this.connection = undefined;
                this.channel = undefined;
            });
        } catch (err) {
            throw new Error(
                `Failed to connect to RabbitMQ: ${(err as Error).message}`
            );
        }
    }

    private async getConnection(): Promise<void> {
        if (!this.connection) {
            await this.createConnection();
        }
    }

    private async getChannel(): Promise<Channel> {
        await this.getConnection();

        if (!this.channel || !this.isConnected) {
            this.channel = await this.connection!.createChannel();
        }

        return this.channel!;
    }

    public async publish<T>(queueName: string, payload: T): Promise<boolean> {
        try {
            const channel = await this.getChannel();
            await channel.assertQueue(queueName, { durable: true });

            const send = channel.sendToQueue(
                queueName,
                Buffer.from(JSON.stringify(payload))
            );

            return send;
        } catch (err) {
            throw new Error(
                `Failed to publish message: ${(err as Error).message}`
            );
        }
    }

    public async consume(
        queueName: string,
        callback: (msg: ConsumeMessage | null) => void,
        noAck: boolean
    ): Promise<void> {
        try {
            const channel = await this.getChannel();
            await channel.assertQueue(queueName, { durable: true });

            console.log(`Listening to consume ${queueName} data.....`);

            await channel.consume(queueName, (msg) => callback(msg), { noAck });
        } catch (err) {
            throw new Error(
                `Failed to consume message: ${(err as Error).message}`
            );
        }
    }
}
