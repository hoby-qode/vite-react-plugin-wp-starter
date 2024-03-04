/* eslint-disable react/prop-types */
import { Button } from "@/src/components/ui/button"
import axios from 'axios';
import React, {useEffect, useState} from 'react'
import { Badge } from "@/src/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { flexRender, getCoreRowModel, getPaginationRowModel,getSortedRowModel,useReactTable} from "@tanstack/react-table"
import { clsx } from 'clsx';
import { buttonVariants } from '@/src/components/ui/button';
import ButtonSynchro from './../components/ButtonSynchro';
import { Table, TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/src/components/ui/table"

const Synchronisation = () => {
  const url = `http://localhost/wordpress/wp-json/hqfastservice/v1/products`;
  const [data, setData] = useState({})
  
//   const api_key= '7343bda15bf80656112f431edb1bcc76';
  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
        <DataTable columns={columns} data={data} onChangeData={setData} />
    </div>
  )
}

const columns = [
  {
    accessorKey: "cover",
    header: "Cover",
  },
  {
    accessorKey: "post_title",
    header: "Titre",
  },
  {
    accessorKey: "post_content",
    header: "Synopsis",
  },
  {
    accessorKey: "post_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date de sortie
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Catégorie",
  },
  {
    accessorKey: "tag",
    header: "Genres",
  },
  {
    accessorKey: "post_author",
    header: "Disponibilité",
  },
]

function DataTable({
  columns,
  data,
  onChangeData
}) {
  const [sorting, setSorting] = React.useState([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })
  const handleStatusAllProduct = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const idsProducts = formData.getAll('post[]')
    idsProducts.map((e) => handleStatus(e))
  }
  const handleStatus = async (id) => {
    try {
      const res = await axios.post(`http://localhost/wordpress/wp-json/hqfastservice/v1/change-status-product`, {productId : id});
      if(res.status <= 200) {
        const filteredItems = data.filter(item => item.id !== id);
        onChangeData(filteredItems); 
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <form onSubmit={(e) => handleStatusAllProduct(e)} >
      <div className="flex align-middle mb-3 mt-5 justify-between">
        <div className="actions bulkactions">
          <label htmlFor="bulk-action-selector-top" className="screen-reader-text">Select bulk action</label>
          <select name="action" id="bulk-action-selector-top">
            <option value="-1">Action en masse</option>
            <option value="make-all-dispo" className="hide-if-no-js">Disponible</option>
          </select>
          <input type="submit" id="doaction" className="button action" value="Appliquer" style={{marginLeft: '10px'}} />
        </div>
        <ButtonSynchro prevData={data} setData={onChangeData} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead>
                  <input id="cb-select-all-1" type="checkbox" />
                  <label htmlFor="cb-select-all-1">
                    <span className="screen-reader-text">Select All</span>
                  </label>
                </TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  <TableCell>
                    <input id={`cb-select-${row.original.id}`} type="checkbox" name="post[]" value={row.original.id} />
                    <label htmlFor={`cb-select-${row.original.id}`}>
                      <span className="screen-reader-text">
                      Select {row.original.post_title}				</span>
                    </label>
                    <div className="locked-indicator">
                      <span className="locked-indicator-icon" aria-hidden="true"></span>
                      <span className="screen-reader-text">
                      {row.original.post_title} is locked				</span>
                    </div>
                  </TableCell>
                  {row.getVisibleCells().map((cell, key) => (
                    <TableCell key={cell.id}>
                      {
                      key == 0 ? <img src={cell.row.original.cover} alt={cell.row.original.post_title} width={80}/> : 
                      key == 2 ? <div dangerouslySetInnerHTML={{__html: cell.row.original.post_content.slice(0, 150)}} /> : 
                      key == 4 ? cell.row.original.categories.map((cat, key) => <Badge key={key} variant="outline" className={clsx('mr-2 mb-2')}>{cat.name}</Badge>) : 
                      key == 5 ? cell.row.original.tags.map((tag, key) => <Badge key={key} variant="secondary" className={clsx('mr-2 mb-2')}>{tag.name}</Badge>) : 
                      key == 6 ? <Button onClick={() => handleStatus(cell.row.original.id)} className={clsx(buttonVariants({variant: 'primary'}))}>
                      Disponible</Button> : 
                      flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précedent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </form>
  )
}
export default Synchronisation