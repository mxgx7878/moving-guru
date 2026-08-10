import EmptyState from './EmptyState';

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
            <thead className="bg-[#FFFFFF] text-left">
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
                        onRowClick ? 'hover:bg-[#FFFFFF] cursor-pointer' : 'hover:bg-[#FFFFFF]'
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

function RowWrapper({ children }) { return children; }
