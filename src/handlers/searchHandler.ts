import { Request, Response } from "express";
import axios from "axios";
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const MOVIE_API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=`;

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genre_ids: number[]; 
  homepage: string;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}


const getGenres = async (): Promise<Genre[]> => {
  try {
    const genreResponse = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}`);
    return genreResponse.data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const searchHandler = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ message: "Query parameter is required and should be a non-empty string." });
  }

  try {
    const genres = await getGenres();
    const response = await axios.get(`${MOVIE_API_URL}${query}`);
    if (!response.data || !Array.isArray(response.data.results)) {
      return res.status(500).json({ message: "Invalid data structure received from the movie API." });
    }

    
    const movies = response.data.results.map((movie: Movie) => {
      const movieGenres = Array.isArray(movie.genre_ids) && movie.genre_ids.length
        ? movie.genre_ids.map((genreId: number) => {
            const genreObj = genres.find((g) => g.id === genreId);
            return genreObj ? genreObj.name : 'Unknown Genre';
          }).join(', ')
        : 'No genres available'; 
      return {
        movie_id: movie.id,
        title: movie.title,
        release_year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
        rating: movie.vote_average,
        overview: movie.overview,
        tagline: movie.tagline || 'No tagline available',
        adult: movie.adult,
        genres: movieGenres,  
        posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null, // Ensure full image URL
      };
    });

    res.json({ movies });
  } catch (error) {
    console.error("Error fetching movies from API:", error);
    res.status(500).json({ message: "Error fetching movies from external API." });
  }
};
