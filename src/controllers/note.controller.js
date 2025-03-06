import mongoose from "mongoose";
import { Note } from "../models/note.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// cookies or token required in all cases
// const getAllNotes = asyncHandler(async (req, res) => {
//     // 1. Extract the user ID from the authenticated user
//     // 2. Fetch all notes for the user
//     // 3. Return all notes to the user
//     try {
//         const allNote = await Note.find({ user: req.user._id })

//         return res
//             .status(200)
//             .json(new ApiResponse(200, allNote, "All notes fetched successfully"))

//     }
//     catch (error) {
//         return res
//             .status(500)
//             .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
//     }
// })

const getAllNotes = asyncHandler(async (req, res) => {
    // 1: Extract the user ID from the authenticated user
    const userId = req.user?._id;
    // console.log("Step 1: Authenticated user ID:", userId);

    try {
        // 2: Fetch all notes for the user
        const userNotes = await Note.find({ owner: userId }).sort({ createdAt: -1 }); // Sort by most recent first
        // console.log("Step 2: Fetched user notes from database:", userNotes);

        // 3: Return all notes to the user
        // console.log("Step 3: Returning all user notes in response");
        return res
            .status(200)
            .json(new ApiResponse(200, userNotes, "Notes fetched successfully"));
    } catch (error) {
        console.error("Step 4: Unexpected error during fetching notes:", error);
        return res
            .status(500)
            .json(
                new ApiError(500, "An unexpected error occurred while fetching notes", error)
            );
    }
});


const addNote = asyncHandler(async (req, res) => {
    //1. Fetch details from request body
    //2. Extract user ID from the authenticated user
    const { title, description, theme } = req.body;
    const userId = req.user?._id;

    // console.log("Step 1: Received request body:", req.body);
    // console.log("Step 2: Authenticated user ID:", userId);

    //3: Check if title and description are provided
    if ([title, description].some((field) => field.trim() === "")) {
        // console.log("Step 3: Validation failed - Title or Description is empty");
        return res
            .status(400)
            .json(new ApiError(400, "Title and Description both are required"));
    }

    try {
        // 4. creating the note
        // console.log("Step 4: Creating a new note...");
        const note = await Note.create({
            title,
            description,
            theme: theme || "black",
            owner: userId,
        });

        // console.log("Note created successfully:", note);

        //5: Verify that the note was saved in the database
        const savedNote = await Note.findById(note._id);
        if (!savedNote) {
            // console.log("Step 6: Error - Note not found after creation");
            return res
                .status(500)
                .json(new ApiError(500, "Your note is not saved"));
        }

        // console.log("Step 6: Note saved successfully in the database:", savedNote);
        return res
            .status(200)
            .json(new ApiResponse(200, savedNote, "Your note is saved successfully"));
    } catch (error) {
        console.error("Unexpected error during note creation:", error);
        return res
            .status(500)
            .json(
                new ApiError(500, "An unexpected error occurred while creating note", error)
            );
    }
});


const updateNote = asyncHandler(async (req, res) => {
    // Step 1: Fetch details from request body
    const { title, description, theme } = req.body;
    const { noteId } = req.params; 
    const userId = req.user?._id;

    // console.log("Step 1: Received request body:", { title, description, theme });
    // console.log("Step 2: Received note ID from request params:", noteId);
    // console.log("Step 3: Authenticated user ID:", userId);

    // Step 3: Validate note ID
    if (!mongoose.isValidObjectId(noteId)) {
        console.error("Step 3: Validation failed - Invalid note ID");
        return res.status(400).json(new ApiError(400, "Invalid note ID"));
    }

    // Step 4: Check if title and description are provided
    if ([title, description].some((field) => field?.trim() === "")) {
        // console.log("Step 4: Validation failed - Title or Description is empty");
        return res
            .status(400)
            .json(new ApiError(400, "Title and Description both are required"));
    }

    try {
        // console.log("Step 5: Updating the note with ID:", noteId);

        // Step 5: Update the note
        const updatedNote = await Note.findOneAndUpdate(
            {
                _id: noteId,
                owner: userId, // Ensure the note belongs to the authenticated user
            },
            {
                title,
                description,
                theme: theme || "black", // Default theme to "black" if not provided
            },
            {
                new: true, // Return the updated note
            }
        );

        // console.log("Step 6: Updated note from database:", updatedNote);

        // Step 6: Verify that the note was updated
        if (!updatedNote) {
            // console.log("Step 6: Error - Note not found or unauthorized update attempt");
            return res
                .status(404)
                .json(new ApiError(404, "Note not found or unauthorized access"));
        }

        // Step 7: Return the updated note to the user
        // console.log("Step 7: Note updated successfully, returning response");
        return res
            .status(200)
            .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
    } catch (error) {
        console.error("Step 8: Unexpected error during note update:", error);
        return res
            .status(500)
            .json(
                new ApiError(500, "An unexpected error occurred while updating the note", error)
            );
    }
});


const deleteNote = asyncHandler(async (req, res) => {
    // 1: Fetch the note ID from the request parameters
    // 2: Extract the user ID from the authenticated user
    const { noteId } = req.params;
    const userId = req.user?._id;

    // console.log("Step 1: Received note ID from request parameters:", noteId);
    // console.log("Step 2: Authenticated user ID:", userId);

    // Step 3: Validate note ID
    if (!mongoose.isValidObjectId(noteId)) {
        console.error("Step 3: Validation failed - Invalid note ID");
        return res.status(400).json(new ApiError(400, "Invalid note ID"));
    }

    try {
        // 4: Find the note by ID
        const note = await Note.findById(noteId);

        // console.log("Step 3: Retrieved note from database:", note);

        // 5: Check if the note exists
        if (!note) {
            // console.log("Step 4: Error - Note not found in database");
            return res
                .status(404)
                .json(new ApiError(404, "Note not found. Please check the note ID."));
        }

        // 6: Check if the note belongs to the authenticated user
        if (note.owner.toString() !== userId.toString()) {
            // console.log("Step 5: Unauthorized access attempt - Note does not belong to user");
            return res
                .status(403)
                .json(new ApiError(403, "You are not authorized to delete this note."));
        }

        // 7: Delete the note
        const deletedNote = await Note.findByIdAndDelete(noteId);

        // console.log("Step 6: Note successfully deleted:", deletedNote);

        // 8: Return the deleted note
        // console.log("Step 7: Returning the deleted note in response");
        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedNote, "Note has been successfully deleted")
            );
    } catch (error) {
        console.error("Step 8: Unexpected error during note deletion:", error);
        return res
            .status(500)
            .json(
                new ApiError(500, "An unexpected error occurred while deleting note", error)
            );
    }
});



export {
    getAllNotes,
    addNote,
    deleteNote,
    updateNote
}