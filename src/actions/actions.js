export async function synchroData() {
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
            console.log('data', data); // Succès de l'envoi des données
        })
        .catch(error => {
        console.error('Erreur lors de l\'envoi des données:', error);
        });
    })
    .catch(err => console.error(err));
}