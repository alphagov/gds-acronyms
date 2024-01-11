let gridApi;

const gridOptions = {
  columnDefs: [
    { field: 'Acronym', minWidth: 110, sort: 'asc'},
    { field: 'Definition', minWidth: 220},
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

function getLatestDate(str) {
  // Split the string into an array of date strings
  const dateArray = dateString.split(/\s*,\s*/);

  // Convert each date string to a Date object
  const dateObjects = dateArray.map(dateString => new Date(dateString));

  // Filter out invalid dates
  const validDates = dateObjects.filter(dateObject => !isNaN(dateObject.getTime()));

  // Find the latest date
  const latestDate = new Date(Math.max(...validDates.map(dateObject => dateObject.getTime())));

  // Return the latest date as a string
  return latestDate.toDateString();
}

function csvToJson(csv) {
    // Split the input into lines
    let lines = csv.split("\r");

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

    // Convert each date string to a Date object
    const dateObjects = result.map(x=> new Date(new Date(x.Timestamp).toLocaleString("en-GB")))

    // Filter out invalid dates
    const validDates = dateObjects.filter(dateObject => !isNaN(dateObject.getTime()));

    // Find the latest date
    const latestDate = new Date(Math.max(...validDates.map(dateObject => dateObject.getTime())));

    // Return the formatted date
    const formattedDate = latestDate.toLocaleString('en-GB');
    
    // Return the JSON array
    return {
      data: JSON.stringify(result, null, 2),
      updated: formattedDate
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
      console.error(err)
    }

});
