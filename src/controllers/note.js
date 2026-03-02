import mongoose from "mongoose";
import Note from "../models/Note.js";
import cloudinaryUpload from "../utils/cloudinaryUpload.js";
import { v2 as cloudinary } from 'cloudinary'

export async function createNote(req, res) {
    try {
        const { title, content : text } = req.body;
        console.log({ title,  text })
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
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
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
        return res.status(200).json({ success: true, note , message: 'Note has sent successfully' });
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
            let cloudinaryRes = await cloudinaryUpload(req.file.buffer, { folders: 'secret-notes' });
            note?.image?.id && note?.image?.id ==='default' && cloudinary.uploader.destroy(note?.image?.id);
            note.image = {};
            note.image.url = cloudinaryRes.secure_url;
            note.image.id = cloudinaryRes.public_id
        } else {
            note.image = {
                url: 'https://res.cloudinary.com/dxdijw7zr/image/upload/v1772435212/WhatsApp-Image-2024-02-23-at-6.35.55-PM-1_1_z229oc.jpg',
                id: 'default'
            }
        }

        let updatedNote = (await note.save()).toObject();
        
        res.status(200).json({ success: true, message: "Note updated", note : updatedNote });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    } 
}

export async function deleteNote(req, res) {
    try {
        const { id } = req.params;
        console.log(id)
        const note = await Note.findOneAndDelete({ user: req.user._id , _id: new mongoose.Types.ObjectId(id)});
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });
        return res.status(200).json({ success: true, message: "Note deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}