"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticateToken);
// Task CRUD operations
router.get('/:boardId/cards/:cardId/tasks', taskController_1.TaskController.getTasks);
router.post('/:boardId/cards/:cardId/tasks', taskController_1.TaskController.createTask);
router.get('/:boardId/cards/:cardId/tasks/:taskId', taskController_1.TaskController.getTaskById);
router.put('/:boardId/cards/:cardId/tasks/:taskId', taskController_1.TaskController.updateTask);
router.delete('/:boardId/cards/:cardId/tasks/:taskId', taskController_1.TaskController.deleteTask);
// Task member assignment
router.post('/:boardId/cards/:cardId/tasks/:taskId/assign', taskController_1.TaskController.assignMember);
router.get('/:boardId/cards/:cardId/tasks/:taskId/assign', taskController_1.TaskController.getAssignedMembers);
router.delete('/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId', taskController_1.TaskController.removeMemberAssignment);
exports.default = router;
//# sourceMappingURL=tasks.js.map