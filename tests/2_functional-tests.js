const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const http_post = 'post';
const http_get = 'get';
const http_put = 'put';
const http_delete = 'delete';

function sendReqAndTest (url, testFn, http_verb = http_get, body = null) {
    let req = chai.request(server).keepOpen();

    switch (http_verb) {
        case http_post:
            req = req.post(url);
            break;
        case http_put:
            req = req.put(url);
            break;
        case http_delete:
            req = req.delete(url);
            break;
        default:
            req = req.get(url);
            break;
    }

    if (body) {
        req = req.send(body);
    }

    req.end((err, res) => {
        testFn(err, res);
    });
}


suite('Functional Tests', () => { 
    test('Solve a puzzle with valid puzzle string', (done) => {
        const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        const expectedSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
 
        sendReqAndTest('/api/solve', (err, res) => {
            assert.equal(res.body.solution, expectedSolution);
            done();
        }, http_post, { puzzle });
    });
  
    test('Solve a puzzle with missing puzzle string', (done) => {
        const expectedError = 'Required field missing';
        sendReqAndTest('/api/solve', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post);
    });

    test('Solve a puzzle with invalid characters', (done) => {
        const puzzle = '1.5..2.84..03.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        const expectedError = 'Invalid characters in puzzle';
        sendReqAndTest('/api/solve', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, { puzzle });
    });

    test('Solve a puzzle with incorrect length', (done) => {
        const puzzle = '1.5..2.84..3.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        const expectedError = 'Expected puzzle to be 81 characters long';
        sendReqAndTest('/api/solve', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, { puzzle });
    });

    test('Solve a puzzle that cannot be solved', (done) => {
        const puzzle = '2.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        const expectedError = 'Puzzle cannot be solved';
        sendReqAndTest('/api/solve', (err, res) => {
            console.log(res.body);
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, { puzzle });
    });

    test('Check a puzzle placement with all fields', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '3'
        }
 
        sendReqAndTest('/api/check', (err, res) => {
            assert.isDefined(res.body.valid);
            assert.isTrue(res.body.valid);
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with single placement conflict', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '9'
        }
        sendReqAndTest('/api/check', (err, res) => {
            assert.isFalse(res.body.valid);
            assert.isArray(res.body.conflict);
            assert.equal(res.body.conflict, 'column');
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with multiple placement conflicts', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '2'
        }
        sendReqAndTest('/api/check', (err, res) => {
            assert.isFalse(res.body.valid);
            assert.isArray(res.body.conflict);
            assert.equal(res.body.conflict.length, 3);
            assert.isTrue(res.body.conflict.includes('row'));
            assert.isTrue(res.body.conflict.includes('column'));
            assert.isTrue(res.body.conflict.includes('region'));
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with all placement conflicts', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '2'
        }
        sendReqAndTest('/api/check', (err, res) => {
            assert.isFalse(res.body.valid);
            assert.isArray(res.body.conflict);
            assert.equal(res.body.conflict.length, 3);
            assert.isTrue(res.body.conflict.includes('row'));
            assert.isTrue(res.body.conflict.includes('column'));
            assert.isTrue(res.body.conflict.includes('region'));
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with missing required fields', (done) => {
        const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
        const coordinate = 'A2';
        const value = '2';
        const expectedError = 'Required field(s) missing';

        let done1 = false,
            done2 = false,
            done3 = false;
      
        sendReqAndTest('/api/check', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done1 = true;
            if (done1 && done2 && done3) done();
        }, http_post, { puzzle, coordinate });

        sendReqAndTest('/api/check', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done2 = true;
            if (done1 && done2 && done3) done();
        }, http_post, { puzzle, value });

        sendReqAndTest('/api/check', (err, res) => {
            assert.equal(res.body.error, expectedError);
            done3 = true;
            if (done1 && done2 && done3) done();
        }, http_post, { coordinate, value });
    });

    test('Check a puzzle placement with invalid characters', (done) => {
        const body = {
            puzzle: '1.5..2.84..03.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '3'
        }
        const expectedError = 'Invalid characters in puzzle';
        sendReqAndTest('/api/check', (err, res) => {
            assert.isDefined(res.body.error);
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with incorrect length', (done) => {
        const body = {
            puzzle: '1.5..2.84..3.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '3'
        }
        const expectedError = 'Expected puzzle to be 81 characters long';
        sendReqAndTest('/api/check', (err, res) => {
            assert.isDefined(res.body.error);
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with invalid placement coordinate', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'Z2',
            value: '3'
        }
        const expectedError = 'Invalid coordinate';
        sendReqAndTest('/api/check', (err, res) => {
            assert.isDefined(res.body.error);
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, body);
    });

    test('Check a puzzle placement with invalid placement value', (done) => {
        const body = {
            puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
            coordinate: 'A2',
            value: '25'
        }
        const expectedError = 'Invalid value';
        sendReqAndTest('/api/check', (err, res) => {
            assert.isDefined(res.body.error);
            assert.equal(res.body.error, expectedError);
            done();
        }, http_post, body);
    });
});
