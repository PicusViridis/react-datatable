import React from "react";
import { useTable } from "react-datatable";

const columns = [
  {
    name: "Column",
    accessor: "column"
  }
];

const items = [{ column: "This is a column" }];

function onRefresh(props) {
  console.log("refreshing", props);
}

export default function App() {
  const { headers, filters, rows, footer } = useTable({
    columns,
    items,
    editable: true,
    sortable: true,
    filterable: true,
    onRefresh
  });

  return (
    <div>
      <table>
        <thead>
          <tr>
            {headers.map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
          <tr>
            {filters.map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>{footer}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
