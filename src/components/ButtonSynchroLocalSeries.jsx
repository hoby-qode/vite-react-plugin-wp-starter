import { Button } from '@/src/components/ui/button'
import { useState } from 'react'
import data from '../../public/listSeriesWithLastInfo.json' // Importe directement le fichier JSON

const ButtonSynchroLocalSeries = ({ onChangeData, prevData }) => {
  const [pending, setPending] = useState(false)
  const [progress, setProgress] = useState(0)
  const apiUrl = `http://localhost/wordpress/wp-json/hqfastservice/v1/create-products`
  const dataResponse = []
  const lanceSynchro = async (e) => {
    e.preventDefault()
    setPending(true)

    try {
      let completedRequests = 0
      const totalRequests = data.length

      // Utilise Promise.all() pour attendre que toutes les requêtes soient terminées
      await Promise.all(
        data.map(async (result) => {
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: result,
              }),
            })

            if (!response.ok) {
              throw new Error("La réponse du réseau n'était pas ok")
            }

            const responseData = await response.json()
            // if (prevData.length == 0) {
            //   console.log('responseData', responseData)
            // } else {
            //   onChangeData([...prevData, responseData])
            //   console.log('prevData', prevData)
            // }

            // setData(responseData);
          } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error)
          } finally {
            completedRequests++
            const newProgress = Math.floor(
              (completedRequests / totalRequests) * 100,
            )
            setProgress(newProgress)

            if (completedRequests === totalRequests) {
              setPending(false)
            }
          }
        }),
      )
    } catch (error) {
      console.error('Erreur lors de la synchronisation locale :', error)
      // Gérer les erreurs ici
      setPending(false)
    }
  }

  return (
    <Button onClick={lanceSynchro}>
      {pending ? 'Chargement...' : 'Synchronisation locale séries'}&nbsp;
      {progress != 0 ? progress + ' %' : ''}
    </Button>
  )
}

export default ButtonSynchroLocalSeries
