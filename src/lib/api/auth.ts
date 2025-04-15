import { Request, Response } from 'express'
import { signUp, signIn } from '../mongodb'

export async function handleSignUp(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    console.log('SIGN UP INPUT:', { email, username, password }); // 👈 Log the input

    const result = await signUp(email, username, password);

    return res.status(201).json(result);
  } catch (error) {
    console.error('SIGN UP ERROR:', error); // 👈 Log the error
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to sign up',
    });
  }
}



export async function handleSignIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const result = await signIn(email, password)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : 'Failed to sign in',
    })
  }
}
