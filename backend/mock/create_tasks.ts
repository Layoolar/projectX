const data = [
    {
        _id: '66b8265ed5bb2cf603746fb4',
        title: 'Task like test',
        description: 'A new task created to test endpoints',
        url: 'https://x.com/ThePrimeagen/status/1821653443225809234',
        deadline: 1723347577955,
        action: 'like',
        reward: 500,
        id: 'd3a3c4ed-2b31-4572-85bc-66f1a348370b',
        createdAt: 1723344478732,
        updatedAt: 1723346210242,
        completed: false,
    },
    {
        _id: '66b82684d5bb2cf603746fb5',
        title: 'Task retweet test',
        description: 'A new task created to test endpoints',
        url: 'https://x.com/ThePrimeagen/status/1821653443225809234',
        deadline: 1723347577955,
        action: 'retweet',
        reward: 500,
        id: '895d3819-f6c0-46d8-b205-c5dcca26a778',
        createdAt: 1723344516714,
        updatedAt: 1723344516714,
        completed: true,
    },
    {
        _id: '66b82693d5bb2cf603746fb6',
        title: 'Task comment test',
        description: 'A new task created to test endpoints',
        url: 'https://x.com/ThePrimeagen/status/1821653443225809234',
        deadline: 1723347577955,
        action: 'comment',
        reward: 500,
        id: '67597f70-cbd5-4f1e-9eb6-7b9af2e70be3',
        createdAt: 1723344531406,
        updatedAt: 1723344531407,
        completed: false,
    },
];

const dayInMilli = 24 * 60 * 60 * 1000;

data.forEach(async (d) => {
    const newD = {
        id: d.id,
        title: d.title,
        description: d.description,
        url: d.url,
        deadline: Date.now() + dayInMilli,
        action: d.action,
        reward: d.reward,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
    };
    console.log(JSON.stringify(newD));
});
