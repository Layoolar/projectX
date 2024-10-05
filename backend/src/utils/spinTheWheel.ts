const rewards = [0, 200, 300, 500, 1000];
const probabilities = [0.5, 0.25, 0.15, 0.07, 0.03];

export function spinTheWheel(): number {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < rewards.length; i++) {
        cumulativeProbability += probabilities[i];
        if (random < cumulativeProbability) {
            return rewards[i];
        }
    }

    return rewards[0];
}
