import { Router } from 'express';
import { CardController } from '../controllers/cardController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All card routes require authentication
router.use(authenticateToken);

// Card CRUD operations
router.get('/:boardId/cards', CardController.getCards);
router.post('/:boardId/cards', CardController.createCard);
router.get('/:boardId/cards/:id', CardController.getCardById);
router.put('/:boardId/cards/:id', CardController.updateCard);
router.delete('/:boardId/cards/:id', CardController.deleteCard);

// Card members management
router.post('/:boardId/cards/:id/members', CardController.addMemberToCard);
router.delete('/:boardId/cards/:id/members/:memberId', CardController.removeMemberFromCard);

// Card comments
router.get('/:boardId/cards/:id/comments', CardController.getComments);
router.post('/:boardId/cards/:id/comments', CardController.createComment);
router.delete('/:boardId/cards/:id/comments/:commentId', CardController.deleteComment);

// Cards by user
router.get('/:boardId/cards/user/:userId', CardController.getCardsByUser);

// Card invitation acceptance
router.post('/:boardId/cards/:id/invite/accept', CardController.acceptCardInvitation);

export default router;