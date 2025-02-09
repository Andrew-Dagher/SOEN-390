module.exports = {
    projectPath: './frontend',
    testsPath: './frontend/tests/maestro',
    outputPath: './frontend/tests/maestro/output',
    testEnvironment: 'expogo',
    globalSettings: {
        timeout: 30000,
        retries: 2
    },
    testFiles: [
        './frontend/tests/maestro/**/*.yaml'
    ]
};