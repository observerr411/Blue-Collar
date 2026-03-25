import type { Request, Response } from 'express'
import * as workerService from '../services/worker.service.js'
import { handleError } from '../utils/handleError.js'
import type { CreateWorkerBody, UpdateWorkerBody, WorkerQuery } from '../interfaces/index.js'

export async function listWorkers(req: Request<{}, {}, {}, WorkerQuery>, res: Response) {
  try {
    const { category, page = '1', limit = '20' } = req.query
    const workers = await workerService.listWorkers({ category, page: Number(page), limit: Number(limit) })
    return res.json({ data: workers, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
import { AppError } from '../services/AppError.js'
import * as workerService from '../services/worker.service.js'
import type { CreateWorkerBody, UpdateWorkerBody, WorkerQuery } from '../interfaces/index.js'

function handleError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message, code: err.statusCode })
  }
  console.error(err)
  return res.status(500).json({ status: 'error', message: 'Internal server error', code: 500 })
}

export async function listWorkers(req: Request<{}, {}, {}, WorkerQuery>, res: Response) {
  const { category, page = '1', limit = '20' } = req.query
  const workers = await workerService.listWorkers({
    category,
    page: Number(page),
    limit: Number(limit),

function handleError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message, code: err.statusCode })
  }
  console.error(err)
  return res.status(500).json({ status: 'error', message: 'Internal server error', code: 500 })
}

export async function listWorkers(req: Request<{}, {}, {}, WorkerQuery>, res: Response) {
  const { category, page = '1', limit = '20' } = req.query
  const workers = await workerService.listWorkers({
    category,
export async function listWorkers(req: Request, res: Response) {
  const { category, page = '1', limit = '20' } = req.query
  const workers = await workerService.listWorkers({
    category: category as string | undefined,
    page: Number(page),
    limit: Number(limit),
import { db } from '../db.js'
import { paginate } from '../utils/paginate.js'

export async function listWorkers(req: Request, res: Response) {
  const { category, search, city, state, country, page = '1', limit = '20' } = req.query

  const { category, page = '1', limit = '20' } = req.query
  const { data, meta } = await paginate({
    model: 'worker',
    where: {
      isActive: true,
      ...(category ? { categoryId: String(category) } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { bio: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(city || state || country
        ? {
            location: {
              ...(city ? { city: { contains: String(city), mode: 'insensitive' } } : {}),
              ...(state ? { state: { contains: String(state), mode: 'insensitive' } } : {}),
              ...(country ? { country: { contains: String(country), mode: 'insensitive' } } : {}),
            },
          }
        : {}),
    },
    include: { category: true, location: true },
    },
    include: { category: true },
    page: Number(page),
    limit: Number(limit),
  })
  return res.json({ data, meta, status: 'success', code: 200 })
  const { category, location, search, page = '1', limit = '20' } = req.query
  const where = {
    isActive: true,
    ...(category ? { categoryId: String(category) } : {}),
    ...(search ? { name: { contains: String(search), mode: 'insensitive' as const } } : {}),
  }
  const [workers, total] = await Promise.all([
    db.worker.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { category: true },
    }),
    db.worker.count({ where }),
  ])
  return res.json({
    data: workers,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    status: 'success',
    code: 200,
  })
}

export async function showWorker(req: Request, res: Response) {
  try {
    const worker = await workerService.getWorker(req.params.id)
    return res.json({ data: worker, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
}

export async function createWorker(req: Request<{}, {}, CreateWorkerBody>, res: Response) {
  try {
    const worker = await workerService.createWorker(req.body, req.user!.id)
    return res.status(201).json({ data: worker, status: 'success', code: 201 })
  } catch (err) {
    return handleError(res, err)
  }
}

export async function updateWorker(req: Request<{ id: string }, {}, UpdateWorkerBody>, res: Response) {
  try {
    const worker = await workerService.updateWorker(req.params.id, req.body)
    return res.json({ data: worker, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
}

export async function deleteWorker(req: Request, res: Response) {
  try {
    await workerService.deleteWorker(req.params.id)
    return res.status(204).send()
  } catch (err) {
    return handleError(res, err)
  }
export async function createWorker(req: Request, res: Response) {
  const worker = await workerService.createWorker(req.body, req.user!.id)
  return res.status(201).json({ data: worker, status: 'success', code: 201 })
})

export const updateWorker = catchAsync(async (req: Request, res: Response) => {
  const workerId = req.params.id

  // Check if worker exists
  const existingWorker = await db.worker.findUnique({ where: { id: workerId } })
  if (!existingWorker) throw new AppError('Worker not found', 404)

  const updateData: any = { ...req.body }

  // Handle image upload if file is present
  if (req.file) {
    try {
      // Process the uploaded image (resize and convert to WebP)
      const processedPath = await processImage(req.file.path)

      // Store relative path for database
      const relativePath = path.relative(process.cwd(), processedPath)
      updateData.avatar = relativePath

      // Delete old avatar if it exists
      if (existingWorker.avatar) {
        const oldAvatarPath = path.resolve(existingWorker.avatar)
        deleteImage(oldAvatarPath)
      }
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file?.path) {
        deleteImage(req.file.path)
      }
      throw new AppError('Failed to process image', 500)
    }
  }

  const worker = await db.worker.update({
    where: { id: workerId },
    data: updateData
  })

export async function updateWorker(req: Request<{ id: string }, {}, UpdateWorkerBody>, res: Response) {
  try {
    const worker = await workerService.updateWorker(req.params.id, req.body)
    return res.json({ data: worker, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
}

export async function deleteWorker(req: Request, res: Response) {
  try {
    await workerService.deleteWorker(req.params.id)
    return res.status(204).send()
  } catch (err) {
    return handleError(res, err)
  }
}

export async function toggleActivation(req: Request, res: Response) {
  try {
    const updated = await workerService.toggleWorker(req.params.id)
    return res.json({ data: updated, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
  const worker = await workerService.updateWorker(req.params.id, req.body)
  return res.json({ data: worker, status: 'success', code: 200 })
}

export async function deleteWorker(req: Request, res: Response) {
  await workerService.deleteWorker(req.params.id)
/** Returns the worker or sends a 404. Also enforces curator ownership unless the caller is an admin. */
async function resolveWorker(req: Request, res: Response) {
  const worker = await db.worker.findUnique({ where: { id: req.params.id } })
  if (!worker) {
    res.status(404).json({ status: 'error', message: 'Not found', code: 404 })
    return null
  }
  if (req.user!.role !== 'admin' && worker.curatorId !== req.user!.id) {
    res.status(403).json({ status: 'error', message: 'Forbidden', code: 403 })
    return null
  }
  return worker
}

export async function updateWorker(req: Request, res: Response) {
  const worker = await workerService.updateWorker(req.params.id, req.body)
  return res.json({ data: worker, status: 'success', code: 200 })
})

export const deleteWorker = catchAsync(async (req: Request, res: Response) => {
  const worker = await db.worker.findUnique({ where: { id: req.params.id } })

  // Delete avatar file if it exists
  if (worker?.avatar) {
    const avatarPath = path.resolve(worker.avatar)
    deleteImage(avatarPath)
  }

export async function deleteWorker(req: Request, res: Response) {
  await workerService.deleteWorker(req.params.id)
  const worker = await resolveWorker(req, res)
  if (!worker) return
  const updated = await db.worker.update({ where: { id: worker.id }, data: req.body })
  return res.json({ data: updated, status: 'success', code: 200 })
}

export async function deleteWorker(req: Request, res: Response) {
  const worker = await resolveWorker(req, res)
  if (!worker) return
  await db.worker.delete({ where: { id: worker.id } })
  return res.status(204).send()
})

export async function toggleActivation(req: Request, res: Response) {
  try {
    const updated = await workerService.toggleWorker(req.params.id)
    return res.json({ data: updated, status: 'success', code: 200 })
  } catch (err) {
    return handleError(res, err)
  }
  const worker = await resolveWorker(req, res)
  if (!worker) return
  const updated = await db.worker.update({
    where: { id: worker.id },
    data: { isActive: !worker.isActive },
  })
  return res.json({ data: updated, status: 'success', code: 200 })
})
