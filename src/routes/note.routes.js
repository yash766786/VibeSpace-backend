import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getAllNotes, addNote, deleteNote, updateNote } from "../controllers/note.controller.js";

const router = Router()

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

router.route("/")
    .get(getAllNotes)
    .post(addNote)

router.route("/:noteId")
    .put(updateNote)
    .delete(deleteNote)

export default router