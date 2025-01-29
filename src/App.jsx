import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 1500, // Smooth transition speed
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // Wait time between slides
    arrows: false, // Hides left & right arrows
    pauseOnHover: false, // Prevents pause on mouse hover
  };


  // Fetch trending movies (Top 5)
  const fetchTrendingMovies = async () => {
    try {
      const endpoint = `${API_BASE_URL}/trending/movie/day?language=en-US`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();
      setTrendingMovies(data.results.slice(0, 4)); // Show only top 5 trending movies
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  // Fetch movies (search or popular)
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        setMovieList([]);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMovieList(data.results || []);
    } catch (error) {
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch movies on initial load
  useEffect(() => {
    fetchMovies();
    fetchTrendingMovies();
  }, []);

  // Fetch movies when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchMovies(searchTerm);
    } else {
      fetchMovies(); // Show popular movies if search is empty
    }
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            {/* Movie Slider */}
            {trendingMovies.length > 0 && (
              <Slider {...settings}>
                {trendingMovies.map((movie) => (
                  <div key={movie.id}>
                    <img
                      src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                      className="w-full h-[400px] object-cover rounded-lg"
                    />

                  </div>
                ))}
              </Slider>
            )}

            <h1>
              Find
              <span className="text-gradient"> Movies </span>
              {` You'll Enjoy Without the Hassle`}
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {/* Trending Movies Section */}
          {!searchTerm && (
            <section className="all-movies">
              <h2 className="mt-[40px]">Trending Now</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            </section>
          )}

          {/* Popular / Searched Movies Section */}
          <section className="all-movies">
            <h2 className="mt-[40px]">
              {searchTerm ? `Search Results for "${searchTerm}"` : "Popular"}
            </h2>

            {isLoading ? (
              <div className="text-white flex items-center justify-center">
                <Spinner />
              </div>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movieList.length > 0 ? (
                  movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))
                ) : (
                  <p className="text-white">No movies found.</p>
                )}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
