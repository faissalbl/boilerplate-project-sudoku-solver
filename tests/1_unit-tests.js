const chai = require('chai');

const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

suite('Unit Tests', () => {
  test('Logic handles a valid puzzle string of 81 characters', () => {
    const puzzlesAndSolutions = [
      [
        '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
        '135762984946381257728459613694517832812936745357824196473298561581673429269145378'
      ],
      [
        '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3',
        '568913724342687519197254386685479231219538467734162895926345178473891652851726943'
      ],
      [
        '..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1',
        '218396745753284196496157832531672984649831257827549613962415378185763429374928561'
      ],
      [
        '.7.89.....5....3.4.2..4..1.5689..472...6.....1.7.5.63873.1.2.8.6..47.1..2.9.387.6',
        '473891265851726394926345817568913472342687951197254638734162589685479123219538746'
      ],
      [
        '82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51',
        '827549163531672894649831527496157382218396475753284916962415738185763249374928651'
      ]
    ];
    
    for (let i = 0; i < puzzlesAndSolutions.length; i++) {
      const puzzSol = puzzlesAndSolutions[i];
      const result = solver.solve(puzzSol[0]);

      assert.isDefined(result);
      assert.isDefined(result.solution);  
      assert.equal(result.solution, puzzSol[1]);
    }
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const result = solver.solve(
      '1.5..2.84..03.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
    );

    assert.isDefined(result);
    assert.equal(result.error, 'Invalid characters in puzzle');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const result = solver.solve(
      '1.5..2.84..3.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
    );

    assert.isDefined(result);
    assert.equal(result.error, 'Expected puzzle to be 81 characters long');
  });

  test('Logic handles a valid row placement', () => {
    let result = solver.checkRowPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '3'
    );

    assert.isTrue(result.valid);
    
    result = solver.checkRowPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '3'
    );

    assert.isTrue(result.valid);

    result = solver.checkRowPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '3', '5'
    );

    assert.isTrue(result.valid);
  });

  test('Logic handles an invalid row placement', () => {
    const result = solver.checkRowPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '4'
    );

    assert.isFalse(result.valid);
    assert.equal(result.conflict, 'row');
  });

  test('Logic handles a valid column placement', () => {
    let result = solver.checkColPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '3'
    );

    assert.isTrue(result.valid);

    result = solver.checkColPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '3', '5'
    );

    assert.isTrue(result.valid);
  });

  test('Logic handles an invalid column placement', () => {
    const result = solver.checkColPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '9'
    );

    assert.isFalse(result.valid);
    assert.equal(result.conflict, 'column');
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    let result = solver.checkRegionPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '3'
    );

    assert.isTrue(result.valid);

    result = solver.checkRegionPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '3', '5'
    );

    assert.isTrue(result.valid);
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const result = solver.checkRegionPlacement(
      '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
      'A', '2', '2'
    );

    assert.isFalse(result.valid);
    assert.equal(result.conflict, 'region');
  });
  
  test('Valid puzzle strings pass the solver', () => {
    const puzzlesAndSolutions = [
      [
        '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
        '135762984946381257728459613694517832812936745357824196473298561581673429269145378'
      ],
      [
        '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3',
        '568913724342687519197254386685479231219538467734162895926345178473891652851726943'
      ],
      [
        '..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1',
        '218396745753284196496157832531672984649831257827549613962415378185763429374928561'
      ],
      [
        '.7.89.....5....3.4.2..4..1.5689..472...6.....1.7.5.63873.1.2.8.6..47.1..2.9.387.6',
        '473891265851726394926345817568913472342687951197254638734162589685479123219538746'
      ],
      [
        '82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51',
        '827549163531672894649831527496157382218396475753284916962415738185763249374928651'
      ]
    ];
    
    for (let i = 0; i < puzzlesAndSolutions.length; i++) {
      const puzzSol = puzzlesAndSolutions[i];
      const result = solver.solve(puzzSol[0]);

      assert.isDefined(result);
      assert.isDefined(result.solution);  
      assert.equal(result.solution, puzzSol[1]);
    }
  });

  test('Invalid puzzle strings fail the solver)', () => {
    const result = solver.solve(
      '1.5..2.84..03.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
    );

    assert.isDefined(result);
    assert.equal(result.error, 'Invalid characters in puzzle');
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const puzzle = '135..2.84.463.12.7.2..5...369..1...28.2.3674.3.7.2419.47...8..1..16....9269145378';

    const solution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
          
    const result = solver.solve(puzzle);

    assert.isDefined(result);
    assert.isDefined(result.solution);  
    assert.equal(result.solution, solution);
  });

  
});
