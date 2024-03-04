import {useState} from 'react'
import { Button } from "@/src/components/ui/button"

const ButtonSynchro = ({setData}) => {
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

export default ButtonSynchro