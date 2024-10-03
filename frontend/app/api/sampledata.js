export const tasks = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "",
    "data": [
        {
            "id": "d3a3c4ed-2b31-4572-85bc-66f1a348370b",
            "task": {
                "_id": "66b8265ed5bb2cf603746fb4",
                "title": "Task like test",
                "description": "A new task created to test endpoints",
                "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
                "deadline": 1723347577955,
                "action": "like",
                "reward": 500,
                "createdAt": 1723344478732,
                "updatedAt": 1723346210242,
                "completed": false
            }
        },
        {
            "id": "895d3819-f6c0-46d8-b205-c5dcca26a778",
            "task": {
                "_id": "66b82684d5bb2cf603746fb5",
                "title": "Task retweet test",
                "description": "A new task created to test endpoints",
                "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
                "deadline": 1723347577955,
                "action": "retweet",
                "reward": 500,
                "createdAt": 1723344516714,
                "updatedAt": 1723344516714,
                "completed": true
            }
        },
        {
            "id": "67597f70-cbd5-4f1e-9eb6-7b9af2e70be3",
            "task": {
                "_id": "66b82693d5bb2cf603746fb6",
                "title": "Task comment test",
                "description": "A new task created to test endpoints",
                "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
                "deadline": 1723347577955,
                "action": "comment",
                "reward": 500,
                "createdAt": 1723344531406,
                "updatedAt": 1723344531407,
                "completed": false
            }
        }
    ]
};


export const verifyTask = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "Task verification successful",
    "data": {}
}


export const leaderboard = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "Task verification successful",
    "data": [
        {
            "id": "7973240272323987328230723",
            "permission": "user",
            "rewardTokens": {
                "claimed": 0,
                "unclaimed": 0
            },
            "twitter": {
                "id": "7973240272323987328230723",
                "username": "SomeJohnDoe"
            },
            "createdAt": 1723380547769,
            "updatedAt": 1723380547769,
        }, {
            "id": "19127493274973508230432840",
            "permission": "user",
            "rewardTokens": {
                "claimed": 0,
                "unclaimed": 0
            },
            "twitter": {
                "id": "19127493274973508230432840",
                "username": "SomeOtherJohnDoe"
            },
            "createdAt": 1723380547769,
            "updatedAt": 1723380547769,
        }]
    // requires the rank of the pertculat user
}

export const profile = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "Task verification successful",
    "data":
    {
        "id": "7973240272323987328230723",
        "permission": "user",
        "rewardTokens": {
            "claimed": 0,
            "unclaimed": 0
        },
        "twitter": {
            "id": "7973240272323987328230723",
            "username": "SomeJohnDoe"
        },
        "createdAt": 1723380547769,
        "updatedAt": 1723380547769,
    }
    // requires rank and referal code and refrals count ( people that have joined using the referal code ) and a notion to add the referal code 
}

export const userHistory = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "User task completion history",
    "data": [
        {
            "_id": "66b8c5e6d6bf5c08b136dc36",
            "userId": "2729752750309723596",
            "taskId": "895d3819-f6c0-46d8-b205-c5dcca26a778",
            "createdAt": 1723385318937,
            "updatedAt": 1723385318937,
            "task": {
                "_id": "66b82684d5bb2cf603746fb5",
                "title": "Task retweet test",
                "description": "A new task created to test endpoints",
                "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
                "action": "retweet",
                "reward": 500,
                "id": "895d3819-f6c0-46d8-b205-c5dcca26a778",
                "createdAt": 1723344516714,
                "updatedAt": 1723344516714
            }
        }
    ]
}

export const createTask = {
    "statusCode": 201,
    "statusMessage": "Created",
    "message": "Task created successfully",
    "data": {
        "title": "Task follow test",
        "description": "A new task created to test endpoints",
        "url": "https://x.com/ThePrimeagen",
        "deadline": 1725387578955,
        "action": "follow",
        "reward": 500,
        "id": "ab206647-ec23-4ca0-9733-55d6adb9a945",
        "createdAt": 1723390311795,
        "updatedAt": 1723390311795,
        "_id": 0
    }
}

export const adminTasks = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "",
    "data": [
        {
            "title": "Task like test",
            "description": "A new task created to test endpoints",
            "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
            "deadline": 1723347577955,
            "action": "like",
            "reward": 500,
            "id": "d3a3c4ed-2b31-4572-85bc-66f1a348370b",
            "createdAt": 1723344478732,
            "updatedAt": 1723346210242
        },
        {
            "title": "Task retweet test",
            "description": "A new task created to test endpoints",
            "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
            "deadline": 1723347577955,
            "action": "retweet",
            "reward": 500,
            "id": "895d3819-f6c0-46d8-b205-c5dcca26a778",
            "createdAt": 1723344516714,
            "updatedAt": 1723344516714
        },
        {
            "title": "Task comment test",
            "description": "A new task created to test endpoints",
            "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
            "deadline": 1723347577955,
            "action": "comment",
            "reward": 500,
            "id": "67597f70-cbd5-4f1e-9eb6-7b9af2e70be3",
            "createdAt": 1723344531406,
            "updatedAt": 1723344531407
        }
    ]
}

export const updateTask = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "",
    "data": {
        "title": "Task like test",
        "description": "A new task created to test endpoints",
        "url": "https://x.com/ThePrimeagen/status/1821653443225809234",
        "deadline": 1723347577955,
        "action": "like",
        "reward": 500,
        "id": "d3a3c4ed-2b31-4572-85bc-66f1a348370b",
        "createdAt": 1723344478732,
        "updatedAt": 1723390562897
    }
}

export const deleteTasks = {
    "statusCode": 200,
    "statusMessage": "OK",
    "message": "Task deleted successfully",
    "data": {}
}
