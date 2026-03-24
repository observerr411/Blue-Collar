import type { Request, Response } from 'express'
import { db } from '../db.js'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials', code: 401 })
  }
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...data } = user
  return res.status(202).json({ data, status: 'success', message: 'Login successful', code: 202, token })
}

export async function register(req: Request, res: Response) {
  const { email, password, firstName, lastName } = req.body
  const hashed = await argon2.hash(password)
  const user = await db.user.create({ data: { email, password: hashed, firstName, lastName } })
  const { password: _, ...data } = user
  return res.status(201).json({ data, status: 'success', message: 'Registration successful', code: 201 })
}

export async function logout(_req: Request, res: Response) {
  return res.status(200).json({ status: 'success', message: 'Logged out', code: 200 })
}

export async function forgotPassword(req: Request, res: Response) {
  // TODO: send reset email
  return res.status(200).json({ status: 'success', message: 'Reset link sent if account exists', code: 200 })
}

export async function resetPassword(req: Request, res: Response) {
  // TODO: validate token and update password
  return res.status(200).json({ status: 'success', message: 'Password reset successful', code: 200 })
}
