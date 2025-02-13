import { Request, Response, NextFunction } from "express";
import { APP_SECRET } from "../DB.config";
import { UserAttributes, UserInstance } from "../model/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";

/**===================================== RIDERS AUTH ===================================== **/
// export const ridersAuth = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const authorization = req.headers.authorization
  
//       if (!authorization) {
//          res.status(401).json({
//           Error: "Kindly login"
//         });
//         return;
//       }
  
//       const token = authorization.slice(7, authorization.length);
//       let verified = jwt.verify(token, APP_SECRET)
  
//       if (!verified) {
//          res.status(401).json({
//           Error: "unauthorised"
//         });
//         return;
//       };
  
//       const { id } = verified as { [key: string]: string }
  
//       // find the user by id
//       const user = await UserInstance.findOne({
//         where: { id: id },
//       }) as unknown as UserAttributes;
  
//       if (!user) {
//          res.status(404).json({
//           Error: "User not found"
//         });
//         return;
//       }
  
//       if (user.role.toLowerCase() !== "rider" ) {
//         req.user = verified;
  
//       } else {
//          res.status(403).json({
//           Error: "Only Riders is allowed to perform this operation"
//         })
//       }
    
//        req.user = { id: user.id, role: user.role };

//       next();
//     } catch (err) {
//        res.status(500).json({
//         Error: "Internal server error", err
//       });
//     }
//   };

export const ridersAuth = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
  try {
      const authorization = req.headers.authorization;
      
      if (!authorization) {
          res.status(401).json({
              Error: "Kindly login"
          });
      }

      const token = authorization.slice(7, authorization.length);
      let verified = jwt.verify(token, APP_SECRET);

      if (!verified) {
          res.status(401).json({
              Error: "Unauthorised"
          });
      }

      const { id } = verified as { [key: string]: string };

      // find the user by id
      const user = await UserInstance.findOne({
          where: { id: id },
      }) as unknown as UserAttributes;

      if (!user) {
          res.status(404).json({
              Error: "User not found"
          });
      }

      if (user.role.toLowerCase() !== "rider" ) {
          req.user = verified;
          return next();
      } else {
          res.status(403).json({
              Error: "Only riders are allowed to perform this operation"
          });
      }
      next();
  } catch (err) {
      res.status(500).json({
          Error: "Internal server error", 
          err
      });
  }
};

/**===================================== DRIVERS AUTH ===================================== **/
export const driversAuth = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.headers.authorization
  
      if (!authorization) {
         res.status(401).json({
          Error: "Kindly login"
        });
        return;
      }
  
      const token = authorization.slice(7, authorization.length);
      let verified = jwt.verify(token, APP_SECRET)
  
      if (!verified) {
         res.status(401).json({
          Error: "unauthorised"
        });
        return;
      };
  
      const { id } = verified as { [key: string]: string }
  
      // find the user by id
      const user = await UserInstance.findOne({
        where: { id: id },
      }) as unknown as UserAttributes;
  
      if (!user) {
         res.status(404).json({
          Error: "User not found"
        });
        return;
      }
  
      if (user.role === "driver" ) {
        req.user = verified;
  
      } else {
         res.status(403).json({
          Error: "Only Drivers is allowed to perform this operation"
        })
      }
      next();
    } catch (err) {
       res.status(500).json({
        Error: "Internal server error", err
      });
    }
  };