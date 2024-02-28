import { Button } from "@/src/components/ui/button"
import axios from 'axios';
import React, {useEffect, useState} from 'react'
import { Badge } from "@/src/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import {useFormStatus} from 'react-dom'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
 
import { clsx } from 'clsx';
import { buttonVariants } from '@/src/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { cp } from "fs";

const Commande = () => {
  const url = `http://localhost/wordpress/wp-json/hqfastservice/v1/commande`;
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  
//   const api_key= '7343bda15bf80656112f431edb1bcc76';

  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      console.log(response)
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
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
    header: "Commande",
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
]


const Products = ({products}) => {
  return (
    <div>
      {products.map((product, key) => (
        <>
          <span dangerouslySetInnerHTML={{__html: product.post_title}} />, &nbsp;
        </>
      ))}
    </div>
  )
}
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
  return (
    <div >
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
                    <TableCell key={cell.id}>
                      {key == 1 ? 
                      <Products products={cell.row.original.products} /> : 
                      key == 3 ? <div className="flex gap-4"><Button onClick={() => showDetail(cell.row.original.ID)} className={clsx(buttonVariants({variant: 'secondary'}))}>
                      Voir</Button><Button onClick={() => handleStatus(cell.row.original.ID)} className={clsx(buttonVariants({variant: 'destructive'}))}>
                      Valider</Button></div> : 
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
const ButtonSynchro = ({prevData, setData}) => {
  const [pending, setPending] = useState(false);

  const lanceSynchro = (e) => {
    e.preventDefault();
    setPending(true);

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzQzYmRhMTViZjgwNjU2MTEyZjQzMWVkYjFiY2M3NiIsInN1YiI6IjY1YTRmM2Q3OGEwZTliMDEyZWI0NjE3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZJc_GUl1LWfmJovPq51s3MiFuwsKAaQeGH6YXQSRjUI'
      }
    };
    
    fetch('https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('La requête fetch a échoué');
        }
        return response.json();
      })
      .then(response => {
        const apiUrl = `http://localhost/wordpress/wp-json/hqfastservice/v1/create-products`;
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: response.results
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('La réponse du réseau n\'était pas ok');
          }
          return response.json();
        })
        .then(data => {
          console.log("data", data)
          console.log("response", response)
          setData(data.data)
        })
        .catch(error => {
          console.error('Erreur lors de l\'envoi des données:', error);
        })
        .finally(() => {
          setPending(false);
        });
      })
      .catch(err => {
        console.error(err);
        setPending(false);
      });
  }

  return (
    <Button onClick={(e) => lanceSynchro(e)} disabled={pending}>
      {pending ? 'Chargement...' : 'Lancer la synchronisation'}
    </Button>
  );
}
export default Commande