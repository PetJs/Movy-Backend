import { Request, Response } from "express";
import axios from "axios";
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const ACTION_GENRE_API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&with_genres=28&sort_by=popularity.desc`;


interface ActionMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    popularity: number;
    vote_average: number;
    vote_count: number;
    release_date: string;
    backdrop_path: string | null;
    poster_path: string | null;
}

export const actionMoviesHandler = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(ACTION_GENRE_API_URL);

    if (!response.data || !Array.isArray(response.data.results)) {
      return res.status(500).json({ message: "Invalid data structure received from the Trending Movies API." });
    }

    const actionMovies = response.data.results.map((movie: ActionMovie) => ({
      movie_id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      popularity: movie.popularity,
      rating: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date || 'N/A',
      posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : null,
    }));

    res.json({ actionMovies });
  } catch (error) {
    console.error("Error fetching trending movies from API:", error);
    res.status(500).json({ message: "Error fetching trending movies from external API." });
  }
};