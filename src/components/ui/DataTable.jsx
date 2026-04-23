import EmptyState from './EmptyState';

// Universal data table. Columns are described declaratively so every
// admin table renders the same thead/tbody/padding/hover. Rows are
// passed as an array; `render` on a column lets callers project row
// data however they need (avatars, pill badges, action buttons, ...).
//
// columns: [
//   {
//     key:   'title',                 // used to pull row[key] when no render()
//     label: 'Title',                 // thead label
//     align: 'left' | 'right',        // default 'left'
//     width: string,                  // optional minWidth for the cell
//     render: (row) => <ReactNode>,   // full custom cell
//   },
// ]
//
// rows: any[]
// rowKey: (row) => string | number   — defaults to row.id
//
// loading / loadingContent — renders a spinner area instead of the tbody.
// empty / emptyState        — renders an EmptyState instead of tbody when rows is empty.
// onRowClick                — optional; makes rows hover+clickable.
//
// renderRow (escape hatch)  — if provided, DataTable stops rendering
//   <td>'s from columns[].render and instead calls renderRow(row) for
//   each row. Useful when an existing feature component (UserRow, JobRow)
//   already returns a full <tr>. In this mode `columns` is used only for
//   the thead labels.
export default function DataTable({
  columns,
  rows,
  rowKey = (r) => r.id,
  loading = false,
  loadingContent,
  emptyState,
  onRowClick,
  renderRow,
  className = '',
}) {
  const showEmpty = !loading && (!rows || rows.length === 0);

  return (
    <div className={`bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden ${className}`}>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          {loadingContent || (
            <div className="w-6 h-6 border-2 border-[#3E3D38] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      ) : showEmpty ? (
        emptyState || <EmptyState title="No results" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FDFCF8] text-left">
              <tr className="text-[10px] text-[#9A9A94] uppercase tracking-wider">
                {columns.map((c) => (
                  <th
                    key={c.key || c.label}
                    className={`py-3 px-4 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}
                    style={c.width ? { minWidth: c.width } : undefined}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                renderRow
                  ? <RowWrapper key={rowKey(row)}>{renderRow(row)}</RowWrapper>
                  : (
                    <tr
                      key={rowKey(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`border-t border-[#F0EBE3] ${
                        onRowClick ? 'hover:bg-[#FDFCF8] cursor-pointer' : 'hover:bg-[#FDFCF8]'
                      }`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key || c.label}
                          className={`py-3 px-4 ${c.align === 'right' ? 'text-right' : ''}`}
                        >
                          {c.render ? c.render(row) : row[c.key]}
                        </td>
                      ))}
                    </tr>
                  )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// renderRow returns its own <tr>, so we just pass it through. This
// wrapper exists only to give the map a stable key location.
function RowWrapper({ children }) { return children; }
