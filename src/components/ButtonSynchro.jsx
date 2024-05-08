import {useState, useEffect} from 'react'
import { Button } from "@/src/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/src/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Progress } from "@/src/components/ui/progress"

import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

const ButtonSynchro = ({setData, className}) => {
    const [pending, setPending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [page, setPage] = useState(0);
    const [category, setCategory] = useState("movie/now_playing");
    const lanceSynchro = (e) => {
      
      e.preventDefault();
      setPending(true);
      setProgress(0);
  
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzQzYmRhMTViZjgwNjU2MTEyZjQzMWVkYjFiY2M3NiIsInN1YiI6IjY1YTRmM2Q3OGEwZTliMDEyZWI0NjE3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZJc_GUl1LWfmJovPq51s3MiFuwsKAaQeGH6YXQSRjUI`
        }
      };
  
      fetch(`https://api.themoviedb.org/3/${category}?language=fr-FR${page > 0 ? '&page=' + page : ''}`, options)
        .then(response => {
          if (!response.ok) {
            throw new Error('La requête fetch a échoué');
          }
          return response.json();
        })
        .then(response => {
          const totalRequests = response.results.length;
          let completedRequests = 0;
          console.log(response.results)
          const apiUrl = `http://localhost/wordpress/wp-json/hqfastservice/v1/create-products`;
          response.results.forEach(result => {
            console.log(result)
            fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: result
              })
            })
            .then(response => {
              completedRequests++;
              const newProgress = Math.floor((completedRequests / totalRequests) * 100);
              setProgress(newProgress);
  
              if (!response.ok) {
                throw new Error('La réponse du réseau n\'était pas ok');
              }
              return response.json();
            })
            .then(data => {
              setData(data.data)
            })
            .catch(error => {
              console.error('Erreur lors de l\'envoi des données:', error);
            })
            .finally(() => {
              if (completedRequests === totalRequests) {
                setPending(false);
              }
            });
          });
        })
        .catch(err => {
          console.error(err);
          setPending(false);
        });
    }
    const [date, setDate] = useState({
      from: new Date(),
      to: addDays(new Date(2022, 0, 20), 20),
    })
    const handleChangeCategory = (value) => {
      setCategory(value)
      if (value == 'movie/now_playing') {
        setPage(1)
      } else {
        setPage(0)
      }
    }
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={pending}>Synchronisation</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <Progress value={progress} className="w-full mb-5" />
            <DialogTitle>
              <p className="text-center">
                Synchronisation vers l&apos;api tmbd
              </p>
              <p>{category}</p>
              <p>{page}</p>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Page : 
              </Label>
              <Input type="number" value={page} placeholder="Page" onChange={(e) => setPage(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Catégorie: 
              </Label>
              <Select onValueChange={(value) => handleChangeCategory(value)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper" >
                  <SelectItem value="movie/now_playing">Film</SelectItem>
                  <SelectItem value="tv/latest">Série</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Date
              </Label>
              <div className={cn("grid gap-2", className)}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={(e) => lanceSynchro(e)} >
              {pending ? 'Chargement...' : 'Lancer la synchronisation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

export default ButtonSynchro
