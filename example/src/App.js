import React, { useState, useCallback } from "react";
import { useTable } from "react-datatable";
const ITEMS = require("./items.json");

const columns = [
  {
    name: "ID",
    accessor: "id"
  },
  {
    name: "First name",
    accessor: "first_name"
  },
  {
    name: "Last name",
    accessor: "last_name"
  },
  {
    name: "Email",
    accessor: "email"
  },
  {
    name: "Gender",
    accessor: "gender",
    cellRenderer: (column, item, onClick) => (
      <span onClick={() => onClick(column, item)}>
        {item[column.accessor] === "Male" ? "👨" : "👩"}
      </span>
    )
  },
  {
    name: "IP address",
    accessor: "ip_address"
  }
];

function sortBy(items, sort) {
  if (!sort.dir || !sort.col) return items;
  return items.sort((a, b) => {
    let fact = 1;
    if (sort.dir === "desc") fact = -1;
    return (
      fact *
      (a[sort.col] > b[sort.col] ? 1 : a[sort.col] < b[sort.col] ? -1 : 0)
    );
  });
}

function filter(items, filters) {
  return items.filter(item =>
    Object.entries(filters).every(
      ([key, value]) =>
        item[key] && item[key].toLowerCase().includes(value.toLowerCase())
    )
  );
}

function update(items, item) {
  return items.map(i => (i.id === item.id ? item : i));
}

export default function App() {
  const [items, setItems] = useState([]);

  const onRefresh = useCallback(
    ({ sort, filters }) => {
      const _item = sortBy(filter([...ITEMS], filters), sort);
      setItems(_item);
    },
    [setItems]
  );

  const onChange = useCallback(
    item => {
      const _item = update([...ITEMS], item);
      setItems(_item);
    },
    [setItems]
  );

  const { headers, filters, rows, footer } = useTable({
    columns,
    items,
    editable: true,
    sortable: true,
    filterable: true,
    onRefresh,
    onChange
  });

  const style = { border: "1px solid black", padding: "0.25rem" };

  return (
    <div>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((cell, i) => (
              <th key={i} style={style}>
                {cell}
              </th>
            ))}
          </tr>
          <tr>
            {filters.map((cell, i) => (
              <th key={i} style={style}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j} style={style}>
                  {cell}
                </td>
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
