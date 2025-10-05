import { Router } from 'express';
import { BoardController } from '../controllers/boardController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD operations
router.post('/', BoardController.createBoard);
router.get('/', BoardController.getBoards);
router.get('/:id', BoardController.getBoardById);
router.put('/:id', BoardController.updateBoard);
router.delete('/:id', BoardController.deleteBoard);

// Board invitation
router.post('/:boardId/invite', BoardController.inviteToBoard);

// Accept invitation (can be called from different contexts)
router.post('/invitations/accept', BoardController.acceptBoardInvitation);

export default router;