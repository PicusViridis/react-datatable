import React, { useEffect, useState } from 'react'

function emptyFn() {}

function DefaultHeaderRenderer({ column, sort, onClick }) {
    return (
        <div onClick={() => onClick(column)}>
            {column.name}
            {sort && sort.col === column.accessor && (sort.dir === 'asc' ? ' v' : ' ^')}
        </div>
    )
}

function DefaultCellRenderer({ column, item, onClick }) {
    return <div onClick={() => onClick(column, item)}>{item[column.accessor]}</div>
}

function DefaultEditionRenderer({ column, item, onChange, onClick }) {
    const [value, setValue] = useState(item[column.accessor])

    return (
        <div>
            <input type="text" value={value} onChange={e => setValue(e.target.value)} />
            <button type="button" onClick={() => onChange(column, item, value)}>
                Validate
            </button>
            <button type="button" onClick={() => onClick(column, item)}>
                Cancel
            </button>
        </div>
    )
}

function renderHeader(column, sort, onClick) {
    return typeof column.headerRenderer === 'function' ? (
        column.headerRenderer(column, sort, onClick)
    ) : (
        <DefaultHeaderRenderer column={column} sort={sort} onClick={onClick} />
    )
}

function renderCell(column, item, edition, onChange, onClick) {
    if (edition.col === column && edition.item === item) {
        return renderEdition(column, item, onChange, onClick)
    }
    return typeof column.cellRenderer === 'function' ? (
        column.cellRenderer(column, item, onClick)
    ) : (
        <DefaultCellRenderer column={column} item={item} onClick={onClick} />
    )
}

function renderEdition(column, item, onChange, onClick) {
    return typeof column.editionRenderer === 'function' ? (
        column.editionRenderer(column, item, onChange, onClick)
    ) : (
        <DefaultEditionRenderer column={column} item={item} onChange={onChange} onClick={onClick} />
    )
}

function useSort(defaultSort, sortable) {
    const [col, dir] = defaultSort.split('|')
    const [sort, _setSort] = useState({ col, dir })

    if (!sortable) return ['', emptyFn]

    function setSort(col) {
        if (sort.col !== col || sort.dir === 'desc') {
            _setSort({ col, dir: 'asc' })
        } else if (sort.dir === 'asc') {
            _setSort({ col, dir: 'desc' })
        }
    }

    return [sort, setSort]
}

function useEdition(defaultEdition, editable) {
    const [edition, _setEdition] = useState(defaultEdition)

    if (!editable) return [false, emptyFn]

    function setEdition(col, item) {
        if (edition.col === col && edition.item === item) {
            _setEdition({ col: null, item: null })
        } else {
            _setEdition({ col, item })
        }
    }

    return [edition, setEdition]
}

function useData(defaultData) {
    const [items, setItems] = useState(defaultData)

    function addItem(item) {
        setItems([...items, item])
    }

    function deleteItem(item) {
        setItems(items.filter(i => i !== item))
    }

    function changeItem(item) {
        setItems([item])
    }

    return [items, addItem, deleteItem, changeItem]
}

export function useTable({
    sortable = false,
    filterable = false,
    editable = false,
    onRefresh = emptyFn,
    columns = [],
    items: defaultItems = [],
    defaultSort = ''
} = {}) {
    const footer = ''

    const [items, addItem, deleteItem, changeItem] = useData(defaultItems)
    const [sort, setSort] = useSort(defaultSort, sortable)
    const [edition, setEdition] = useEdition({ col: null, item: null }, editable)

    useEffect(() => {
        onRefresh({ items, sort })
    }, [onRefresh, items, sort])

    function onSort(column) {
        if (sortable) {
            setSort(column.accessor)
        }
    }

    function onChange(column, item, value) {
        if (editable) {
            setEdition(null, null)
            changeItem({ ...item, [column.accessor]: value })
        }
    }

    function onEdit(column, item) {
        if (editable) {
            setEdition(column, item)
        }
    }

    function onAdd() {}

    const headers = columns.map(column => renderHeader(column, sort, onSort))

    const rows = items.map(item => columns.map(column => renderCell(column, item, edition, onChange, onEdit)))

    return { headers, rows, footer }
}
