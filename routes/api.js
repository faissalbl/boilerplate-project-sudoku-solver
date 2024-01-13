'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
        const { puzzle, coordinate, value } = req.body;
        if (!puzzle || !coordinate || !value) {
            return res.json({ error: 'Required field(s) missing' });
        }
        
        if (!/^[A-I][1-9]$/.test(coordinate)) {
            return res.json({ error: 'Invalid coordinate' });
        }

        if (!/^[1-9]$/.test(value)) {
            return res.json({ error: 'Invalid value' });
        }

        const rowName = coordinate[0];
        const colName = coordinate[1];
        console.log('about to call check');
        const result = solver.check(puzzle, rowName, colName, value);
        console.log('result', result);
        return res.json(result);
    });
    
  app.route('/api/solve')
    .post((req, res) => {
        const puzzle = req.body.puzzle;
        if (!puzzle) {
            return res.json({ error: 'Required field missing' });
        }
        const result = solver.solve(puzzle);
        res.json(result);
    });
};
