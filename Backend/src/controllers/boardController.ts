import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase';
import { AuthRequest } from '../middlewares/auth';
import { sendInvitationEmail } from '../services/email';

export class BoardController {
  // Tạo 1 board mới
  static async createBoard(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      const userId = req.user!.id;

      if (!name) { // xét ko null
        return res.status(400).json({ error: 'Tên board là bắt buộc' });
      }

      const board = await FirebaseService.createBoard({
        name,
        description: description || '',
        ownerId: userId,
        members: [userId]
      });
// Trả về thông tin board mới tạo
      res.status(201).json({
        id: board.id,
        name: board.name,
        description: board.description
      });
    } catch (error) {
      console.error('Create board error:', error);
      res.status(500).json({ error: 'Failed to create board' });
    }
  }

  // Lấy danh sách board của user
  static async getBoards(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const boards = await FirebaseService.getBoardsByUserId(userId);
// Trả về danh sách board
      res.status(200).json(boards.map(board => ({
        id: board.id,
        name: board.name,
        description: board.description,
        ownerId: board.ownerId,
        members: board.members,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      })));
    } catch (error) {
      console.error('Get boards error:', error);
      res.status(500).json({ error: 'Failed to retrieve boards' });
    }
  }

  // Get board by ID
  static async getBoardById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const board = await FirebaseService.getBoardById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // Check if user has access to this board
      if (!board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get member details
      const memberDetails = await Promise.all(
        board.members.map(async (memberId) => {
          const user = await FirebaseService.getUserById(memberId);
          return user ? {
            id: user.id,
            name: user.githubUsername || user.email.split('@')[0],
            email: user.email
          } : null;
        })
      );

      res.status(200).json({
        id: board.id,
        name: board.name,
        description: board.description,
        ownerId: board.ownerId,
        members: memberDetails.filter(member => member !== null),
        memberIds: board.members, // Keep original IDs for reference
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      });
    } catch (error) {
      console.error('Get board error:', error);
      res.status(500).json({ error: 'Failed to retrieve board' });
    }
  }

  // Update board
  static async updateBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userId = req.user!.id;

      const board = await FirebaseService.getBoardById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // kiểm tra nếu user là owner hoặc thành viên
      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;

      await FirebaseService.updateBoard(id, updates);

      const updatedBoard = await FirebaseService.getBoardById(id);

      res.status(200).json({
        id: updatedBoard!.id,
        name: updatedBoard!.name,
        description: updatedBoard!.description
      });
    } catch (error) {
      console.error('Update board error:', error);
      res.status(500).json({ error: 'Failed to update board' });
    }
  }

  // Delete board
  static async deleteBoard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const board = await FirebaseService.getBoardById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // Only owner can delete board
      if (board.ownerId !== userId) {
        return res.status(403).json({ error: 'Only board owner can delete board' });
      }

      await FirebaseService.deleteBoard(id);

      res.status(204).send();
    } catch (error) {
      console.error('Delete board error:', error);
      res.status(500).json({ error: 'Failed to delete board' });
    }
  }

  // Invite member to board
  static async inviteToBoard(req: AuthRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const { email_member } = req.body;
      const inviterUserId = req.user!.id;

      if (!email_member) {
        return res.status(400).json({ error: 'Member email is required' });
      }

      const board = await FirebaseService.getBoardById(boardId);

      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // Check if user has access to invite
      if (!board.members.includes(inviterUserId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if invited user exists
      const invitedUser = await FirebaseService.getUserByEmail(email_member);

      // Create invitation
      const invitation = await FirebaseService.createInvitation({
        boardId,
        inviterUserId,
        invitedUserId: invitedUser?.id,
        invitedEmail: email_member,
        status: 'pending',
        type: 'board'
      });

      // Send invitation email
      const inviterUser = await FirebaseService.getUserById(inviterUserId);
      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/invitations/${invitation.id}`;
      
      // Log invitation link for development/testing
      console.log('📧 Invitation created:');
      console.log('   → Email:', email_member);
      console.log('   → Invitation ID:', invitation.id);
      console.log('   → Link:', inviteLink);
      
      try {
        await sendInvitationEmail(email_member, inviterUser!.email, board.name, inviteLink);
        console.log('✅ Invitation email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send email, but invitation created:', emailError);
        // Continue anyway - invitation still created
      }

      res.status(200).json({ 
        success: true, 
        invitationId: invitation.id,
        inviteLink: inviteLink,
        message: 'Invitation sent successfully' 
      });
    } catch (error) {
      console.error('Invite to board error:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  }

  // Accept board invitation
  static async acceptBoardInvitation(req: AuthRequest, res: Response) {
    try {
      const { inviteId } = req.body;
      const userId = req.user!.id;

      if (!inviteId) {
        return res.status(400).json({ error: 'Invitation ID is required' });
      }

      const invitation = await FirebaseService.getInvitationById(inviteId);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      if (invitation.status !== 'pending') {
        return res.status(400).json({ error: 'Invitation already processed' });
      }

      // Check if user is the invited user
      if (invitation.invitedUserId !== userId && invitation.invitedEmail !== req.user!.email) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update invitation status
      await FirebaseService.updateInvitation(inviteId, { status: 'accepted' });

      // Add user to board members
      const board = await FirebaseService.getBoardById(invitation.boardId);
      if (board && !board.members.includes(userId)) {
        const updatedMembers = [...board.members, userId];
        await FirebaseService.updateBoard(invitation.boardId, { members: updatedMembers });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  }

  // Remove member from board
  static async removeMember(req: AuthRequest, res: Response) {
    try {
      // Remove a member from the board
      const { id, memberId } = req.params;
      const userId = req.user!.id;

      console.log('🗑️ Remove member request:', { boardId: id, memberId, requesterId: userId });

      const board = await FirebaseService.getBoardById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      // Only owner can remove members, or members can leave themselves
      if (board.ownerId !== userId && memberId !== userId) {
        return res.status(403).json({ error: 'Chỉ chủ board hoặc bản thân mới có thể xóa thành viên' });
      }

      // Cannot remove board owner
      if (memberId === board.ownerId) {
        return res.status(400).json({ error: 'Không thể xóa chủ board' });
      }

      // Check if member exists in board
      if (!board.members.includes(memberId)) {
        return res.status(400).json({ error: 'Người dùng không phải thành viên của board' });
      }

      // Remove member from board
      const updatedMembers = board.members.filter(member => member !== memberId);
      await FirebaseService.updateBoard(id, { members: updatedMembers });

      console.log('✅ Member removed successfully');

      res.status(200).json({ 
        success: true,
        message: 'Thành viên đã được xóa khỏi board'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ error: 'Không thể xóa thành viên' });
    }
  }

}