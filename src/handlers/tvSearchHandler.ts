import { Request, Response } from "express";
import axios from "axios";
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const TV_API_URL = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.API_KEY}&query=`;

interface Genre {
  id: number;
  name: string;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
}

interface Season {
  season_number: number;
  episodes: Episode[];
}

interface TVShow {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
  seasons: Season[]; 
}

const getGenres = async (): Promise<Genre[]> => {
  try {
    const genreResponse = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.API_KEY}`);
    return genreResponse.data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

const getSeasonsAndEpisodes = async (showId: number): Promise<Season[]> => {
  try {
    const seasonsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.API_KEY}&append_to_response=season`);
    const seasons = seasonsResponse.data.seasons || [];

    const seasonDetails = await Promise.all(
      seasons.map(async (season: any) => {
        const episodesResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showId}/season/${season.season_number}?api_key=${process.env.API_KEY}`);
        const episodes = episodesResponse.data.episodes || [];
        return {
          season_number: season.season_number,
          episodes: episodes.map((episode: any) => ({
            id: episode.id,
            name: episode.name,
            overview: episode.overview,
            air_date: episode.air_date,
          })),
        };
      })
    );

    return seasonDetails;
  } catch (error) {
    console.error("Error fetching seasons and episodes:", error);
    return [];
  }
};

export const searchTVShowHandler = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ message: "Query parameter is required and should be a non-empty string." });
  }

  try {
    const genres = await getGenres();
    const response = await axios.get(`${TV_API_URL}${query}`);

    if (!response.data || !Array.isArray(response.data.results)) {
      return res.status(500).json({ message: "Invalid data structure received from the TV API." });
    }

    const movies = await Promise.all(
      response.data.results.map(async (show: TVShow) => {
        const showGenres = Array.isArray(show.genre_ids) && show.genre_ids.length
          ? show.genre_ids.map((genreId: number) => {
              const genreObj = genres.find((g) => g.id === genreId);
              return genreObj ? genreObj.name : 'Unknown Genre';
            }).join(', ')
          : 'No genres available';

        // Fetch seasons and episodes
        const seasons = await getSeasonsAndEpisodes(show.id);

        return {
          show_id: show.id,
          title: show.name,
          original_name: show.original_name,
          first_air_date: show.first_air_date || 'N/A',
          rating: show.vote_average,
          overview: show.overview,
          adult: show.adult,
          genres: showGenres,
          posterPath: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
          backdropPath: show.backdrop_path ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}` : null, 
          seasons, 
        };
      })
    );

    res.json({ movies });
  } catch (error) {
    console.error("Error fetching TV shows from API:", error);
    res.status(500).json({ message: "Error fetching TV shows from external API." });
  }
};
