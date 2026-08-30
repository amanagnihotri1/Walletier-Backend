const mongoose = require("mongoose");
const Entry = require("../models/Entry");
const User = require("../models/User");
const {resolveUserId}=require("../helper/utils");

// Function to add Expense/Income entries
const addEntry = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { amount, category, date, entryType, monthlyGoal } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required to create an entry." });
    }

    if (amount === undefined || amount === null || !category || !entryType) {
      return res.status(400).json({ success: false, message: "Amount, category, and entryType are required." });
    }

    const entryDate = date ? new Date(date) : new Date();

    const newEntry = new Entry({
      userId,
      amount: Number(amount),
      category,
      date: entryDate,
      entryType,
      monthlyGoal: monthlyGoal ? Number(monthlyGoal) : 0,
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json({ success: true, message: "new entry created successfully", savedEntry });
  } catch (err) {
    console.error("Error in addEntry:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create entry" });
  }
};
// Function to delete Entries
const deleteEntry = async (req, res) => {
  try {
    const entryId = req.query.entryId || req.params.entryId || req.body.entryId;
    const userId = await resolveUserId(req);

    if (!entryId) {
      return res.status(400).json({ success: false, message: "Entry ID is required." });
    }

    const filter = { _id: entryId };
    if (userId) {
      filter.userId = userId;
    }

    const data = await Entry.deleteOne(filter);
    if (data.deletedCount === 0) {
      return res.status(404).json({ success: false, message: `Entry not found with ID ${entryId}` });
    }

    return res.status(200).json({ success: true, data, message: `deleted entry with Id ${entryId}` });
  } catch (err) {
    console.error("Error in deleteEntry:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to delete entry" });
  }
};
//Function to update entries
const updateEntry = async (req, res) => {
  try {
    const { entryId, id, entryCat, category, entryAmt, amount, entryType, date } = req.body;
    const userId = await resolveUserId(req);

    if (!entryId) {
      return res.status(400).json({ success: false, message: "Entry ID is required." });
    }

    const updateData = {};
    if (entryAmt !== undefined || amount !== undefined) {
      updateData.amount = Number(entryAmt !== undefined ? entryAmt : amount);
    }
    if (entryCat || category) {
      updateData.category = entryCat || category;
    }
    if (entryType) {
      updateData.entryType = entryType;
    }
    if (date) {
      updateData.date = new Date(date);
    }

    const filter = { _id: entryId };
    if (userId) {
      filter.userId = userId;
    }

    const data = await Entry.findOneAndUpdate(filter, updateData, { new: true });
    if (!data) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    return res.status(200).json({ success: true, message: "Entry updated successfully", data });
  } catch (err) {
    console.error("Error in updateEntry:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update entry" });
  }
};

module.exports = { addEntry, updateEntry, deleteEntry };