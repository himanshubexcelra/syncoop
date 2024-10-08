import '@testing-library/jest-dom';
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: jest.fn().mockResolvedValue({}), // Default mock response
    })
);