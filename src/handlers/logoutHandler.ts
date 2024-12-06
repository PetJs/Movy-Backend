import { Request, Response } from "express";

export const logOutHandler = async (req: Request, res: Response) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to destroy session", error: err });
        }
        res.status(200).json({ message: "Successfully logged out " });
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err });
  }
};
