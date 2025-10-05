import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { AuthRequest } from '../middlewares/auth';

export class TaskController {
  // Get all tasks for a card
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check card exists
      const card = await FirebaseService.getCardById(cardId);
      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card not found' });
      }

      const tasks = await FirebaseService.getTasksByCardId(cardId);

      res.status(200).json(tasks.map(task => ({
        id: task.id,
        cardId: task.cardId,
        title: task.title,
        description: task.description,
        status: task.status,
        ownerId: task.ownerId,
        assignedMembers: task.assignedMembers,
        createdAt: task.createdAt
      })));
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
  }

  // Create a new task
  static async createTask(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId } = req.params;
      const { title, description, status = 'todo' } = req.body;
      const userId = req.user!.id;

      if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check card exists
      const card = await FirebaseService.getCardById(cardId);
      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card not found' });
      }

      const task = await FirebaseService.createTask({
        cardId,
        boardId,
        ownerId: userId,
        title,
        description: description || '',
        status: status as 'todo' | 'in-progress' | 'done',
        assignedMembers: [userId]
      });

      res.status(201).json({
        id: task.id,
        cardId: task.cardId,
        ownerId: task.ownerId,
        title: task.title,
        description: task.description,
        status: task.status
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // Get task by ID
  static async getTaskById(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({
        id: task.id,
        cardId: task.cardId,
        title: task.title,
        description: task.description,
        status: task.status,
        ownerId: task.ownerId,
        assignedMembers: task.assignedMembers,
        createdAt: task.createdAt
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to retrieve task' });
    }
  }

  // Update task
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const { title, description, status, card_owner_id, card_id } = req.body;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined && ['todo', 'in-progress', 'done'].includes(status)) {
        updates.status = status;
      }

      // If moving to different card
      if (card_id && card_id !== cardId) {
        const targetCard = await FirebaseService.getCardById(card_id);
        if (targetCard && targetCard.boardId === boardId) {
          updates.cardId = card_id;
        }
      }

      await FirebaseService.updateTask(taskId, updates);

      const updatedTask = await FirebaseService.getTaskById(taskId);

      res.status(200).json({
        id: updatedTask!.id,
        cardId: updatedTask!.cardId
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // Delete task
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if user can delete (task owner, card owner, or board owner)
      const card = await FirebaseService.getCardById(cardId);
      if (task.ownerId !== userId && card?.ownerId !== userId && board.ownerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete GitHub attachments first
      const attachments = await FirebaseService.getGitHubAttachmentsByTaskId(taskId);
      for (const attachment of attachments) {
        await FirebaseService.deleteGitHubAttachment(attachment.id);
      }

      await FirebaseService.deleteTask(taskId);

      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  // Assign member to task
  static async assignMember(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const { memberId } = req.body;
      const userId = req.user!.id;

      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' });
      }

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if member is in board
      if (!board.members.includes(memberId)) {
        return res.status(400).json({ error: 'Member not in board' });
      }

      // Add member to assigned members if not already assigned
      if (!task.assignedMembers.includes(memberId)) {
        const updatedAssignedMembers = [...task.assignedMembers, memberId];
        await FirebaseService.updateTask(taskId, { assignedMembers: updatedAssignedMembers });
      }

      res.status(201).json({
        taskId: taskId,
        memberId: memberId
      });
    } catch (error) {
      console.error('Assign member error:', error);
      res.status(500).json({ error: 'Failed to assign member' });
    }
  }

  // Get assigned members
  static async getAssignedMembers(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const assignments = task.assignedMembers.map(memberId => ({
        taskId: taskId,
        memberId: memberId
      }));

      res.status(200).json(assignments);
    } catch (error) {
      console.error('Get assigned members error:', error);
      res.status(500).json({ error: 'Failed to retrieve assigned members' });
    }
  }

  // Remove member assignment
  static async removeMemberAssignment(req: AuthRequest, res: Response) {
    try {
      const { boardId, cardId, taskId, memberId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const task = await FirebaseService.getTaskById(taskId);

      if (!task || task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Remove member from assigned members
      const updatedAssignedMembers = task.assignedMembers.filter(id => id !== memberId);
      await FirebaseService.updateTask(taskId, { assignedMembers: updatedAssignedMembers });

      res.status(204).send();
    } catch (error) {
      console.error('Remove member assignment error:', error);
      res.status(500).json({ error: 'Failed to remove member assignment' });
    }
  }
}