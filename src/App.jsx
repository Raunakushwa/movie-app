import { useEffect, useState } from 'react'
import {useDebounce} from 'react-use';
import './App.css'
import './index.css'
import Search from './components/search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {updateSearchCount} from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, seterrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm]=useState('');

  useDebounce(()=>setDebouncedSearchTerm(searchTerm),500,[searchTerm])

  const API_OPTIONS = {
    method: 'get',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  }

  const fetchMovies = async (query='') => {
    setisLoading(true);
    seterrorMessage('');

    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to get movies')
      }

      const data = await response.json();
      if (data.Response === false) {
        seterrorMessage(data.error || 'Failed to get movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    }


    catch (error) {

      console.log(`Error fetching movies: ${error}`);
    }
    finally{
      setisLoading(false);
    }

  }



  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])

  return (
    <>
      <main>
        <div className='pattern' >
          <div className='wrapper' >
            <header>
              <img src="./hero-img.png" alt="hero Banner" />
              <h1>Find <span className='text-gradient' >Movies</span> You will enjoy without Hassle</h1>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>

            <section className='all-movies'>
              <h2 className='mt-[40px]'>All movies</h2>


              {isLoading ? (
                <Spinner />
              ): errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ):(
                <ul>
                  {movieList.map((movie)=>(
                  <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}

            </section>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
