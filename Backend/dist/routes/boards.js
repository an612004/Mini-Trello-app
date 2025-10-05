"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const boardController_1 = require("../controllers/boardController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All board routes require authentication
router.use(auth_1.authenticateToken);
// Board CRUD operations
router.post('/', boardController_1.BoardController.createBoard);
router.get('/', boardController_1.BoardController.getBoards);
router.get('/:id', boardController_1.BoardController.getBoardById);
router.put('/:id', boardController_1.BoardController.updateBoard);
router.delete('/:id', boardController_1.BoardController.deleteBoard);
// Board invitation
router.post('/:boardId/invite', boardController_1.BoardController.inviteToBoard);
// Accept invitation (can be called from different contexts)
router.post('/invitations/accept', boardController_1.BoardController.acceptBoardInvitation);
// Remove member from board
router.delete('/:id/members/:memberId', boardController_1.BoardController.removeMember);
exports.default = router;
//# sourceMappingURL=boards.js.map