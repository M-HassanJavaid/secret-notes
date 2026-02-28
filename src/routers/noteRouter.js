import express from 'express'
import checkAuth from '../middleware/checkAuth.js'
import upload from '../middleware/upload.js'
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from '../controllers/note.js'

const noteRouter = express.Router()

noteRouter.post('/create', checkAuth, upload.single('image'), createNote)
noteRouter.get('/all', checkAuth, getNotes)
noteRouter.get('/id/:id', checkAuth, getNoteById)
noteRouter.put('/update/:id', checkAuth, upload.single('image'), updateNote)
noteRouter.delete('/delete/:id', checkAuth, deleteNote)

export default noteRouter
