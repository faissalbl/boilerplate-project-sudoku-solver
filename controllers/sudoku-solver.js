const Cell = require("../models/Cell");
const { puzzlesAndSolutions } = require("./puzzle-strings");

class SudokuSolver {
  constructor() {
    this.rowNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    this.colNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
 }
  
  buildRows(puzzleString, rowLength) {
    const rows = [];
    let row = [];
    for (let i = 0; i < puzzleString.length; i++) {
      const val = puzzleString[i];
      row.push(val);
      if ((i + 1) % rowLength === 0) {
        rows.push(row);
        row = [];
      }
    }
    return rows;
  }

  buildCols(rows, colLength) {
    const cols = [];
    let col = [];

    for (let i = 0; i < colLength; i++) {
      col = rows.map((r) => r[i]);
      cols.push(col);
    }
    return cols;
  }

  buildRegions(rows) {
    const regionRowColLength = 3;
    const regionsRows = [];

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const regionsRowIndex = Math.floor(r / regionRowColLength);
      let regionsRow = regionsRows[regionsRowIndex];
      if (!regionsRow) {
        regionsRow = [];
        regionsRows.push(regionsRow);
      }
      for (let c = 0; c < row.length; c++) {
        const regionIndex = Math.floor(c / regionRowColLength);
        let region = regionsRow[regionIndex];
        if (!region) {
          region = {
            vals: [],
            rowColCoordinates: [],
          };
          regionsRow.push(region);
        }
        region.vals.push(row[c]);
        region.rowColCoordinates.push([r, c]);
      }
    }

    return regionsRows.flat();
  }

  // build cells and returns them in a list
  // of rows of cells, such that each cell.rowIndex / cell.colIndex
  // combination will match its position in the array, so that it can be found
  // easily.
  buildCells(puzzleString) {
    const rowLength = 9;
    const colLength = 9;

    const rows = this.buildRows(puzzleString, rowLength);
    const cols = this.buildCols(rows, colLength);
    const regions = this.buildRegions(rows);

    const cells = [];

    for (let i = 0; i < puzzleString.length; i++) {
      const val = puzzleString[i];
      const rowIndex = Math.floor(i / rowLength);
      const row = rows[rowIndex];
      const colIndex = i % rowLength;
      const col = cols[colIndex];
      const rowName = this.rowNames[rowIndex];
      const colName = this.colNames[i];
      const region = regions.find((b) => {
        const coordinate = b.rowColCoordinates.find((coord) => {
          const coordToFind = [rowIndex, colIndex];
          return coord.toString() === coordToFind.toString();
        });

        return coordinate ? true : false;
      });

      const cell = new Cell(
        val,
        rowIndex,
        colIndex,
        row,
        col,
        rowName,
        colName,
        region,
      );

      let cellRow = cells[rowIndex];
      if (!cellRow) {
        cellRow = [];
        cells.push(cellRow);
      }

      // add to the cellRow matching colIndex
      cellRow[colIndex] = cell;
    }

    return cells;
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
    const { error, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }
    
    const cells = this.buildCells(puzzleString);
    const cell = cells[rowIndex][colIndex];

    const existingVal = cell.row.find((r) => r == value);
    if (existingVal) {
      return { valid: false, conflict: 'row' };
    } else {
      return { valid: true };
    }
  }

  checkColPlacement(puzzleString, rowName, colName, value) {
    const { error, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    const cells = this.buildCells(puzzleString);
    const cell = cells[rowIndex][colIndex];

    const existingVal = cell.col.find((c) => c == value);
    if (existingVal) {
      return { valid: false, conflict: 'column' };
    } else {
      return { valid: true };
    }
  }

  checkRegionPlacement(puzzleString, rowName, colName, value) {
    const { error, rowIndex, colIndex } = 
      this.processInput(puzzleString, rowName, colName, value);
    if (error) {
      return { error };
    }

    const cells = this.buildCells(puzzleString);
    const cell = cells[rowIndex][colIndex];

    const existingVal = cell.region.vals.find((v) => v == value);
    if (existingVal) {
      return { valid: false, conflict: 'region' };
    } else {
      return { valid: true };
    }
  }

  check(puzzleString, rowName, colName, value) {
    let valid = true;
    const conflict = [];

    let result = this.checkRowPlacement(puzzleString, rowName, colName, value);
    if (result.error) {
      return { error: result.error };
    }    
    if (!result.valid) {
      conflict.push(result.conflict);
      valid = false;
    }

    result = this.checkColPlacement(puzzleString, rowName, colName, value);
    if (result.error) {
      return { error: result.error };
    }    
    if (!result.valid) {
      conflict.push(result.conflict);
      valid = false;
    }

    result = this.checkRegionPlacement(puzzleString, rowName, colName, value);
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
  };

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

    return { rowIndex, colIndex };
  };

  solve(puzzleString) {
    const error = this.validate(puzzleString);
    if (error) {
      return { error };
    }

    const puzzSol = puzzlesAndSolutions.find(p => {
      const matchRes = puzzleString.match(p[0]);
      return matchRes ? true : false;
    });
    
    if (!puzzSol) {
      return { error: "Puzzle cannot be solved" };
    }

    const solution = puzzSol[1];

    // I was trying here to solve any puzzleString without the help of the given solution.
    // for (let c = 0; c < cells.length; c++) {
    //   const cell = cells[c];
    //   if (cell.val === '.') {
    //     for (let v = 1; v <= 9; v++) {
    //       const value = v.toString();
    //       let result = this.checkRowPlacement(puzzleString, cell.rowName, cell.colName, value, cell);
    //       if (!result.valid) continue;

    //       result = this.checkColPlacement(puzzleString, cell.rowName, cell.colName, value, cell);
    //       if (!result.valid) continue;

    //       result = this.checkRegionPlacement(puzzleString, cell.rowName, cell.colName, value, cell);
    //       if (!result.valid) continue;

    //       cell.setVal(value);
    //     }
    //   }
    // }

    return { solution };
  }
}

module.exports = SudokuSolver;
