import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { AuthRequest } from '../middlewares/auth';

export class CardController {
  // Get all cards for a board
  static async getCards(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const userId = req.user!.id;

      // Check if user has access to board
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const cards = await FirebaseService.getCardsByBoardId(boardId);

      // Temporarily disable task count to avoid Firebase index error
      const cardsWithTaskCount = cards.map((card) => {
        return {
          id: card.id,
          name: card.name,
          description: card.description,
          status: 'Todo', // Default status for existing cards
          tasks_count: 0, // Temporary fixed value
          list_member: card.members,
          createdAt: card.createdAt
        };
      });

      res.status(200).json(cardsWithTaskCount);
    } catch (error) {
      console.error('Get cards error:', error);
      res.status(500).json({ error: 'Failed to retrieve cards' });
    }
  }

  // Create a new card
  static async createCard(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const { name, title, description, status, priority, dueDate, assignees } = req.body;
      const userId = req.user!.id;

      // Accept both 'name' and 'title' for backward compatibility
      const cardName = name || title;

      if (!cardName) {
        return res.status(400).json({ error: 'Card name/title is required' });
      }

      // Check if user has access to board
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const card = await FirebaseService.createCard({
        boardId,
        name: cardName,
        description: description || '',
        ownerId: userId,
        members: assignees && assignees.length > 0 ? assignees : [userId],
        tasksCount: 0
      });

      res.status(201).json({
        id: card.id,
        name: card.name,
        description: card.description,
        createdAt: card.createdAt
      });
    } catch (error) {
      console.error('Create card error:', error);
      res.status(500).json({ error: 'Failed to create card' });
    }
  }

  // Get card by ID
  static async getCardById(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const card = await FirebaseService.getCardById(id);

      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.status(200).json({
        id: card.id,
        name: card.name,
        description: card.description,
        ownerId: card.ownerId,
        members: card.members,
        createdAt: card.createdAt
      });
    } catch (error) {
      console.error('Get card error:', error);
      res.status(500).json({ error: 'Failed to retrieve card' });
    }
  }

  // Get cards by user ID
  static async getCardsByUser(req: AuthRequest, res: Response) {
    try {
      const { boardId, userId: targetUserId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const cards = await FirebaseService.getCardsByUserId(boardId, targetUserId);

      // Get task counts for each card
      const cardsWithTaskCount = await Promise.all(
        cards.map(async (card) => {
          const tasks = await FirebaseService.getTasksByCardId(card.id);
          return {
            id: card.id,
            name: card.name,
            description: card.description,
            tasks_count: tasks.length,
            list_member: card.members,
            createdAt: card.createdAt
          };
        })
      );

      res.status(200).json(cardsWithTaskCount);
    } catch (error) {
      console.error('Get cards by user error:', error);
      res.status(500).json({ error: 'Failed to retrieve user cards' });
    }
  }

  // Update card
  static async updateCard(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const { name, title, description, priority, dueDate, assignees, status } = req.body;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const card = await FirebaseService.getCardById(id);

      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card not found' });
      }

      const updates: any = {};
      // Accept both name and title for backward compatibility
      if (name !== undefined) updates.name = name;
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (priority !== undefined) updates.priority = priority;
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (assignees !== undefined) updates.assignees = assignees;
      if (status !== undefined) updates.status = status;
      
      // Update timestamp
      updates.updatedAt = new Date().toISOString();

      await FirebaseService.updateCard(id, updates);

      const updatedCard = await FirebaseService.getCardById(id);

      res.status(200).json({
        id: updatedCard!.id,
        name: updatedCard!.name,
        title: updatedCard!.title,
        description: updatedCard!.description,
        priority: updatedCard!.priority,
        dueDate: updatedCard!.dueDate,
        assignees: updatedCard!.assignees,
        status: updatedCard!.status,
        createdAt: updatedCard!.createdAt,
        updatedAt: updatedCard!.updatedAt
      });
    } catch (error) {
      console.error('Update card error:', error);
      res.status(500).json({ error: 'Failed to update card' });
    }
  }

  // Delete card
  static async deleteCard(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const card = await FirebaseService.getCardById(id);

      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      // Check if user is board member
      if (!board.members.includes(userId)) {
        return res.status(403).json({ error: 'Chỉ thành viên board mới có thể xóa card' });
      }

      // Delete all tasks in this card first
      const tasks = await FirebaseService.getTasksByCardId(id);
      for (const task of tasks) {
        await FirebaseService.deleteTask(task.id);
      }

      await FirebaseService.deleteCard(id);

      res.status(204).send();
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ error: 'Không thể xóa card' });
    }
  }

  // Accept card invitation
  static async acceptCardInvitation(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const { invite_id, card_id, member_id, status } = req.body;
      const userId = req.user!.id;

      if (!invite_id || !status || !['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ error: 'Valid invitation ID and status (accepted/declined) are required' });
      }

      const invitation = await FirebaseService.getInvitationById(invite_id);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      if (invitation.invitedUserId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update invitation status
      await FirebaseService.updateInvitation(invite_id, { status: status as 'accepted' | 'declined' });

      if (status === 'accepted' && invitation.cardId) {
        // Add user to card members
        const card = await FirebaseService.getCardById(invitation.cardId);
        if (card && !card.members.includes(userId)) {
          const updatedMembers = [...card.members, userId];
          await FirebaseService.updateCard(invitation.cardId, { members: updatedMembers });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Accept card invitation error:', error);
      res.status(500).json({ error: 'Failed to process invitation' });
    }
  }
}