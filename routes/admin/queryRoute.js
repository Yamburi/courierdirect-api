const { Router } = require("express");
const queryController = require("../../controller/admin/queryController");
const { adminValidateToken } = require("../../middleware/adminAuthMiddleware");
const router = Router();

router.get("/api/query", adminValidateToken, queryController.getQuery);

router.get("/api/query/:id", adminValidateToken, queryController.getQueryById);
router.get("/api/query/count/unseen", queryController.countUnseenQueries);
router.put(
  "/api/query/mark-seen/:id",

  adminValidateToken,
  queryController.markQueryAsSeen
);
router.put(
  "/api/query/all/mark-seen",

  adminValidateToken,
  queryController.markAllQueriesAsSeen
);
router.delete(
  "/api/query/:id",
  adminValidateToken,

  queryController.deleteQuery
);
module.exports = router;
