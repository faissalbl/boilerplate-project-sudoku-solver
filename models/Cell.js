class Cell {
  constructor(val, rowIndex, colIndex, row, col, rowName, colName, region) {
    this.val = val;
    this.editable = false;
    if ('.' === val) {
      this.editable = true;
    }
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.row = row;
    this.col = col;
    this.rowName = rowName;
    this.colName = colName;
    this.region = region;
  }

  setRowVal(val) {
    this.row[this.colIndex] = val;
  }  

  setColVal(val) {
    this.col[this.rowIndex] = val;
  }

  setRegionVal(val) {
    this.region.vals.push(val);
  }

  setVal(val) {
    this.val = val;
    this.setRowVal(val);
    this.setColVal(val);
    this.setRegionVal(val);
  }
}

module.exports = Cell;