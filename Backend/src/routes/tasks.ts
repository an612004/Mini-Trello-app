import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD operations
router.get('/:boardId/cards/:cardId/tasks', TaskController.getTasks);
router.post('/:boardId/cards/:cardId/tasks', TaskController.createTask);
router.get('/:boardId/cards/:cardId/tasks/:taskId', TaskController.getTaskById);
router.put('/:boardId/cards/:cardId/tasks/:taskId', TaskController.updateTask);
router.delete('/:boardId/cards/:cardId/tasks/:taskId', TaskController.deleteTask);

// Task member assignment
router.post('/:boardId/cards/:cardId/tasks/:taskId/assign', TaskController.assignMember);
router.get('/:boardId/cards/:cardId/tasks/:taskId/assign', TaskController.getAssignedMembers);
router.delete('/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId', TaskController.removeMemberAssignment);

export default router;