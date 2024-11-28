import { Request, Response } from "express";
export declare const watchlistHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getWatchlistHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
