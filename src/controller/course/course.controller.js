"use strict";

const mongoose = require("mongoose");
const { Course } = require("../../model/Course");
const { PartnerCourse } = require("../../model/PartnerCourse");
const { Category } = require("../../model/Category");
const { University } = require("../../model/University");
const { Duration } = require("../../model/Duration");

async function getWebsiteCourses(request, reply) {
  try {
    const { search, category, university, course, duration, sort, limit, page } = request.query || {};

    // 1️⃣ Mongoose Category Query
    // Mongoose Filter Builder for PartnerCourse Collection
    const partnerFilter = { removed: false, enabled: true };

    // 1. Mongoose Category Filter (Hierarchical parent & child category matching)
    let catIds = null;

    if (category && category !== "all") {
      const foundCat = await Category.findOne({
        removed: false,
        $or: [
          { slug: category },
          ...(mongoose.Types.ObjectId.isValid(category) ? [{ _id: category }] : []),
        ],
      }).lean();

      if (foundCat) {
        // Find all child categories belonging to this parent category
        const childCats = await Category.find({
          removed: false,
          parentId: foundCat._id,
        }).select("_id").lean();

        catIds = [foundCat._id, ...childCats.map((c) => c._id)];

        // Find courses with matching category or categories ObjectId
        const coursesWithCat = await Course.find({
          removed: false,
          $or: [
            { category: { $in: catIds } },
            { categories: { $in: catIds } },
          ],
        }).select("_id").lean();

        const matchedCatCourseIds = coursesWithCat.map((c) => c._id);

        partnerFilter.$or = [
          { category: { $in: catIds } },
          { categories: { $in: catIds } },
          { course: { $in: matchedCatCourseIds } },
        ];
      } else {
        // If category filter is passed but category is not found, return 0 results
        partnerFilter._id = new mongoose.Types.ObjectId();
      }
    }

    // 2. Mongoose Duration Filter (Lookup Duration documents in MongoDB)
    if (duration && duration !== "all") {
      const durationDocs = await Duration.find({
        removed: false,
        $or: [
          { slug: duration },
          { title: new RegExp(duration.replace("-year", ""), "i") },
        ],
      }).select("_id").lean();

      if (durationDocs && durationDocs.length > 0) {
        partnerFilter.duration = { $in: durationDocs.map((d) => d._id) };
      }
    }

    // 3. Mongoose Course & University Filter Query
    let hasCourseFilters = false;
    const courseMatch = { removed: false, enabled: true };
    if (catIds && catIds.length > 0) {
      courseMatch.$or = [
        { category: { $in: catIds } },
        { categories: { $in: catIds } },
      ];
    }

    if (university && university !== "all") {
      hasCourseFilters = true;
      const uSlugs = String(university).split(",").map((u) => u.trim());
      const uniDocs = await University.find({
        removed: false,
        $or: [
          { slug: { $in: uSlugs } },
          { name: { $in: uSlugs.map((s) => new RegExp(s, "i")) } },
        ],
      }).select("_id").lean();

      if (uniDocs && uniDocs.length > 0) {
        courseMatch.university = { $in: uniDocs.map((u) => u._id) };
      }
    }

    if (course && course !== "all") {
      hasCourseFilters = true;
      const cTitles = String(course).split(",").map((c) => c.trim());
      courseMatch.$or = [
        { title: { $in: cTitles.map((t) => new RegExp(`^${t}$`, "i")) } },
        { slug: { $in: cTitles } },
      ];
    }

    if (search && search.trim().length > 0) {
      hasCourseFilters = true;
      const sRegex = new RegExp(search.trim(), "i");
      courseMatch.$or = [
        { title: sRegex },
        { description: sRegex },
      ];
    }

    if (hasCourseFilters) {
      const matchedCourseDocs = await Course.find(courseMatch).select("_id").lean();
      const matchedCourseIds = matchedCourseDocs.map((c) => c._id);
      partnerFilter.course = { $in: matchedCourseIds };
    }

    // Mongoose Sorting Options
    let mSort = { order: 1, createdAt: -1 };
    if (sort === "featured") {
      mSort = { featured: -1, order: 1 };
    }

    // 4️⃣ Execute Mongoose Query on MongoDB PartnerCourse collection
    let partnerCourses = await PartnerCourse.find(partnerFilter)
      .populate({
        path: "course",
        select: "_id title slug university logo image fee brochureUrl syllabus careers",
        populate: [
          {
            path: "university",
            select: "_id name slug logoSrc imageSrc location approvals rating reviews",
            populate: [
              { path: "logoSrc", select: "_id name url alt" },
              { path: "imageSrc", select: "_id name url alt" },
            ],
          },
          { path: "logo", select: "_id name url alt" },
          { path: "image", select: "_id name url alt" },
          { path: "fee", select: "_id title amount currency slug" },
        ],
      })
      .populate({
        path: "category",
        select: "_id name slug type title description logo logoSrc image imageSrc order",
        populate: [
          { path: "logo", select: "_id name url alt" },
          { path: "logoSrc", select: "_id name url alt" },
          { path: "imageSrc", select: "_id name url alt" },
        ],
      })
      .populate({ path: "duration", select: "_id title slug months" })
      .populate({ path: "eligibility", select: "_id title slug" })
      .sort(mSort)
      .lean();

    let programs = (partnerCourses || []).map((pc) => {
      const parentCourse = pc.course && typeof pc.course === "object" ? pc.course : {};
      return {
        ...pc,
        title: pc.title || parentCourse.title || "Course",
        slug: pc.slug || parentCourse.slug || "",
        university: parentCourse.university || pc.university || null,
        logo: parentCourse.logo || pc.logo || null,
        image: parentCourse.image || pc.image || null,
        fee: parentCourse.fee || pc.fee || null,
        brochureUrl: parentCourse.brochureUrl || pc.brochureUrl || null,
      };
    });

    if ((!programs || programs.length === 0) && (!category || category === "all")) {
      const masterCourses = await Course.find(courseMatch)
        .populate({ path: "fee", select: "_id title amount currency slug" })
        .populate({ path: "image", select: "_id name url alt" })
        .populate({ path: "logo", select: "_id name url alt" })
        .populate({
          path: "university",
          select: "_id name slug logoSrc imageSrc location approvals rating reviews",
          populate: [
            { path: "logoSrc", select: "_id name url alt" },
            { path: "imageSrc", select: "_id name url alt" },
          ],
        })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      programs = masterCourses || [];
    }

    // Sort by Title if requested
    if (sort === "title-asc") {
      programs.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "title-desc") {
      programs.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    const totalCount = programs.length;

    // Apply Limit & Page
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0;

    let paginatedPrograms = programs;
    if (limitNum > 0) {
      const startIndex = (pageNum - 1) * limitNum;
      paginatedPrograms = programs.slice(startIndex, startIndex + limitNum);
    }

    return reply.code(200).send({
      success: true,
      result: {
        programs: paginatedPrograms || [],
        total: totalCount,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch website courses",
    });
  }
}

async function getWebsiteCourseBySlug(request, reply) {
  try {
    const { slug } = request.query || {};
    if (!slug) {
      return reply.code(400).send({
        success: false,
        message: "Course slug parameter is required",
      });
    }

    let courseDoc = await Course.findOne({ slug, removed: false })
      .populate({
        path: "university",
        select: "_id name slug logoSrc imageSrc description location approvals rating reviews",
        populate: [
          { path: "logoSrc", select: "_id name url alt" },
          { path: "imageSrc", select: "_id name url alt" },
        ],
      })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "fee", select: "_id title amount currency slug" })
      .lean();

    let partnerCourse = null;
    if (courseDoc) {
      partnerCourse = await PartnerCourse.findOne({ course: courseDoc._id, removed: false })
        .populate({
          path: "category",
          select: "_id name slug type title description logo logoSrc image imageSrc order",
          populate: [
            { path: "logo", select: "_id name url alt" },
            { path: "logoSrc", select: "_id name url alt" },
            { path: "imageSrc", select: "_id name url alt" },
          ],
        })
        .populate({ path: "duration", select: "_id title slug months" })
        .populate({ path: "eligibility", select: "_id title slug" })
        .lean();
    } else {
      partnerCourse = await PartnerCourse.findOne({ slug, removed: false })
        .populate({
          path: "course",
          populate: [
            {
              path: "university",
              select: "_id name slug logoSrc imageSrc description location approvals rating reviews",
              populate: [
                { path: "logoSrc", select: "_id name url alt" },
                { path: "imageSrc", select: "_id name url alt" },
              ],
            },
            { path: "logo", select: "_id name url alt" },
            { path: "image", select: "_id name url alt" },
            { path: "fee", select: "_id title amount currency slug" },
          ],
        })
        .populate({
          path: "category",
          select: "_id name slug type title description logo logoSrc image imageSrc order",
          populate: [
            { path: "logo", select: "_id name url alt" },
            { path: "logoSrc", select: "_id name url alt" },
            { path: "imageSrc", select: "_id name url alt" },
          ],
        })
        .populate({ path: "duration", select: "_id title slug months" })
        .populate({ path: "eligibility", select: "_id title slug" })
        .lean();

      if (partnerCourse && partnerCourse.course) {
        courseDoc = partnerCourse.course;
      }
    }

    if (!courseDoc && !partnerCourse) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    const title = courseDoc?.title || partnerCourse?.title || "Course Details";
    const courseSlug = courseDoc?.slug || partnerCourse?.slug || slug;
    const description = partnerCourse?.description || "Comprehensive distance education program designed for executive career growth, practical industry skills, and leadership excellence.";

    const universityObj = courseDoc?.university || partnerCourse?.university || null;
    const durationObj = partnerCourse?.duration;
    const eligibilityObj = partnerCourse?.eligibility;
    const categoryObj = partnerCourse?.category;

    const formattedResult = {
      _id: courseDoc?._id || partnerCourse?._id,
      title,
      slug: courseSlug,
      description,
      university: universityObj,
      logo: courseDoc?.logo || partnerCourse?.logo || null,
      image: courseDoc?.image || partnerCourse?.image || null,
      fee: courseDoc?.fee || partnerCourse?.fee || null,
      brochureUrl: courseDoc?.brochureUrl || partnerCourse?.brochureUrl || null,
      duration: durationObj ? (typeof durationObj === "object" ? durationObj.title : durationObj) : null,
      eligibility: eligibilityObj ? (typeof eligibilityObj === "object" ? eligibilityObj.title : eligibilityObj) : null,
      level: categoryObj ? (typeof categoryObj === "object" ? categoryObj.name : categoryObj) : null,
      syllabus: (partnerCourse?.syllabus && partnerCourse.syllabus.length > 0)
        ? partnerCourse.syllabus
        : (courseDoc?.syllabus && courseDoc.syllabus.length > 0)
          ? courseDoc.syllabus
          : [],
      careers: partnerCourse?.careers || courseDoc?.careers || null,
    };

    return reply.code(200).send({
      success: true,
      result: formattedResult,
    });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      message: error.message || "Failed to fetch course details",
    });
  }
}

module.exports = {
  getWebsiteCourses,
  getWebsiteCourseBySlug,
};
