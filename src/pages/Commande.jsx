/* eslint-disable react/prop-types */
import { Button } from "@/src/components/ui/button"
import axios from 'axios';
import {useEffect,  useState} from 'react'
import { ArrowUpDown, PlusCircleIcon } from "lucide-react"
import {flexRender,getCoreRowModel,getFilteredRowModel,getPaginationRowModel,getSortedRowModel,useReactTable} from "@tanstack/react-table"
import { clsx } from 'clsx';
import { buttonVariants } from '@/src/components/ui/button';
import {Popover,PopoverContent, PopoverTrigger} from "@/src/components/ui/popover";
import {Table,TableBody,TableCell,TableHead, TableHeader,TableRow} from "@/src/components/ui/table"
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup
} from "@/src/components/ui/select"
const Commande = () => {
  const url = `http://localhost/wordpress/wp-json/hqfastservice/v1/commande`;
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
    accessorKey: "post_title",
    header: "Nom du client",
  },
  {
    accessorKey: "products",
    header: "Produits",
  },
  {
    accessorKey: "post_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "",
    header: "Actions",
  },
  {
    accessorKey: "post_status",
    header: "Etat de commande",
  },
]

// eslint-disable-next-line react/prop-types
const Products = ({products}) => {
  const [isShowMore, setIsShowMore] = useState(false);
  return (
    <div>
      {
        products ?
          isShowMore ?  
            products.map((product, key) => 
              <div key={key}>
                <strong dangerouslySetInnerHTML={{__html: product.post_title}} /> 
              </div>
            )
          : products.length < 2 ? 
          products.map((product, key) => 
              <div key={key}>
                <strong dangerouslySetInnerHTML={{__html: product.post_title}} /> 
              </div>
            )
          : products.slice(0,3).map((product, key) => 
            <div key={key}>
              <strong dangerouslySetInnerHTML={{__html: product.post_title}} /> 
            </div>
          )
        : ''
      }
      {products && products.length > 3 ? <PlusCircleIcon onClick={() => setIsShowMore(!isShowMore)} style={{float: 'right'}}/> : ''}
    </div>
  )
}


function DataTable({
  columns,
  data,
  onChangeData
}) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    },
  })
  
  const handleStatus = async (id) => {
    if(confirm('Voulez-vous accepter la commande')) {
      try {
        const res = await axios.post(`http://localhost/wordpress/wp-json/hqfastservice/v1/change-status-commande`, {idCommande : id});
        if(res.status <= 200) {
          const filteredItems = data.filter(item => item.ID !== id);
          onChangeData(filteredItems); 
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  const DetailModal = ({data}) => {
    return (
      <>
        <button data-modal-target="default-modal" data-modal-toggle="default-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
          Toggle modal
        </button>

        <div id="default-modal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-2xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Terms of Service
                        </h3>
                        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-4 md:p-5 space-y-4">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                        </p>
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            The European Union&apos;s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                        </p>
                    </div>
                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
                        <button data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>
                    </div>
                </div>
            </div>
        </div>    
      </>
    )
  }
  const showDetail = async (id) => {
    try {
      const res = await axios.post(`http://localhost/wordpress/wp-json/wp/v2/commande`, {idCommande : id});
      if(res.status <= 200) {
        const filteredItems = data.filter(item => item.ID !== id);
        onChangeData(filteredItems); 
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    table.getColumn('post_status')?.setFilterValue("draft")
  },[])
  return (
    <div >
      <div className="flex items-center py-4 space-x-2">
        <Input className="max-w-sm" placeholder="Nom du client" value={(table.getColumn("post_title")?.getFilterValue()) ?? ''} onChange={(event) => table.getColumn('post_title')?.setFilterValue(event.target.value)}/>
        <div className="w-[200px]">
          <Select onValueChange={(value) => table.getColumn('post_status')?.setFilterValue(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Etat de commande" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  <span className="font-medium">Etat de commande</span>
                </SelectLabel>
                <SelectItem value="draft">
                  <span className="font-medium">En attente</span>
                </SelectItem>
                <SelectItem value="publish">
                  <span className="font-medium">Valider</span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
                {headerGroup.headers.map((header, key) => {
                  return (
                      key == 4 ? '' : 
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
                    <input id={`cb-select-${row.original.ID}`} type="checkbox" name="post[]" value={row.original.ID} />
                    <label htmlFor={`cb-select-${row.original.ID}`}>
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
                    key == 4 ? '' : 
                    <TableCell key={cell.id}>
                      {key == 1 ? 
                      <Products products={cell.row.original.products} /> : 
                      key == 3 ? 
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => handleStatus(cell.row.original.ID)} 
                          className={clsx(buttonVariants({variant: 'outline'}))} 
                          disabled={cell.row.original.post_status == 'publish'}>
                          Voir +
                        </Button>
                        <button data-modal-target="default-modal" data-modal-toggle="default-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                          Toggle modal
                        </button>
                        <Button onClick={() => handleStatus(cell.row.original.ID)} className={clsx(buttonVariants({variant: 'destructive'}))} disabled={cell.row.original.post_status == 'publish'}>
                          Valider
                        </Button>
                      </div> : 
                      key == 4 ? 
                      <div>
                        {cell.row.original.post_status}
                      </div> :
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
      <DetailModal />
    </div>
  )
}

export default Commande