"use strict";

/**
 * course.controller.js
 *
 * Handlers that rely on `request.courseFilter` being populated by
 * the `buildCourseFilter` preHandler middleware (course.filter.js).
 *
 * Route setup example:
 *   fastify.get("/website-list", {
 *     preHandler: buildCourseFilter,
 *     handler: getWebsiteCourses,
 *   });
 */

const { PartnerCourse } = require("../../model/PartnerCourse");

async function getWebsiteCourses(request, reply) {
  try {
    const { partnerFilter, mSort, pageNum, limitNum, skipNum } =
      request.courseFilter;

    // Run count + paginated query in parallel
    const [totalCount, partnerCourses] = await Promise.all([
      PartnerCourse.countDocuments(partnerFilter),
      PartnerCourse.find(partnerFilter)
        .populate({
          path: "university",
          select: "_id name slug logoSrc imageSrc location approvals rating reviews",
          populate: [
            { path: "logoSrc", select: "_id name url alt" },
            { path: "imageSrc", select: "_id name url alt" },
          ],
        })
        .populate({
          path: "course",
          select: "_id title slug category logo image fee brochureUrl syllabus careers",
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
        .populate({ path: "subcourse", select: "_id title slug course" })
        .populate({
          path: "category",
          select: "_id name slug type title description logo logoSrc image imageSrc order",
          populate: [
            { path: "logo", select: "_id name url alt" },
            { path: "logoSrc", select: "_id name url alt" },
            { path: "imageSrc", select: "_id name url alt" },
          ],
        })
        .populate({ path: "fee", select: "_id title amount currency slug" })
        .populate({ path: "duration", select: "_id title slug months" })
        .populate({ path: "eligibility", select: "_id title slug" })
        .populate({ path: "tenant", select: "_id name slug logo" })
        .sort(mSort)
        .skip(skipNum)
        .limit(limitNum || 0)
        .lean(),
    ]);

    // Normalize each result — merge university + logo from parent Course if missing
    const programs = (partnerCourses || []).map((pc) => {
      const parentCourse =
        pc.course && typeof pc.course === "object" ? pc.course : {};
      const uniObj =
        pc.university &&
        typeof pc.university === "object" &&
        pc.university.name
          ? pc.university
          : parentCourse.university &&
            typeof parentCourse.university === "object"
          ? parentCourse.university
          : null;

      return {
        ...pc,
        title: pc.title || parentCourse.title || "Course",
        slug: pc.slug || parentCourse.slug || "",
        university: uniObj,
        logo:
          pc.logo ||
          parentCourse.logo ||
          (uniObj ? uniObj.logoSrc : null) ||
          null,
        image:
          pc.image ||
          parentCourse.image ||
          (uniObj ? uniObj.imageSrc : null) ||
          null,
        fee: pc.fee || parentCourse.fee || null,
        brochureUrl: pc.brochureUrl || parentCourse.brochureUrl || null,
      };
    });

    const totalPages = limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1;

    return reply.code(200).send({
      success: true,
      result: {
        programs,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: limitNum > 0 && pageNum < totalPages,
        hasPrevPage: pageNum > 1,
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

    // Try PartnerCourse first by its own slug
    let partnerCourse = await PartnerCourse.findOne({ slug, removed: false })
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
      .populate({ path: "tenant", select: "_id name slug logo" })
      .lean();

    // Fallback — find PartnerCourse by its linked Course slug
    if (!partnerCourse) {
      partnerCourse = await PartnerCourse.findOne({ removed: false })
        .populate({
          path: "course",
          match: { slug },
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
        .populate({ path: "tenant", select: "_id name slug logo" })
        .lean();

      // Discard if the course field didn't match (populate match returns null)
      if (partnerCourse && !partnerCourse.course) partnerCourse = null;
    }

    if (!partnerCourse) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    const courseDoc = partnerCourse.course && typeof partnerCourse.course === "object"
      ? partnerCourse.course
      : {};

    const title = partnerCourse.title || courseDoc.title || "Course Details";
    const courseSlug = partnerCourse.slug || courseDoc.slug || slug;
    const description = partnerCourse.description ||
      "Comprehensive distance education program designed for executive career growth, practical industry skills, and leadership excellence.";

    const universityObj = courseDoc.university || partnerCourse.university || null;
    const durationObj = partnerCourse.duration;
    const eligibilityObj = partnerCourse.eligibility;
    const categoryObj = partnerCourse.category;

    return reply.code(200).send({
      success: true,
      result: {
        _id: partnerCourse._id || courseDoc._id,
        title,
        slug: courseSlug,
        description,
        university: universityObj,
        logo: partnerCourse.logo || courseDoc.logo || null,
        image: partnerCourse.image || courseDoc.image || null,
        fee: partnerCourse.fee || courseDoc.fee || null,
        brochureUrl: partnerCourse.brochureUrl || courseDoc.brochureUrl || null,
        duration: durationObj
          ? typeof durationObj === "object" ? durationObj.title : durationObj
          : null,
        eligibility: eligibilityObj
          ? typeof eligibilityObj === "object" ? eligibilityObj.title : eligibilityObj
          : null,
        level: categoryObj
          ? typeof categoryObj === "object" ? categoryObj.name : categoryObj
          : null,
        syllabus:
          partnerCourse.syllabus && partnerCourse.syllabus.length > 0
            ? partnerCourse.syllabus
            : courseDoc.syllabus && courseDoc.syllabus.length > 0
            ? courseDoc.syllabus
            : [],
        careers: partnerCourse.careers || courseDoc.careers || null,
      },
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
