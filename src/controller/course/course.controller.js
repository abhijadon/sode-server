"use strict";

const { Course } = require("../../model/Course");
const { Category } = require("../../model/Category");

async function getWebsiteCourses(request, reply) {
  try {
    // 1️⃣ Fetch categories filtered by type: "course"
    const categories = await Category.find({
      removed: false,
      enabled: true,
      type: "course",
    })
      .sort({ order: 1, createdAt: 1 })
      .select("_id name slug type")
      .lean();

    const tabs = [
      { id: "all", slug: "all", label: "All Programs" },
      ...(categories || []).map((cat) => ({
        id: cat.slug,
        _id: String(cat._id),
        slug: cat.slug,
        label: cat.name,
      })),
    ];

    // 2️⃣ Fetch courses with populated Category, Duration, Eligibility, Fee, Media, and University objects
    const courses = await Course.find({ removed: false, enabled: true })
      .populate({ path: "category", select: "_id name slug type" })
      .populate({ path: "duration", select: "_id title slug months" })
      .populate({ path: "eligibility", select: "_id title slug" })
      .populate({ path: "fee", select: "_id title amount currency slug" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc",
        populate: [
          { path: "logoSrc", select: "_id name url alt" },
          { path: "imageSrc", select: "_id name url alt" },
        ],
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return reply.code(200).send({
      success: true,
      result: {
        tabs,
        programs: courses && courses.length > 0 ? courses : [],
      },
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website courses",
    });
  }
}

module.exports = {
  getWebsiteCourses,
};
