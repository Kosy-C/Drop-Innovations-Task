import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { GeneratePassword, GenerateSalt, GenerateSignature, option, UserLoginSchema, UserRegisterSchema, validatePassword } from "../utils/utility";
import { UserAttributes, UserInstance } from "../model/userModel";
import { emailHtml, GenerateOTP, mailSent } from "../utils/notification";
import { FromAdminMail, userSubject } from "../DB.config";

/**===================================== CREATE USER ===================================== **/
export const RegisterUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const {
            role,
            email,
            password,
        } = req.body;

        const uuiduser = uuidv4();

        const validateResult = UserRegisterSchema.validate(req.body, option);
        if (validateResult.error) {
             res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
            return;
        }
        
        // Check if the user already exists
        const existingUser = await UserInstance.findOne({
            where: { email: email },
        }) as unknown as UserAttributes;

        if (existingUser) {
             res.status(400).json({
                error: "User with the given email already exists",
            });
            return;
        };

        //Generate salt
        const salt = await GenerateSalt();

        const userPassword = await GeneratePassword(password, salt);

        //Create User
        if (!existingUser) {
            const newUser = await UserInstance.create({
                id: uuiduser,
                email,
                password: userPassword,
                salt,
                role,
            }) as unknown as UserAttributes;

            let token = await GenerateSignature({
                id: newUser.id,
                email: newUser.email,
            });

             res.status(201).json({
                id: newUser.id,
                message: "User created successfully",
                token,
            });
        }
    } catch (err) {
        res.status(500).json({
            error: "Internal server Error", err,
            route: "/user/signup",
        });
    }
};

/**===================================== LOGIN USER ===================================== **/
export const UserLogin = async (req: JwtPayload, res: Response): Promise<void>  => {
    try {
        const { email, password } = req.body;

        const validateResult = UserLoginSchema.validate(req.body, option);
        if (validateResult.error) {
             res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
            return;
        }

        //check if the User exist
        const User = await UserInstance.findOne({
            where: { email: email },
        }) as unknown as UserAttributes;

        if (User) {
            //Validate password
            const isValidPassword = await validatePassword(
                password,
                User.password,
                User.salt
            );

            if (isValidPassword) {
                //Generate signature for user
                let token = await GenerateSignature({
                    id: User.id,
                    email: User.email,
                });
               

                // Example: Set a cookie with the token
                res.cookie("token", token);

                 res.status(200).json({
                    message: "Login Successful",
                    token,
                    id: User.id,
                    email: User.email,
                });
            } else {
                res.status(400).json({
                    Error: "Wrong email or password",
                });
            }
        }
         res.status(404).json({
            Error: `User with ${email} not found`,
        });
    } catch (err) {
        res.status(500).json({
            Error: "Internal server error", err,
            route: "/user/login",
        });
    }
};