let gridApi;

const gridOptions = {
  columnDefs: [
    { field: 'Acronym' },
    { field: 'Definition', minWidth: 280},
    { field: 'Meaning' },
    { field: 'GDS Directorates'},
    { field: 'Team'},
    { field: 'Timestamp', headerName: 'Updated'},

  ],
  defaultColDef: {
    flex: 1,
  },
  animateRows: false,
  pagination: true,
  enableCellTextSelection: true
};

function onFilterTextBoxChanged() {
  gridApi.setGridOption(
    'quickFilterText',
    document.getElementById('filter-text-box').value
  );
}

function csvToJson(csv) {
    // Split the input into lines
    let lines = csv.split("\n");

    // Extract headers
    let headers = lines[0].split(",");

    // Array to hold our JSON objects
    let result = [];

    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    // Return the JSON array

    return {
      data: JSON.stringify(result, null, 2),
      updated: result[result.length -1]?.Timestamp
    }


}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', async function () {
  const gridDiv = document.querySelector('#myGrid');
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

    try {
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRT5feIKAxaKgxNzX5dX6e2ufaTZkuMZYangwyn2B0deEYcngIrJgopldYZX6THjO3KqlZs5Dxusu_R/pub?output=csv')
        .then(response => response.text())
        .then(data => {
          const result = csvToJson(data.replace(/"/g,''))
          document.querySelector('#updated').innerHTML = result.updated;
          return gridApi.setGridOption('rowData', JSON.parse(result.data))
        });
    } catch(err) {
      console.log(err)
    }

});
