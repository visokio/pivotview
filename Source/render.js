/*
 * This is the implementation of the grid result renderer.
 * The render method takes the result of a Grid Query (GridQueryOutput) and updates the DOM to display it.
 *
 * Notes regarding the grid API and this project:
 *
 *  - The grid query input and output objects are part of the "Grid" operation within the Omniscope query APIs,
 *    which are currently in development.
 *    See JSON schema docs: http://staging.omniscope.me/_global_/query/sample/v1/meta/docson/
 *    and playground: http://staging.omniscope.me/_global_/query/sample/v1/meta/#!/Grid/grid_post
 *
 *  - You can only currently use unique values of fields as grid axis dimensions.
 *    Histogram-based axes are in development, but not ready for use.
 *
 *  - The query supports multiple axis tiers. So each header "cell" in the result is in fact an array
 *    of values, for each tier. This implementation below does not render multiple tiers, and uses JSON.stringify
 *    if it finds multiple tiers, and renders them as a single row. This needs to be developed.
 *
 *  - The grid API supports partial loading of data within the viewport. This is not implemented here and is
 *    beyond the scope of this exercise.
 *
 *  - You can only use one cell query (the value within each data cell), which in the associated html examples
 *    is hard-coded to "RECORD_COUNT". We plan to extend the Grid API to support multiple measures as virtual
 *    fields such that they can be transparently chosen as axes. Until this is done, this Pivot view should only
 *    support a single measure.
 *
 *  - Rendering of cells needs to deal with rounding better, e.g. 2 decimal places.
 *
 *  - Totals and differences are calculated and rendered in the client. This is fine.
 *
 *  - However this needs to be abstracted so you can have row-based differences and totals, as well as column-based.
 *
 *  - All columns AND rows need to be sortable.
 *    You need to be able to click on a single column and sort all rows by the value in that column.
 *    Click again to reverse the sort. Click a 3rd time to clear the sort.
 *    And vice versa for rows - you need to be able to click the row header to order the columns by values in that row.
 *
 *  - Sorting should support sorting by total and difference rows/columns.
 *
 *  - You probably want to scrap the delta icon for differences, it looks like a sort indicator.
 *
 *  - If this combination of sortable + differences rows + columns leads to impossible situations
 *    such as endless loops or non-determinism, limit the combinations of choices supported.
 *
 *  - Colouring of cells is very naive; it needs to support colouring values by their relative position with respect
 *    to other values in the table, using a colour gradient such as blue to gold.
 *
 *  - Scrolling should occur within the data cells area, with the row and column headers scrollable only in the
 *    appropriate axis, synchronised with the main viewport. Touch scrolling must not be broken.
 */

/**
 * @param data The GridQueryOutput object
 * @param elem The element to render in
 */
var render = function(data, elem) {
    elem.innerHTML = "";

    var table = document.createElement("table");
    elem.appendChild(table);

    var row = document.createElement("tr");
    table.appendChild(row);

    var cell;

    // blank corner:
    cell = document.createElement("td");
    cell.classList.add("h");
    row.appendChild(cell);

    var formatHeader = function(h) {
        if (!h) return "";
        if (!h.length) return "(All)";
        if (h.length===1) return h[0];
        return JSON.stringify(h);
    };

    for (var x=0; x<data.axes[1].headers.length; x++) {
        if (x>0) {
            // x diff header
            cell = document.createElement("td");
            row.appendChild(cell);
            cell.classList.add("diffh");
            cell.textContent = "\u0394";
        }
        // x value header
        cell = document.createElement("td");
        row.appendChild(cell);
        cell.classList.add("h");
        cell.textContent = formatHeader(data.axes[1].headers[x]);
    }

    // x total header
    cell = document.createElement("td");
    row.appendChild(cell);
    cell.classList.add("totalh");
    cell.textContent = "Total";

    // x spacer header
    cell = document.createElement("td");
    row.appendChild(cell);

    for (var y=0; y<data.axes[0].headers.length; y++) {
        row = document.createElement("tr");
        table.appendChild(row);

        // y header
        cell = document.createElement("td");
        row.appendChild(cell);
        cell.textContent = formatHeader(data.axes[0].headers[y]);
        cell.classList.add("h");

        var cellData, prevCellData;

        var xtotal = 0;

        for (var x=0; x<data.axes[1].headers.length; x++) {
            cellData = data.cells[y][x];

            if (x>0) {
                // x diff value
                prevCellData = data.cells[y][x-1];
                cell = document.createElement("td");
                cell.classList.add("diffv");
                row.appendChild(cell);
                if (prevCellData!==null && cellData!==null) { // if both cells have data present
                    var currVal = cellData.main[0][0], prevVal = prevCellData.main[0][0];
                    if (currVal!==null && prevVal!==null) {
                        cell.textContent = currVal-prevVal;
                        if (prevVal!==0) {
                            var percent = Math.round(100*((currVal - prevVal) / prevVal));
                            if (percent<0) percent = ""+percent; else percent = "+"+percent;
                            cell.textContent += " ("+percent+"%)";
                        }
                    } else {
                        // if either are null, don't show a difference value
                    }
                }
                if (cellData!==null) xtotal += cellData.main[0][0];
            }

            // x value
            cell = document.createElement("td");
            cell.classList.add("v");
            row.appendChild(cell);
            if (cellData!==null) cell.textContent = cellData.main[0][0];
        }

        // x total
        cell = document.createElement("td");
        cell.classList.add("totalv");
        row.appendChild(cell);
        cell.textContent = xtotal;

        // x spacer value
        cell = document.createElement("td");
        row.appendChild(cell);
    }
};

