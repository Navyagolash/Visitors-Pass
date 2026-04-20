import { Visitor } from "../models/Visitor.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listVisitors = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  const filter = {
    organizationId: req.user.organizationId,
    fullName: { $regex: q, $options: "i" }
  };

  const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
  res.json(visitors);
});

export const createVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.create({
    ...req.body,
    organizationId: req.user.organizationId,
    createdBy: req.user._id
  });

  res.status(201).json(visitor);
});

export const getVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!visitor) {
    res.status(404);
    throw new Error("Visitor not found");
  }

  res.json(visitor);
});
