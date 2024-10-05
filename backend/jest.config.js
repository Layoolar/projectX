/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};