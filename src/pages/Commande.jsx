/* eslint-disable react/prop-types */
import { Button } from "@/src/components/ui/button"
import axios from 'axios';
import {useEffect,  useState} from 'react'
import { ArrowUpDown, InfoIcon, PlusCircleIcon } from "lucide-react"
import {flexRender,getCoreRowModel,getFilteredRowModel,getPaginationRowModel,getSortedRowModel,useReactTable} from "@tanstack/react-table"
import { clsx } from 'clsx';
import { buttonVariants } from '@/src/components/ui/button';
import {Table,TableBody,TableCell,TableHead, TableHeader,TableRow} from "@/src/components/ui/table"
import { Input } from "../components/ui/input";
import { Badge } from "@/src/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
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
    header: "Prix total",
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
                <strong dangerouslySetInnerHTML={{__html: product.produit.post_title}} /> 
              </div>
            )
          : products.length < 2 ? 
          products.map((product, key) => 
              <div key={key}>
                <strong dangerouslySetInnerHTML={{__html: product.produit.post_title}} /> 
              </div>
            )
          : products.slice(0,3).map((product, key) => 
            <div key={key}>
              <strong dangerouslySetInnerHTML={{__html: product.produit.post_title}} /> 
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
  const [detail, setDetail] = useState()
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
  const handleStatus = async (id, products) => {
    console.log("data", products)

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
  const showDetail = (id) => {
    const filteredItems = data.filter(item => item.ID === id);
    setDetail(filteredItems[0]); 
    console.log(filteredItems[0])
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
                      key == 5 ? '' : 
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
                    key == 5 ? '' : 
                    <TableCell key={cell.id}>
                      {key == 1 ? 
                      <Products products={cell.row.original?.products} /> : 
                      key == 3 ?
                      <div>
                        <PriceTotal priceFront={cell.row.original.prixTotal} products={cell.row.original.products} />
                      </div> :
                      key == 4 ? 
                      <div className="flex gap-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => showDetail(cell.row.original.ID)} 
                              className={clsx(buttonVariants({variant: 'secondary'}))} 
                              disabled={cell.row.original.post_status == 'publish'}>
                              Voir +
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Commande de {detail && detail.post_title }</DialogTitle>
                              <DialogDescription>
                                <h2 className="text-lg">Listes films, séries, dramas ou animes</h2>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="content grid gap-2">
                              {detail && detail.products && detail.products.map((product, key) => (
                                <div key={key} className="flex justify-between">
                                  <h3 dangerouslySetInnerHTML={{__html: product.produit.post_title}} className="basis-1/2" />
                                  <p className="basis-1/4">Saison {product.saisons}</p>
                                  <strong className="text-right basis-1/4">{parseInt(product.price) * product.saisons.split(',').length}Ar</strong>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between mt-4">
                              <h3 className="basis-1/4 ml-auto"><strong>Prix total</strong></h3>
                              <strong className="text-right basis-1/4">{detail && detail.prixTotal}Ar</strong>
                            </div>
                            <DialogFooter>
                              {/* <Button type="submit">Save changes</Button> */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button className={clsx(buttonVariants({variant: 'destructive'}))} disabled={cell.row.original.post_status == 'publish'}>
                                    Valider
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tu es sûr ?</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatus(cell.row.original.ID, detail.products)}>Confirmer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {/* <button data-modal-target="default-modal" data-modal-toggle="default-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
                          Toggle modal
                        </button> */}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className={clsx(buttonVariants({variant: 'destructive'}))} disabled={cell.row.original.post_status == 'publish'}>
                              Valider
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tu es sûr ?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStatus(cell.row.original.ID, cell.row.original?.products)}>Confirmer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div> : 
                      key == 5 ? 
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
    </div>
  )
}
const PriceTotal = ({priceFront, products}) => {
  if (!products) return <strong>{priceFront} Ar</strong>

  let prixTotalBack = products.reduce((acc, product) => {
    if (!product) {
      return acc
    }
    return acc + (parseInt(product.price) * product.saisons.split(',').length )
  }, 0)
  if (priceFront != prixTotalBack) {
    return (
      <div className="flex space-x-2 items-center">
        <strong>{prixTotalBack} Ar</strong>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon color="red"/>
            </TooltipTrigger>
            <TooltipContent>
              <p>Le prix fourni par le client n&apos;est pas le même que celui dans notre base de données.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  } else {
    return <strong>{prixTotalBack} Ar</strong>
  }
}
export default Commande