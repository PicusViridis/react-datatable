import React, { useEffect, useState } from 'react'

function emptyFn() {}

function DefaultHeaderRenderer({ column, sort, onClick }) {
    return (
        <div onClick={() => onClick(column)}>
            {column.name}
            {sort && sort.col === column.accessor && (sort.dir === 'asc' ? ' ▼' : ' ▲')}
        </div>
    )
}

function DefaultFilterRenderer({ column, filters, onChange }) {
    const value = typeof filters[column.accessor] === 'undefined' ? '' : filters[column.accessor]
    return <input type="text" value={value} onChange={e => onChange(column, e.target.value)} />
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

function renderFilters(column, filters, onChange) {
    return typeof column.filterRenderer === 'function' ? (
        column.filterRenderer(column, filters, onChange)
    ) : (
        <DefaultFilterRenderer column={column} filters={filters} onChange={onChange} />
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

function useSort(defaultSort) {
    const [col, dir] = defaultSort.split('|')
    const [sort, _setSort] = useState({ col, dir })

    function setSort(col) {
        if (sort.col !== col) {
            _setSort({ col, dir: 'asc' })
        } else if (sort.dir === 'asc') {
            _setSort({ col, dir: 'desc' })
        } else {
            _setSort({ col: null, dir: null })
        }
    }

    return [sort, setSort]
}

function useFilters(defaultFilters) {
    const [filters, _setFilters] = useState(defaultFilters)

    function setFilters(col, value) {
        if (value !== '') _setFilters({ ...filters, [col.accessor]: value })
        else {
            const _filters = { ...filters }
            delete _filters[col.accessor]
            _setFilters(_filters)
        }
    }

    return [filters, setFilters]
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

export function useTable({
    sortable = false,
    filterable = false,
    editable = false,
    onRefresh = emptyFn,
    onChange = emptyFn,
    columns = [],
    items = [],
    defaultSort = '',
    defaultFilter = {}
} = {}) {
    const footer = ''

    const [sort, setSort] = useSort(defaultSort, sortable)
    const [filters, setFilters] = useFilters(defaultFilter, filterable)
    const [edition, setEdition] = useEdition({ col: null, item: null }, editable)

    useEffect(() => {
        onRefresh({ sort, filters })
    }, [onRefresh, sort, filters])

    function _onSort(column) {
        if (sortable) {
            setSort(column.accessor)
        }
    }

    function _onFilter(column, value) {
        if (filterable) {
            setFilters(column, value)
        }
    }

    function _onChange(column, item, value) {
        if (editable) {
            setEdition(null, null)
            onChange({ ...item, [column.accessor]: value })
        }
    }

    function _onEdit(column, item) {
        if (editable) {
            setEdition(column, item)
        }
    }

    const headers = columns.map(column => renderHeader(column, sort, _onSort))

    const _filters = !filterable ? [] : columns.map(column => renderFilters(column, filters, _onFilter))

    const rows = items.map(item => columns.map(column => renderCell(column, item, edition, _onChange, _onEdit)))

    return { headers, filters: _filters, rows, footer }
}
