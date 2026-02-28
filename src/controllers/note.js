import mongoose from "mongoose";
import Note from "../models/Note.js";
import cloudinaryUpload from "../utils/cloudinaryUpload.js";

export async function createNote(req, res) {
    try {
        const { title, text } = req.body;
        if (!title || !text) {
            return res.status(400).json({ success: false, message: "Title and text are required" });
        }

        const newNote = new Note({ title, text, user: req.user._id });

        if (req.file && req.file.buffer) {
            let cloudinaryRes = await cloudinaryUpload(req.file.buffer, { folders: 'noteTaker' });
            newNote.image = {};
            newNote.image.url = cloudinaryRes.secure_url;
            newNote.image.id = cloudinaryRes.public_id
        }

        let savedNote = (await newNote.save()).toObject();
        return res.status(201).json({ success: true, message: "Note created", note: savedNote });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getNotes(req, res) {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ _id: -1 });
        return res.status(200).json({
            notes,
            success: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getNoteById(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOne({ user: req.user._id, _id: new mongoose.Types.ObjectId(id) });
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });
        return res.status(200).json({ success: true, note });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const { title, text } = req.body;

        if(Object.keys(req.body).length === 0){
            return res.status(404).json({
                success: false,
                message: 'No updates found'
            })
        }

        const note = await Note.findOne({ user: req.user._id , _id: new mongoose.Types.ObjectId(id)})
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });

        if (title !== undefined) note.title = title;
        if (text !== undefined) note.text = text;

        if (req.file && req.file.buffer) {
            let cloudinaryRes = await cloudinaryUpload(req.file.buffer, { folders: 'expenseTracker' });
            note.image = {};
            note.image.url = cloudinaryRes.secure_url;
            note.image.id = cloudinaryRes.public_id
        }

        let updatedNote = (await note.save()).toObject();
        
        return res.status(200).json({ success: true, message: "Note updated", note : updateNote });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function deleteNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOneAndDelete({ user: req.user._id , _id: new mongoose.Types.ObjectId(id)});
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });
        return res.status(200).json({ success: true, message: "Note deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}