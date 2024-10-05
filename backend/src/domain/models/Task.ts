export enum TaskAction {
    RETWEET = 'retweet',
    FOLLOW = 'follow',
    COMMENT = 'comment',
    LIKE = 'like',
}

//export enum TaskType {
//    ONETIME = 'onetime',
//    RECURRING = 'recurring',
//}

export interface Task {
    id: string;
    title: string;
    description: string;
    url: string;
    createdAt: number;
    updatedAt: number;
    //type: TaskType;
    deadline: number;
    action: TaskAction;
    reward: number;
    //completedAt?: string;
}
