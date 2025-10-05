"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardController = void 0;
const firebase_1 = require("../services/firebase");
const email_1 = require("../services/email");
class BoardController {
    // Create a new board
    static async createBoard(req, res) {
        try {
            const { name, description } = req.body;
            const userId = req.user.id;
            if (!name) {
                return res.status(400).json({ error: 'Board name is required' });
            }
            const board = await firebase_1.FirebaseService.createBoard({
                name,
                description: description || '',
                ownerId: userId,
                members: [userId]
            });
            res.status(201).json({
                id: board.id,
                name: board.name,
                description: board.description
            });
        }
        catch (error) {
            console.error('Create board error:', error);
            res.status(500).json({ error: 'Failed to create board' });
        }
    }
    // Get all boards for authenticated user
    static async getBoards(req, res) {
        try {
            const userId = req.user.id;
            const boards = await firebase_1.FirebaseService.getBoardsByUserId(userId);
            res.status(200).json(boards.map(board => ({
                id: board.id,
                name: board.name,
                description: board.description,
                ownerId: board.ownerId,
                members: board.members,
                createdAt: board.createdAt,
                updatedAt: board.updatedAt
            })));
        }
        catch (error) {
            console.error('Get boards error:', error);
            res.status(500).json({ error: 'Failed to retrieve boards' });
        }
    }
    // Get board by ID
    static async getBoardById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const board = await firebase_1.FirebaseService.getBoardById(id);
            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }
            // Check if user has access to this board
            if (!board.members.includes(userId)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Get member details
            const memberDetails = await Promise.all(board.members.map(async (memberId) => {
                const user = await firebase_1.FirebaseService.getUserById(memberId);
                return user ? {
                    id: user.id,
                    name: user.githubUsername || user.email.split('@')[0],
                    email: user.email
                } : null;
            }));
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
        }
        catch (error) {
            console.error('Get board error:', error);
            res.status(500).json({ error: 'Failed to retrieve board' });
        }
    }
    // Update board
    static async updateBoard(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const userId = req.user.id;
            const board = await firebase_1.FirebaseService.getBoardById(id);
            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }
            // Check if user is owner or has access
            if (board.ownerId !== userId && !board.members.includes(userId)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            const updates = {};
            if (name !== undefined)
                updates.name = name;
            if (description !== undefined)
                updates.description = description;
            await firebase_1.FirebaseService.updateBoard(id, updates);
            const updatedBoard = await firebase_1.FirebaseService.getBoardById(id);
            res.status(200).json({
                id: updatedBoard.id,
                name: updatedBoard.name,
                description: updatedBoard.description
            });
        }
        catch (error) {
            console.error('Update board error:', error);
            res.status(500).json({ error: 'Failed to update board' });
        }
    }
    // Delete board
    static async deleteBoard(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const board = await firebase_1.FirebaseService.getBoardById(id);
            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }
            // Only owner can delete board
            if (board.ownerId !== userId) {
                return res.status(403).json({ error: 'Only board owner can delete board' });
            }
            await firebase_1.FirebaseService.deleteBoard(id);
            res.status(204).send();
        }
        catch (error) {
            console.error('Delete board error:', error);
            res.status(500).json({ error: 'Failed to delete board' });
        }
    }
    // Invite member to board
    static async inviteToBoard(req, res) {
        try {
            const { boardId } = req.params;
            const { email_member } = req.body;
            const inviterUserId = req.user.id;
            if (!email_member) {
                return res.status(400).json({ error: 'Member email is required' });
            }
            const board = await firebase_1.FirebaseService.getBoardById(boardId);
            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }
            // Check if user has access to invite
            if (!board.members.includes(inviterUserId)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Check if invited user exists
            const invitedUser = await firebase_1.FirebaseService.getUserByEmail(email_member);
            // Create invitation
            const invitation = await firebase_1.FirebaseService.createInvitation({
                boardId,
                inviterUserId,
                invitedUserId: invitedUser?.id,
                invitedEmail: email_member,
                status: 'pending',
                type: 'board'
            });
            // Send invitation email
            const inviterUser = await firebase_1.FirebaseService.getUserById(inviterUserId);
            const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/invitations/${invitation.id}`;
            // Log invitation link for development/testing
            console.log('📧 Invitation created:');
            console.log('   → Email:', email_member);
            console.log('   → Invitation ID:', invitation.id);
            console.log('   → Link:', inviteLink);
            try {
                await (0, email_1.sendInvitationEmail)(email_member, inviterUser.email, board.name, inviteLink);
                console.log('✅ Invitation email sent successfully');
            }
            catch (emailError) {
                console.error('❌ Failed to send email, but invitation created:', emailError);
                // Continue anyway - invitation still created
            }
            res.status(200).json({
                success: true,
                invitationId: invitation.id,
                inviteLink: inviteLink,
                message: 'Invitation sent successfully'
            });
        }
        catch (error) {
            console.error('Invite to board error:', error);
            res.status(500).json({ error: 'Failed to send invitation' });
        }
    }
    // Accept board invitation
    static async acceptBoardInvitation(req, res) {
        try {
            const { inviteId } = req.body;
            const userId = req.user.id;
            if (!inviteId) {
                return res.status(400).json({ error: 'Invitation ID is required' });
            }
            const invitation = await firebase_1.FirebaseService.getInvitationById(inviteId);
            if (!invitation) {
                return res.status(404).json({ error: 'Invitation not found' });
            }
            if (invitation.status !== 'pending') {
                return res.status(400).json({ error: 'Invitation already processed' });
            }
            // Check if user is the invited user
            if (invitation.invitedUserId !== userId && invitation.invitedEmail !== req.user.email) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Update invitation status
            await firebase_1.FirebaseService.updateInvitation(inviteId, { status: 'accepted' });
            // Add user to board members
            const board = await firebase_1.FirebaseService.getBoardById(invitation.boardId);
            if (board && !board.members.includes(userId)) {
                const updatedMembers = [...board.members, userId];
                await firebase_1.FirebaseService.updateBoard(invitation.boardId, { members: updatedMembers });
            }
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Accept invitation error:', error);
            res.status(500).json({ error: 'Failed to accept invitation' });
        }
    }
}
exports.BoardController = BoardController;
//# sourceMappingURL=boardController.js.map