class SudokuSolver {
  constructor() {
    this.rowNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    this.colNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  }
  
  validate(puzzleString) {
    let error;
    if (!puzzleString) {
      error = "Required field missing";
    }

    if (puzzleString.length !== 81) {
      error = "Expected puzzle to be 81 characters long";
    }

    for (let i = 0; i < puzzleString.length; i++) {
      if (!puzzleString[i].match(/[1-9,\.]/)) {
        error = "Invalid characters in puzzle";
      }
    }

    return error;
  }

  checkRowPlacement(puzzleString, rowName, colName, value) {
    const { error, grid, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    return this.checkGridRowPlacement(grid, rowIndex, colIndex, value);
  }

  checkGridRowPlacement(grid, rowIndex, colIndex, value) {
    const cell = this.preGridCheck(grid, rowIndex, colIndex, value);

    let result;
    const existingVal = grid[rowIndex].find((r) => r == value);
    if (existingVal) {
      result = { valid: false, conflict: 'row' };
    } else {
      result = { valid: true };
    }
    this.postGridCheck(grid, rowIndex, colIndex, cell);
    return result; 
  }

  checkColPlacement(puzzleString, rowName, colName, value) {
    const { error, grid, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    return this.checkGridColPlacement(grid, rowIndex, colIndex, value);
  }

  checkGridColPlacement(grid, rowIndex, colIndex, value) {
    const cell = this.preGridCheck(grid, rowIndex, colIndex, value);

    let result;
    for (let r = 0; r < 9; r++) {
      if (grid[r][colIndex] == value) {
        result = { valid: false, conflict: 'column' };
        break;
      }
    }
    
    if (!result) result = { valid: true };
    this.postGridCheck(grid, rowIndex, colIndex, cell);
    return result;
  }

  checkRegionPlacement(puzzleString, rowName, colName, value) {
    const { error, grid, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    return this.checkGridRegionPlacement(grid, rowIndex, colIndex, value);
  }

  checkGridRegionPlacement(grid, rowIndex, colIndex, value) {
    const cell = this.preGridCheck(grid, rowIndex, colIndex, value);

    const rowStart = rowIndex - rowIndex % 3;
    const colStart = colIndex - colIndex % 3;

    let result;
    for (let r = 0; r < 3; r++) {
      if (result) break;
      for (let c = 0; c < 3; c++) {
        const regionRowIndex = rowStart + r;
        const regionColIndex = colStart + c;

        if (grid[regionRowIndex][regionColIndex] == value) {
          result = { valid: false, conflict: 'region' };
          break;
        }
      }
    }
    if (!result) result = { valid: true };
    this.postGridCheck(grid, rowIndex, colIndex, cell);
    return result;
  }

  preGridCheck(grid, rowIndex, colIndex, value) {
    const cell = grid[rowIndex][colIndex];
    if (cell == value) grid[rowIndex][colIndex] = '.';
    return cell;
  }

  postGridCheck(grid, rowIndex, colIndex, value) {
    grid[rowIndex][colIndex] = value;
  }

  check(puzzleString, rowName, colName, value) {
    const { error, grid, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    return this.checkGrid(grid, rowIndex, colIndex, value);
  };

  checkGrid(grid, rowIndex, colIndex, value) {
    let valid = true;
    const conflict = [];

    let result = this.checkGridRowPlacement(grid, rowIndex, colIndex, value);
    if (result.error) {
      return { error: result.error };
    }    
    if (!result.valid) {
      conflict.push(result.conflict);
      valid = false;
    }

    result = this.checkGridColPlacement(grid, rowIndex, colIndex, value);
    if (result.error) {
      return { error: result.error };
    }    
    if (!result.valid) {
      conflict.push(result.conflict);
      valid = false;
    }

    result = this.checkGridRegionPlacement(grid, rowIndex, colIndex, value);
    if (result.error) {
      return { error: result.error };
    }   
    if (!result.valid) { 
      conflict.push(result.conflict);
      valid = false;
    }

    result = { valid };
    if (!valid) {
      result.conflict = conflict;
    }
  
    return result;
  }

  processInput(puzzleString, rowName, colName, value) {
    const error = this.validate(puzzleString);
    if (error) {
      return { error };
    }

    if (!value || !value.match(/[1-9]/)) {
      return { error: "Invalid value" };
    }

    const rowIndex = this.rowNames.indexOf(rowName);
    const colIndex = this.colNames.indexOf(colName);
    if (rowIndex < 0 || colIndex < 0) {
      return { error: "Invalid coordinate" };
    }

    const grid = this.buildGrid(puzzleString);

    return { grid, rowIndex, colIndex };
  };

  buildGrid(puzzleString) {
    const grid = [];
    for (let i = 0; i < puzzleString.length; i++) {
      const rowIndex = Math.floor(i / 9);
      const colIndex = i % 9;
      
      let row = grid[rowIndex];
      if (!row) {
        row = [];
        grid[rowIndex] = row;
      }

      row[colIndex] = puzzleString[i];
    }
    return grid;
  }

  findEmptyCell(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === '.') {
          return [r, c];
        }
      }
    }
    return null;
  }

  solveSudoku(grid) {
    const emptyCell = this.findEmptyCell(grid);
    if (!emptyCell) {
      return true; //solved
    }

    const [row, col] = emptyCell;
    // try filling the empty cell with 1 - 9
    for (let num = 1; num <= 9; num++) {
      const { valid } = this.checkGrid(grid, row, col, num);
      if (valid) {
        // if the current placement is valid, try solving the rest
        // of sudoku
        grid[row][col] = num;
        
        if (this.solveSudoku(grid)) {
          return true;
        }

        // otherwise, the current placement was not one that made
        // it possible to solve the rest of sudoku. Backtrack.
        grid[row][col] = '.';
      }
    }
    return false; // no valid number found. Need to backtrack.
  }

  solve(puzzleString) {
    const validationError = this.validate(puzzleString);
    if (validationError) {
      return { error: validationError };
    }

    const grid = this.buildGrid(puzzleString);
    if (!this.solveSudoku(grid)) {
      return { error: 'Puzzle cannot be solved' };
    }

    const { error } = this.validateSolvedGrid(grid);
    if (error) {
      return { error };
    }
    
    const solution = grid.flat().join('');

    return { solution };    
  }

  validateSolvedGrid(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = grid[r][c];
        const { valid } = this.checkGrid(grid, r, c, value);
        if (!valid) return { error: 'Puzzle cannot be solved' };
      }
    }
    return { valid: true };
  }
}

module.exports = SudokuSolver;
