const mongoose = require("mongoose");
const Entry = require("../models/Entry");
const User = require("../models/User");
const {resolveUserId}=require("../helper/utils");
const {
  sub,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  parse,
} = require("date-fns");

const getMonthlyIncomeData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const { dateVal } = req.query;
    let dateObj;
    if (dateVal) {
      dateObj = parse(dateVal, "MM/dd/yyyy", new Date());
      if (isNaN(dateObj)) dateObj = new Date(dateVal);
    } else {
      dateObj = startOfMonth(new Date());
    }

    const data = await Entry.find({
      userId,
      date: { $gte: dateObj },
    }).sort({ date: -1 });

    return res.status(200).send(data);
  } catch (err) {
    console.error("Error in getMonthlyIncomeData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch monthly income data" });
  }
};

const particularMonthData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const { dateVal } = req.query;
    let dateObj = new Date();
    if (dateVal) {
      const parsed = parse(dateVal, "MM/dd/yyyy", new Date());
      dateObj = isNaN(parsed) ? new Date(dateVal) : parsed;
    }

    const aggregateData = await Entry.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth(dateObj), $lte: endOfMonth(dateObj) },
        },
      },
      {
        $group: {
          _id: "$entryType",
          totalSum: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const data = {
      Expense: 0,
      Income: 0,
    };

    aggregateData.forEach((item) => {
      data[item._id] = item.totalSum;
    });

    return res.status(200).send(data);
  } catch (err) {
    console.error("Error in particularMonthData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch month data" });
  }
};

const getExpenseGraphData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const reqData = await Entry.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth(new Date()),
            $lte: new Date(),
          },
          entryType: "Expense",
        },
      },
      {
        $group: {
          _id: "$category",
          totalSum: { $sum: "$amount" },
        },
      },
    ]);

    return res.status(200).send(reqData);
  } catch (err) {
    console.error("Error in getExpenseGraphData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch expense graph data" });
  }
};

const lastyearData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const dateObj = sub(new Date(), { years: 1 });
    const data = await Entry.find({
      userId,
      date: { $gte: dateObj },
    }).sort({ date: -1 });

    return res.status(200).send(data);
  } catch (err) {
    console.error("Error in lastyearData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch last year data" });
  }
};

const getDailyData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const result = await Entry.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
      },
      {
        $group: {
          _id: "$entryType",
          totalSum: { $sum: "$amount" },
        },
      },
    ]);

    const data = {
      Expense: 0,
      Income: 0,
    };

    result.forEach((item) => {
      data[item._id] = item.totalSum;
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in getDailyData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch daily data" });
  }
};

const getDailyExpense = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const { entryType } = req.query;
    const filter = {
      userId,
      date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    };

    if (entryType) {
      filter.entryType = entryType;
    }

    const result = await Entry.find(filter).sort({ date: -1 });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in getDailyExpense:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch daily expense" });
  }
};

const getcurrDayData = async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const dayObj = startOfDay(new Date());
    const data = await Entry.aggregate([
      {
        $match: {
          userId,
          date: { $gte: dayObj, $lte: endOfDay(dayObj) },
        },
      },
    ]);

    return res.status(200).send(data);
  } catch (err) {
    console.error("Error in getcurrDayData:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch current day data" });
  }
};

module.exports = {
  getMonthlyIncomeData,
  particularMonthData,
  getExpenseGraphData,
  lastyearData,
  getDailyData,
  getDailyExpense,
  getcurrDayData,
};