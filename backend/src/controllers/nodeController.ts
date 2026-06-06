import { type Request, type Response, type NextFunction } from 'express'
import { createNode, deleteNode, getNodeById, getNodesByCluster } from '../services/nodeService'

export const listNodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nodes = await getNodesByCluster(req.params.id)
    return res.json(nodes.map((node) => ({
      ...node,
      podCount: node.pods.length,
    })))
  } catch (error) {
    return next(error)
  }
}

export const getNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const node = await getNodeById(req.params.id)
    if (!node) {
      return res.status(404).json({ error: 'Node not found' })
    }
    return res.json(node)
  } catch (error) {
    return next(error)
  }
}

export const createNodeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const node = await createNode(req.body)
    return res.status(201).json(node)
  } catch (error) {
    return next(error)
  }
}

export const deleteNodeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteNode(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Node not found' })
    }
    return res.status(202).json({ success: true })
  } catch (error) {
    return next(error)
  }
}
