import { Note } from "../models/note.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// cookies or token required in all cases
const getAllNotes = asyncHandler(async (req, res) =>{
    try {
        const allNote = await Note.find({user : req.user._id})
        
        return res
        .status(200)
        .json(new ApiResponse(200, allNote, "All notes fetched successfully"))

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }
})


const addNote = asyncHandler(async (req, res) =>{
    const {title, description, tag} = req.body
  
    if([title, description].some((field) => field.trim() === "")){
        return res
        .status(400)
        .json(new ApiError(400, "Title and Description both are required"))
    }

    try {
        const note = await Note.create({
            title,
            description,
            tag,
            user: req.user._id
        })
    
        const savedNote = await Note.findById(note._id)
        if(!savedNote){
            return res
            .status(500)
            .json(new ApiError(500, "Your note is not saved"))
        }
        
        return res
        .status(200)
        .json(new ApiResponse(200, savedNote, "Your note is saved successfully"))

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }

})


const updateNote = asyncHandler(async (req, res) =>{
    try {
        const {title, description, tag} = req.body
        let note = await Note.findById(req.params.noteId)
        
        if(!note){    
            return res
            .status(404)
            .json(new ApiError(404, "Note not found"))     
        }

        if(note.user.toString() !== req.user._id){
            return res
            .status(404)
            .json(new ApiError(404, "Not allowed, Authentication required"))
        }

        note = await Note.findByIdAndUpdate(req.params.noteId, {
            $set: {
                title,
                description,
                tag
            }
        },
        {
            new: true
        })
        
        return res
        .status(200)
        .json(new ApiResponse(200, note, "Your note is updated successfully"))

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }
})


const deleteNote = asyncHandler(async (req, res) =>{
    try {
        let note = await Note.findById(req.params.noteId)
        
        if(!note){
            return res
            .status(404)
            .json(new ApiError(404, "Note not found")) 
        }

        if(note.user.toString() !== req.user._id){
            return res
            .status(404)
            .json(new ApiError(404, "Not allowed, Authentication required"))
        }
        note = await Note.findByIdAndDelete(req.params.noteId)

        return res
        .status(200)
        .json(new ApiResponse(200, note, "note is deleted successfully"))

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }
})


export {
    getAllNotes,
    addNote,
    deleteNote,
    updateNote
}