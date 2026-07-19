"use strict";

const { Course } = require("../../model/Course");

const tabs = [
  { id: "all", label: "All Programs" },
  { id: "doctorate", label: "Doctorate" },
  { id: "certification", label: "Certifications" },
  { id: "executive", label: "Executive Programs" },
  { id: "master", label: "Master" },
];

async function getWebsiteCourses(request, reply) {
  try {
    const courses = await Course.find({ removed: false, enabled: true })
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
