import React from "react";

// Generic column definition
export interface TableColumn<T> {
  key: string; // unique key referencing field
  header: React.ReactNode; // header label / node
  render?: (row: T) => React.ReactNode; // custom cell renderer
  className?: string; // tailwind classes for <td>
  headerClassName?: string; // tailwind classes for <th>
  hideOnMobile?: boolean; // if true column hidden on small screens
  // optional short label for mobile stacked view
  mobileLabel?: React.ReactNode;
  sortable?: boolean; // exibe botão de ordenação
  sortKey?: string; // chave usada na ordenação se diferente de key
}

export interface TableGroup<T> {
  id: string; // group id
  title: React.ReactNode; // group title
  rows: T[];
}

export interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  groups?: TableGroup<T>[]; // when provided table renders group header rows
  rows?: T[]; // flat rows alternative to groups
  zebra?: boolean;
  loading?: boolean;
  loadingSkeletonRows?: number; // number of skeleton rows
  getRowKey: (row: T) => string;
  /** Optional row level classes (e.g., completed, inactive) */
  getRowClassName?: (row: T) => string;
  /** Optional actions region (rightmost column) */
  renderActions?: (row: T) => React.ReactNode;
  /** Collapse state mapping by group id */
  collapsed?: Record<string, boolean>;
  onToggleGroup?: (groupId: string) => void;
  emptyMessage?: React.ReactNode;
  /** When true small screens (<sm) render cards stacked instead of horizontal scroll */
  mobileCards?: boolean;
  /** Optional aria label for table */
  ariaLabel?: string;
  /** Controle de ordenação atual para cabeçalhos sortables */
  currentSortKey?: string;
  currentSortDir?: "asc" | "desc";
  onToggleSort?: (key: string) => void;
}

/**
 * ResponsiveTable centraliza lógica das páginas de tarefas.
 * Mobile (<sm): se mobileCards=true, substitui <table> por lista de cards exibindo pares label/valor.
 * Desktop: tabela tradicional com cabeçalho, grupos colapsáveis e coluna de ações.
 */
export function ResponsiveTable<T>(props: ResponsiveTableProps<T>) {
  const {
    columns,
    groups,
    rows,
    zebra = true,
    loading = false,
    loadingSkeletonRows = 5,
    getRowKey,
    getRowClassName,
    renderActions,
    collapsed = {},
    onToggleGroup,
    emptyMessage = <span className="text-gray-500">Nenhum item</span>,
    mobileCards = true,
    ariaLabel,
  } = props;

  const hasGroups = !!groups && groups.length > 0;
  const flat = !!rows && rows.length > 0;
  const isEmpty = !loading && !hasGroups && !flat;

  // Mobile card layout
  // Hidden on >= sm when table visible
  if (mobileCards) {
    return (
      <div className="w-full">
        <div className="sm:hidden space-y-3">
          {loading && (
            <div className="space-y-2" aria-busy>
              {[...Array(loadingSkeletonRows)].map((_, i) => (
                <div
                  key={`sk-mobile-${i}`}
                  className="animate-pulse rounded border p-3 mobile-card-skeleton"
                >
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}
          {!loading &&
            hasGroups &&
            groups!.map((g) => (
              <div key={g.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => onToggleGroup?.(g.id)}
                  className="flex w-full items-center justify-between rounded border px-3 py-2 text-xs font-semibold mobile-group-btn"
                  aria-expanded={!collapsed[g.id]}
                >
                  <span>{g.title}</span>
                  <span className="ml-2 text-[10px] text-gray-500">
                    {g.rows.length} itens
                  </span>
                </button>
                {!collapsed[g.id] && (
                  <div className="space-y-3">
                    {g.rows.map((row) => (
                      <MobileCard
                        key={getRowKey(row)}
                        row={row}
                        columns={columns}
                        getRowClassName={getRowClassName}
                        renderActions={renderActions}
                      />
                    ))}
                    {g.rows.length === 0 && (
                      <div className="text-center text-xs text-gray-500 py-4">
                        {emptyMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          {!loading && flat && (
            <div className="space-y-3">
              {rows!.map((row) => (
                <MobileCard
                  key={getRowKey(row)}
                  row={row}
                  columns={columns}
                  getRowClassName={getRowClassName}
                  renderActions={renderActions}
                />
              ))}
            </div>
          )}
          {isEmpty && (
            <div className="text-center text-xs text-gray-500 py-8">
              {emptyMessage}
            </div>
          )}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded border surface-alt">
          <table className="min-w-full text-xs" aria-label={ariaLabel}>
            <thead className="table-head uppercase text-[10px]">
              <tr>
                {columns.map((c) => {
                  const sk = c.sortKey || c.key;
                  const isSorted = c.sortable && props.currentSortKey === sk;
                  const dir = props.currentSortDir;
                  return (
                    <th
                      key={c.key}
                      className={`px-3 py-2 text-left ${
                        c.headerClassName || ""
                      }`}
                      aria-sort={
                        isSorted
                          ? dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      {c.sortable ? (
                        <button
                          type="button"
                          onClick={() => props.onToggleSort?.(sk)}
                          className="inline-flex items-center gap-1 sort-btn"
                        >
                          <span>{c.header}</span>
                          {isSorted && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              aria-hidden="true"
                              className="opacity-70"
                            >
                              {dir === "asc" ? (
                                <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                              ) : (
                                <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                              )}
                            </svg>
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
                {renderActions && <th className="px-3 py-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {loading &&
                [...Array(loadingSkeletonRows)].map((_, i) => (
                  <tr key={`sk-${i}`} className="border-t">
                    <td
                      className="px-3 py-3"
                      colSpan={columns.length + (renderActions ? 1 : 0)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading &&
                hasGroups &&
                groups!.map((g) => (
                  <React.Fragment key={g.id}>
                    <tr className="surface-accent select-none">
                      <td
                        colSpan={columns.length + (renderActions ? 1 : 0)}
                        className="px-3 py-2 subtitle"
                      >
                        <button
                          onClick={() => onToggleGroup?.(g.id)}
                          className="mr-2 inline-flex items-center justify-center rounded border px-2 py-0.5 text-[10px] btn-invert"
                          aria-label={
                            collapsed[g.id]
                              ? "Expandir grupo"
                              : "Colapsar grupo"
                          }
                        >
                          {collapsed[g.id] ? "+" : "−"}
                        </button>
                        {g.title}
                        <span className="ml-2 text-[10px] text-subtle">
                          {g.rows.length} itens
                        </span>
                      </td>
                    </tr>
                    {!collapsed[g.id] &&
                      g.rows.map((row, idx) => {
                        const rowCls = getRowClassName?.(row) || "";
                        return (
                          <tr
                            key={getRowKey(row)}
                            className={`${
                              zebra ? "table-row table-row-zebra" : ""
                            } row-hover ${rowCls}`}
                          >
                            {columns.map((c) => (
                              <td
                                key={c.key}
                                className={`px-3 py-1 ${c.className || ""}`}
                              >
                                {c.render ? c.render(row) : (row as any)[c.key]}
                              </td>
                            ))}
                            {renderActions && (
                              <td className="px-3 py-1 text-xs space-x-1">
                                {renderActions(row)}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    {!collapsed[g.id] && g.rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={columns.length + (renderActions ? 1 : 0)}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          {emptyMessage}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              {!loading &&
                flat &&
                rows!.map((row) => {
                  const rowCls = getRowClassName?.(row) || "";
                  return (
                    <tr
                      key={getRowKey(row)}
                      className={`${
                        zebra ? "table-row table-row-zebra" : ""
                      } row-hover ${rowCls}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`px-3 py-1 ${c.className || ""}`}
                        >
                          {c.render ? c.render(row) : (row as any)[c.key]}
                        </td>
                      ))}
                      {renderActions && (
                        <td className="px-3 py-1 text-xs space-x-1">
                          {renderActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              {!loading && isEmpty && (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback: only table (no mobile card adaptation)
  return (
    <div className="overflow-x-auto rounded border surface-alt">
      <table className="min-w-full text-xs" aria-label={ariaLabel}>
        <thead className="table-head uppercase text-[10px]">
          <tr>
            {columns.map((c) => {
              const sk = c.sortKey || c.key;
              const isSorted = c.sortable && props.currentSortKey === sk;
              const dir = props.currentSortDir;
              return (
                <th
                  key={c.key}
                  className={`px-3 py-2 text-left ${c.headerClassName || ""}`}
                  aria-sort={
                    isSorted
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => props.onToggleSort?.(sk)}
                      className="inline-flex items-center gap-1 sort-btn"
                    >
                      <span>{c.header}</span>
                      {isSorted && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                          className="opacity-70"
                        >
                          {dir === "asc" ? (
                            <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                          ) : (
                            <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                          )}
                        </svg>
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
            {renderActions && <th className="px-3 py-2">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {loading &&
            [...Array(loadingSkeletonRows)].map((_, i) => (
              <tr key={`sk-${i}`} className="border-t">
                <td
                  className="px-3 py-3"
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </td>
              </tr>
            ))}
          {!loading &&
            hasGroups &&
            groups!.map((g) => (
              <React.Fragment key={g.id}>
                <tr className="surface-accent select-none">
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-3 py-2 subtitle"
                  >
                    <button
                      onClick={() => onToggleGroup?.(g.id)}
                      className="mr-2 inline-flex items-center justify-center rounded border px-2 py-0.5 text-[10px] btn-invert"
                      aria-label={
                        collapsed[g.id] ? "Expandir grupo" : "Colapsar grupo"
                      }
                    >
                      {collapsed[g.id] ? "+" : "−"}
                    </button>
                    {g.title}
                    <span className="ml-2 text-[10px] text-subtle">
                      {g.rows.length} itens
                    </span>
                  </td>
                </tr>
                {!collapsed[g.id] &&
                  g.rows.map((row) => {
                    const rowCls = getRowClassName?.(row) || "";
                    return (
                      <tr
                        key={getRowKey(row)}
                        className={`${
                          zebra ? "table-row table-row-zebra" : ""
                        } row-hover ${rowCls}`}
                      >
                        {columns.map((c) => (
                          <td
                            key={c.key}
                            className={`px-3 py-1 ${c.className || ""}`}
                          >
                            {c.render ? c.render(row) : (row as any)[c.key]}
                          </td>
                        ))}
                        {renderActions && (
                          <td className="px-3 py-1 text-xs space-x-1">
                            {renderActions(row)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                {!collapsed[g.id] && g.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + (renderActions ? 1 : 0)}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          {!loading &&
            flat &&
            rows!.map((row) => {
              const rowCls = getRowClassName?.(row) || "";
              return (
                <tr
                  key={getRowKey(row)}
                  className={`${
                    zebra ? "table-row table-row-zebra" : ""
                  } row-hover ${rowCls}`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-1 ${c.className || ""}`}
                    >
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-3 py-1 text-xs space-x-1">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          {!loading && isEmpty && (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="px-3 py-6 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface MobileCardProps<T> {
  row: T;
  columns: TableColumn<T>[];
  getRowClassName?: (row: T) => string;
  renderActions?: (row: T) => React.ReactNode;
}

function MobileCard<T>({
  row,
  columns,
  getRowClassName,
  renderActions,
}: MobileCardProps<T>) {
  return (
    <div
      className={`rounded border p-3 mobile-card ${
        getRowClassName?.(row) || ""
      }`}
    >
      <div className="space-y-1 text-[13px]">
        {columns
          .filter((c) => !c.hideOnMobile)
          .map((c) => (
            <div key={c.key} className="flex justify-between gap-2">
              <span className="font-medium">{c.mobileLabel || c.header}</span>
              <span className="text-right text-mobile-value">
                {c.render ? c.render(row) : (row as any)[c.key]}
              </span>
            </div>
          ))}
      </div>
      {renderActions && (
        <div className="mt-3 flex flex-wrap gap-2">{renderActions(row)}</div>
      )}
    </div>
  );
}

export default ResponsiveTable;
