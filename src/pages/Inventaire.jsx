import { useState, useEffect } from 'react';
import axios from 'axios';

const Inventaire = () => {
  const url = `http://localhost/wordpress/wp-json/hqfastservice/v1/products`;
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
//   const api_key= '7343bda15bf80656112f431edb1bcc76';
  const handleStatusAllProduct = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const idsProducts = formData.getAll('post[]')
    idsProducts.map((e) => handleStatus(e))
  }
  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const lanceSynchro = (e) => {
    setLoading(false)
    e.preventDefault()

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
          console.log(data); // Succès de l'envoi des données
        })
        .catch(error => {
          console.error('Erreur lors de l\'envoi des données:', error);
        });
      })
      .catch(err => console.error(err));
      fetchData()
      setLoading(true) 
  }
  const handleStatus = async (id) => {
    try {
        await axios.post(`http://localhost/wordpress/wp-json/hqfastservice/v1/change-status-product`, 
        {
          productId : id
        }
      )
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <div style={{textAlign: 'right'}}>
        <button onClick={(e) => lanceSynchro(e)} style={{background: 'hsl(26deg 99% 60%)',
                                border: 0,
                                padding: '10px 15px',
                                lineHeight: 1,
                                color: "white",
                                cursor: "pointer"}}>
          {!loading ? 'Lancé la synchronisation' : 'loading...'}
        </button>
      </div>
      <form style={{marginTop: '20px'}}  onSubmit={(e) => handleStatusAllProduct(e)}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
          <div className="alignleft actions bulkactions" style={{marginTop: 'auto'}}>
            <label htmlFor="bulk-action-selector-top" className="screen-reader-text">Select bulk action</label>
            <select name="action" id="bulk-action-selector-top">
              <option value="-1">Action en masse</option>
              <option value="make-all-dispo" className="hide-if-no-js">Disponible</option>
            </select>
            <input type="submit" id="doaction" className="button action" value="Apply" style={{marginLeft: '10px'}} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            
            Dernière synchro : 11/01/2024 13:35
          </div>
        </div>
        <table className="wp-list-table widefat fixed striped table-view-list posts">
          <caption className="screen-reader-text">Table ordered by Date. Descending.</caption>	
          <thead>
            <tr>
              <td id="cb" className="manage-column column-cb check-column">
                <input id="cb-select-all-1" type="checkbox" />
                <label htmlFor="cb-select-all-1">
                  <span className="screen-reader-text">Select All</span>
                </label>
              </td>
              <th scope="col" id="title" className="manage-column column-title column-primary sortable desc" abbr="Title">
                  <span>Title</span>
              </th>
              <th scope="col" id="taxonomy-category_product" className="manage-column column-taxonomy-category_product">Synopsis</th>
              <th scope="col" id="taxonomy-hq_tags" className="manage-column column-taxonomy-hq_tags">Tags</th>
              <th scope="col" id="post-publish" className="manage-column column-publish">Disponibilité</th>
            </tr>
          </thead>
          
          <tbody id="the-list">
            {!loading && data.map((e, key)=> (
              <tr key={key} id={`${e.post_type}-${e.ID}`} className={`iedit author-self level-0 ${e.post_type}-${e.ID} type-${e.post_type} status-${e.post_status} hentry category_product-dramas hq_tags-romantique`}>
                <th scope="row" className="check-column">			
                  <input id={`cb-select-${e.id}`} type="checkbox" name="post[]" value={e.ID} />
                  <label htmlFor={`cb-select-${e.ID}`}>
                    <span className="screen-reader-text">
                    Select {e.post_title}				</span>
                  </label>
                  <div className="locked-indicator">
                    <span className="locked-indicator-icon" aria-hidden="true"></span>
                    <span className="screen-reader-text">
                    {e.post_title} is locked				</span>
                  </div>
                </th>
                <td className="title column-title has-row-actions column-primary page-title" data-colname="Title">
                  <div className="locked-info"><span className="locked-avatar"></span> <span className="locked-text"></span></div>
                  <strong><a className="row-title" href={`http://localhost/wordpress/products/${e.post_name}/`} aria-label="{e.post_title} (Edit)">{e.post_title}</a></strong>
                  <div className="hidden" id="inline_50">
                    <div className="post_title">{e.post_title}</div>
                    <div className="post_name">{e.post_name}</div>
                    <div className="post_author">1</div>
                    <div className="comment_status">closed</div>
                    <div className="ping_status">closed</div>
                    <div className="_status">publish</div>
                    <div className="jj">05</div>
                    <div className="mm">01</div>
                    <div className="aa">2024</div>
                    <div className="hh">13</div>
                    <div className="mn">57</div>
                    <div className="ss">03</div>
                    <div className="post_password"></div>
                    <div className="page_template">default</div>
                    <div className="tags_input" id="category_product_50">Dramas</div>
                    <div className="tags_input" id="hq_tags_50">Romantique</div>
                    <div className="sticky"></div>
                    </div>
                    <div className="row-actions">
                      <span className="view">
                        <a href={`http://localhost/wordpress/products/${e.post_name}/`} rel="bookmark" aria-label={`View “${e.post_title}”`}> View</a>
                      </span>
                    </div>
                    <button type="button" className="toggle-row">
                      <span className="screen-reader-text">Show more details</span>
                    </button>
                  </td>
                  <td className="taxonomy-category_product column-taxonomy-category_product" data-colname="Synopsis">
                    <div dangerouslySetInnerHTML={{__html: e.post_content.slice(0, 150)}} />
                  </td>
                  <td className="taxonomy-hq_tags column-taxonomy-hq_tags" data-colname="Tags">
                    <a href="edit.php?post_type=products&amp;hq_tags=romantique">Romantique</a>
                  </td>
                  <td className="taxonomy-hq_tags column-taxonomy-hq_tags" data-colname="Tags">
                    <button onClick={() => handleStatus(e.ID)}
                    style={{background: 'hsl( 242deg 96% 73%)',
                                    border: 0,
                                    padding: '10px 15px',
                                    lineHeight: 1,
                                    color: "white",
                                    cursor: "pointer"}}>
                    Disponible</button>
                  </td>
                </tr>
              ))}
          </tbody>

          

        </table>
      </form>
    </div>
  )
}

export default Inventaire