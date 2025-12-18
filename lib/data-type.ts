import type { ReactNode } from "react"

export type Accessor<T> =
  | keyof T
  | ((row: T) => unknown)

export interface Column<T> {
  header: string
  accessor: Accessor<T>
  cell?: (value: unknown, row?: T) => ReactNode
}
