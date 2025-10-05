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

      // Return cards with actual status from database
      const cardsWithTaskCount = cards.map((card) => {
        console.log('📋 Card from DB:', { id: card.id, name: card.name, status: card.status });
        return {
          id: card.id,
          name: card.name,
          title: card.title,
          description: card.description,
          status: card.status || 'Todo', // Use actual status or default to Todo
          priority: card.priority,
          dueDate: card.dueDate,
          assignees: card.assignees,
          tasks_count: 0, // Temporary fixed value
          list_member: card.members,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
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

      console.log('🔄 Update card request:', { 
        boardId, 
        cardId: id, 
        userId, 
        updates: { name, title, description, priority, dueDate, assignees, status }
      });

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        console.log('❌ Access denied for update');
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

      console.log('📝 Updates to apply:', updates);
      await FirebaseService.updateCard(id, updates);
      console.log('✅ Card updated in Firebase');

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

      console.log('🗑️ DELETE card request:', { boardId, cardId: id, userId });

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      console.log('📋 Board check:', { 
        boardExists: !!board, 
        boardMembers: board?.members, 
        userInBoard: board?.members.includes(userId) 
      });
      
      if (!board || !board.members.includes(userId)) {
        console.log('❌ Access denied');
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

  // Add member to card
  static async addMemberToCard(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const { userEmail } = req.body;
      const userId = req.user!.id;

      console.log('🔍 Add member request:', { boardId, cardId: id, userId, userEmail });

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      console.log('📋 Board check:', { 
        boardExists: !!board, 
        boardId: board?.id,
        boardMembers: board?.members, 
        currentUserId: userId,
        userInBoard: board?.members.includes(userId) 
      });
      
      if (!board || !board.members.includes(userId)) {
        console.log('❌ Access denied to board');
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      // Get card
      const card = await FirebaseService.getCardById(id);
      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      // Find user by email
      const user = await FirebaseService.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng với email này' });
      }

      // Check if user is already a member
      if (card.members.includes(user.id)) {
        return res.status(400).json({ error: 'Người dùng đã là thành viên của card' });
      }

      // Add user to card members
      const updatedMembers = [...card.members, user.id];
      await FirebaseService.updateCard(id, { members: updatedMembers });

      res.status(200).json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          githubUsername: user.githubUsername
        }
      });
    } catch (error) {
      console.error('Add member to card error:', error);
      res.status(500).json({ error: 'Không thể thêm thành viên vào card' });
    }
  }

  // Remove member from card
  static async removeMemberFromCard(req: AuthRequest, res: Response) {
    try {
      const { boardId, id, memberId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      // Get card
      const card = await FirebaseService.getCardById(id);
      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      // Remove user from card members
      const updatedMembers = card.members.filter(id => id !== memberId);
      await FirebaseService.updateCard(id, { members: updatedMembers });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Remove member from card error:', error);
      res.status(500).json({ error: 'Không thể xóa thành viên khỏi card' });
    }
  }

  // Create comment
  static async createComment(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const { content } = req.body;
      const userId = req.user!.id;

      console.log('💬 Create comment request:', { boardId, cardId: id, userId, content });

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      console.log('📋 Board access check:', { 
        boardExists: !!board, 
        boardMembers: board?.members, 
        currentUserId: userId,
        userInBoard: board?.members.includes(userId) 
      });
      
      if (!board || !board.members.includes(userId)) {
        console.log('❌ Access denied to board for comment');
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      // Get card
      const card = await FirebaseService.getCardById(id);
      if (!card || card.boardId !== boardId) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      // Get user info
      const user = await FirebaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Người dùng không tồn tại' });
      }

      // Create comment
      const comment = await FirebaseService.createComment({
        cardId: id,
        userId: userId,
        userEmail: user.email,
        userName: user.githubUsername || user.email.split('@')[0],
        content: content
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Không thể tạo comment' });
    }
  }

  // Get comments
  static async getComments(req: AuthRequest, res: Response) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      // Get comments
      const comments = await FirebaseService.getCommentsByCardId(id);

      res.status(200).json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Không thể lấy comments' });
    }
  }

  // Delete comment
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      const { boardId, id, commentId } = req.params;
      const userId = req.user!.id;

      // Check board access
      const board = await FirebaseService.getBoardById(boardId);
      if (!board || !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      // Get comment to check ownership
      const comments = await FirebaseService.getCommentsByCardId(id);
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) {
        return res.status(404).json({ error: 'Comment không tồn tại' });
      }

      // Only comment owner or board owner can delete
      if (comment.userId !== userId && board.ownerId !== userId) {
        return res.status(403).json({ error: 'Chỉ người tạo comment hoặc chủ board mới có thể xóa' });
      }

      await FirebaseService.deleteComment(commentId);

      res.status(204).send();
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Không thể xóa comment' });
    }
  }
}