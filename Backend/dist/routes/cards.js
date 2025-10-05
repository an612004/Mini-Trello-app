"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cardController_1 = require("../controllers/cardController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All card routes require authentication
router.use(auth_1.authenticateToken);
// Card CRUD operations
router.get('/:boardId/cards', cardController_1.CardController.getCards);
router.post('/:boardId/cards', cardController_1.CardController.createCard);
router.get('/:boardId/cards/:id', cardController_1.CardController.getCardById);
router.put('/:boardId/cards/:id', cardController_1.CardController.updateCard);
router.delete('/:boardId/cards/:id', cardController_1.CardController.deleteCard);
// Cards by user
router.get('/:boardId/cards/user/:userId', cardController_1.CardController.getCardsByUser);
// Card invitation acceptance
router.post('/:boardId/cards/:id/invite/accept', cardController_1.CardController.acceptCardInvitation);
exports.default = router;
//# sourceMappingURL=cards.js.map