import { Request, Response } from "express";
import fs from "node:fs";
function log(req: Request, res: Response, next) {
  const content = `Method: ${req.method}, Path: ${
    req.path
  }, Time: ${new Date().toLocaleString()} \n`;

  fs.appendFile("./src/logs/logs.txt", content, (err) => {});
  next();
}
// function verifyToken(req: Request, res: Response, next) {
//   next();
// }

export default log;
