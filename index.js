const express = require('express');
const CircuitBreaker = require('opossum');

const app = express();
const port = 8080;

// Function simulating an external call with a 50% failure rate
async function externalService() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const shouldFail = Math.random() > 0.8;// Simulates the failure rate.
            if (shouldFail) {
                reject(new Error('External call failed'));
            } else {
                resolve('External call response');
            }
        }, 2000);// Simulates a call that lasts 2 seconds.
    });
}

// Circuit Breaker Configuration
const breaker = new CircuitBreaker(externalService, {
    timeout: 3000, // 3-second timeout for the call
    errorThresholdPercentage: 50, // Opens the circuit if 50% of requests fail
    resetTimeout: 10000 // Attempts to close the circuit after 10 seconds
});

// Dealing with successful and failed Circuit Breaker issues
breaker.fallback(() => 'Fallback response...');
breaker.on('open', () => console.log('Open circuit!'));
breaker.on('halfOpen', () => console.log('Circuit partially open'));
breaker.on('close', () => console.log('Closed circuit again'));
breaker.on('reject', () => console.log('Request rejected by the Circuit Breaker'));
breaker.on('failure', () => console.log('Fault registered by the Circuit Breaker'));
breaker.on('success', () => console.log('Success recorded by Circuit Breaker'));

// Route that makes the simulated call with the Circuit Breaker
app.get('/api/circuitbreaker', async (req, res) => {
    try {
        const result = await breaker.fire();
        res.send(result);
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});