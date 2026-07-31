"use strict";

const { Course } = require("../../model/Course");

const populateOfferings = [
  {
    path: "universityOfferings.university",
    select: "_id name slug logoSrc imageSrc location approvals rating reviews workspaceId",
    populate: [
      { path: "logoSrc", select: "_id name url alt" },
      { path: "imageSrc", select: "_id name url alt" },
      { path: "workspaceId", select: "_id name description" },
    ],
  },
  { path: "universityOfferings.workspace", select: "_id name description" },
  { path: "universityOfferings.fee", select: "_id title amount currency slug" },
  { path: "universityOfferings.duration", select: "_id title slug months" },
  { path: "universityOfferings.eligibility", select: "_id title slug" },
  { path: "universityOfferings.category", select: "_id name slug" },
  {
    path: "universityOfferings.subcourses.subcourse",
    select: "_id title name slug shortDescription description content modules course courses",
    populate: [
      { path: "course", select: "_id title slug description content" },
      { path: "courses", select: "_id title slug description content" }
    ]
  },
  { path: "universityOfferings.subcourses.category", select: "_id name slug" },
  { path: "universityOfferings.subcourses.fee", select: "_id title amount currency slug" },
  { path: "universityOfferings.subcourses.duration", select: "_id title slug months" },
  { path: "universityOfferings.subcourses.eligibility", select: "_id title slug" },
  { path: "universityOfferings.subcourses.courseSnapshotBottom.iconMedia", select: "_id name url alt" },
  { path: "universityOfferings.brochureUrl", select: "_id name url alt" },
];

async function getWebsiteCourses(request, reply) {
  try {
    const { partnerFilter, mSort, pageNum, limitNum, skipNum } =
      request.courseFilter;

    // Fetch matching master course documents
    const courses = await Course.find(partnerFilter)
      .populate({ path: "categories", select: "_id name slug" })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "brochureUrl", select: "_id name url alt" })
      .populate(populateOfferings)
      .sort(mSort)
      .lean();

    // Dynamically flatten universityOfferings & subcourses into individual program items for API response
    const flattenedPrograms = [];

    courses.forEach((courseDoc) => {
      const offerings = Array.isArray(courseDoc.universityOfferings) ? courseDoc.universityOfferings : [];

      if (offerings.length > 0) {
        offerings.forEach((offering) => {
          const subItems = Array.isArray(offering.subcourses) && offering.subcourses.length > 0
            ? offering.subcourses
            : [];

          if (subItems.length > 0) {
            subItems.forEach((subItem) => {
              const uniObj = offering.university;
              const uniName = uniObj?.name || "";
              let rawTitle = subItem?.title || subItem?.name || courseDoc?.title || courseDoc?.name || (courseDoc?.slug ? `Online ${courseDoc.slug.toUpperCase()}` : "Online Program");
              
              if (subItem && (subItem.title || subItem.name) && courseDoc && (courseDoc.title || courseDoc.name)) {
                const main = (courseDoc.title || courseDoc.name).trim();
                const sub = (subItem.title || subItem.name).trim();
                // Combine them automatically if they aren't already combined
                if (!sub.toLowerCase().includes(main.toLowerCase())) {
                  rawTitle = `${main} - ${sub}`;
                }
              }

              const finalTitle = rawTitle;

              // Slug resolution: slugify rawTitle for all courses to keep it clean and specific
              const slugify = (text) => (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              let finalSlug = slugify(rawTitle);

              flattenedPrograms.push({
                _id: subItem._id || courseDoc._id,
                courseId: courseDoc._id,
                title: finalTitle,
                slug: finalSlug,
                description: subItem.description || subItem.subcourse?.description || courseDoc.description || "",
                content: subItem.content || subItem.description || subItem.subcourse?.content || courseDoc.content || courseDoc.description || "",
                categories: courseDoc.categories,
                logo: courseDoc.logo,
                image: courseDoc.image,
                brochureUrl: courseDoc.brochureUrl,
                featured: courseDoc.featured,
                order: courseDoc.order,
                fee: subItem.fee || offering.fee,
                duration: subItem.duration || offering.duration,
                keyHighlights: (Array.isArray(subItem.keyHighlights) && subItem.keyHighlights.length > 0)
                  ? subItem.keyHighlights
                  : (Array.isArray(courseDoc.keyHighlights) ? courseDoc.keyHighlights : []),
                whoCanApply: (Array.isArray(subItem.whoCanApply) && subItem.whoCanApply.length > 0)
                  ? subItem.whoCanApply
                  : (Array.isArray(courseDoc.whoCanApply) ? courseDoc.whoCanApply : []),
                admissionProcess: (Array.isArray(subItem.admissionProcess) && subItem.admissionProcess.length > 0)
                  ? subItem.admissionProcess
                  : (Array.isArray(courseDoc.admissionProcess) ? courseDoc.admissionProcess : []),
                modules: (Array.isArray(subItem.modules) && subItem.modules.length > 0)
                  ? subItem.modules
                  : (Array.isArray(courseDoc.modules) ? courseDoc.modules : []),
                subcourseCategory: subItem.category,
                isSubcourse: true,
                university: uniObj,
                subcourse: subItem.subcourse,
                provider: offering.workspace?.name || "upGrad",
              });
            });
          } else {
            const uniObj = offering.university;
            const uniName = uniObj?.name || "";
            const rawTitle = courseDoc?.title || courseDoc?.name || (courseDoc?.slug ? `Online ${courseDoc.slug.toUpperCase()}` : "Online Program");
            const finalTitle = rawTitle;

            flattenedPrograms.push({
              _id: courseDoc._id,
              title: finalTitle,
              slug: courseDoc.slug,
              description: courseDoc.description,
              content: courseDoc.description,
              categories: courseDoc.categories,
              logo: courseDoc.logo,
              image: courseDoc.image,
              brochureUrl: courseDoc.brochureUrl,
              featured: courseDoc.featured,
              order: courseDoc.order,
              fee: offering.fee,
              duration: offering.duration,
              keyHighlights: [],
              whoCanApply: [],
              admissionProcess: [],
              university: uniObj,
              provider: offering.workspace?.name || "upGrad",
            });
          }
        });
      } else if (courseDoc && (courseDoc.title || courseDoc.slug || courseDoc.name)) {
        flattenedPrograms.push(courseDoc);
      }
    });

    // Smart multi-field filtering on flattened programs
    const { subcategory, subcourse, university, duration, fee, search } = request.query || {};

    let filteredPrograms = flattenedPrograms;

    // 1️⃣ Subcategory / Subcourse Filter
    const subParam = subcategory || subcourse;
    if (subParam && subParam !== "all") {
      const rawTokens = String(subParam)
        .split(/[,|]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const searchWords = rawTokens.flatMap((t) => {
        const clean = t.replace(/^browse-/, "").replace(/-/g, " ");
        return [t, clean];
      });

      const searchRegexes = searchWords.map((w) => {
        const escaped = w.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        if (w.length <= 3) {
          return new RegExp("\\b" + escaped + "\\b", "i");
        }
        return new RegExp(escaped, "i");
      });

      filteredPrograms = filteredPrograms.filter((prog) => {
        const title = prog.title || "";
        const desc = prog.description || "";
        const content = prog.content || "";

        const matchesText = searchRegexes.some((regex) => regex.test(title) || regex.test(desc) || regex.test(content));

        const subCatObj = prog.subcourseCategory;
        let matchesCat = false;

        if (subCatObj) {
          const cSlug = subCatObj.slug || subCatObj.name || "";
          const cName = subCatObj.name || "";
          matchesCat = searchRegexes.some((regex) => regex.test(cSlug) || regex.test(cName) || String(subCatObj._id) === regex.source);
        } else if (!prog.isSubcourse) {
          const offering = prog.universityOfferings && prog.universityOfferings[0];
          const offeringCats = Array.isArray(offering?.category) ? offering.category : [];
          matchesCat = offeringCats.some((cat) => {
            const cSlug = cat?.slug || cat?.name || "";
            const cName = cat?.name || "";
            return searchRegexes.some((regex) => regex.test(cSlug) || regex.test(cName));
          });
        }

        const uniObj = prog.university || (prog.universityOfferings && prog.universityOfferings[0]?.university);
        const uniName = (uniObj?.name || "").toLowerCase();
        const uniSlug = (uniObj?.slug || "").toLowerCase();
        const matchesUni = searchRegexes.some((regex) => regex.test(uniName) || regex.test(uniSlug));

        return matchesText || matchesCat || matchesUni;
      });
    }

    // 2️⃣ University Filter
    if (university && university !== "all") {
      const uniTokens = String(university)
        .split(/[,|]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      filteredPrograms = filteredPrograms.filter((prog) => {
        const uniObj = prog.university || (prog.universityOfferings && prog.universityOfferings[0]?.university);
        const uniName = (uniObj?.name || "").toLowerCase();
        const uniSlug = (uniObj?.slug || "").toLowerCase();
        const uniId = String(uniObj?._id || "").toLowerCase();

        return uniTokens.some((t) => uniSlug.includes(t) || uniName.includes(t) || t.includes(uniSlug) || uniId === t);
      });
    }

    // 3️⃣ Duration Filter
    if (duration && duration !== "all") {
      const durStr = String(duration).toLowerCase();
      filteredPrograms = filteredPrograms.filter((prog) => {
        const durObj = prog.duration;
        const months = durObj?.months || 0;
        const title = (durObj?.title || "").toLowerCase();

        if (durStr === "06-month" || durStr === "6-month" || durStr === "6-months") {
          return months <= 6 || title.includes("6");
        }
        if (durStr === "06-12-months" || durStr === "6-12-months") {
          return months >= 6 && months <= 12;
        }
        if (durStr === "12-36-months" || durStr === "12-36") {
          return months >= 12;
        }
        return true;
      });
    }

    // 4️⃣ Fee Filter
    if (fee && fee !== "all") {
      const feeStr = String(fee).toLowerCase();
      filteredPrograms = filteredPrograms.filter((prog) => {
        const amount = prog.fee?.amount || 0;

        if (feeStr === "0-1-lakh" || feeStr === "1-lakh") return amount <= 100000;
        if (feeStr === "1-2-lakh") return amount >= 100000 && amount <= 200000;
        if (feeStr === "2-5-lakh") return amount >= 200000 && amount <= 500000;
        if (feeStr === "5-10-lakh") return amount >= 500000 && amount <= 1000000;
        if (feeStr === "above-10-lakh" || feeStr === "10-lakh+") return amount >= 1000000;
        return true;
      });
    }

    // 5️⃣ Search Query Filter (Title, Category, University, Subcourse)
    if (search && search.trim().length > 0) {
      const sTerm = search.trim().toLowerCase();
      filteredPrograms = filteredPrograms.filter((prog) => {
        const title = (prog.title || "").toLowerCase();
        const uniObj = prog.university || (prog.universityOfferings && prog.universityOfferings[0]?.university);
        const uniName = (uniObj?.name || "").toLowerCase();
        const provider = (prog.provider || "").toLowerCase();
        const subCatName = (prog.subcourseCategory?.name || "").toLowerCase();
        const subCatSlug = (prog.subcourseCategory?.slug || "").toLowerCase();
        const mainCatNames = (prog.categories || []).map((c) => (c?.name || "").toLowerCase()).join(" ");
        const mainCatSlugs = (prog.categories || []).map((c) => (c?.slug || "").toLowerCase()).join(" ");
        const subName = (prog.subcourse?.name || "").toLowerCase();
        const subTitle = (prog.subcourse?.title || "").toLowerCase();

        const targetText = `${title} ${uniName} ${provider} ${subCatName} ${subCatSlug} ${mainCatNames} ${mainCatSlugs} ${subName} ${subTitle}`;

        return targetText.includes(sTerm);
      });
    }

    filteredPrograms = filteredPrograms.filter(prog => prog && Object.keys(prog).length > 0 && (prog.title || prog.slug || prog.name || prog._id));

    const totalCount = filteredPrograms.length;
    const limit = limitNum > 0 ? limitNum : 10;
    const paginatedPrograms = filteredPrograms.slice(skipNum, skipNum + limit);
    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 1;

    return reply.code(200).send({
      success: true,
      result: {
        programs: paginatedPrograms,
        total: totalCount,
        page: pageNum,
        limit,
        totalPages,
        hasNextPage: limit > 0 && pageNum < totalPages,
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

    const slugify = (text) => (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 1. Try finding by slug directly
    let courseDoc = await Course.findOne({ slug, removed: false })
      .populate({ path: "categories", select: "_id name slug" })
      .populate({ path: "logo", select: "_id name url alt" })
      .populate({ path: "image", select: "_id name url alt" })
      .populate({ path: "brochureUrl", select: "_id name url alt" })
      .populate(populateOfferings)
      .lean();

    let matchedSubcourseSlug = null;
    let matchedOfferingIdx = 0;

    // 2. If not found directly, look up all courses to match by subcourse/specialization title slug
    if (!courseDoc) {
      const allCourses = await Course.find({ removed: false })
        .populate({ path: "categories", select: "_id name slug" })
        .populate({ path: "logo", select: "_id name url alt" })
        .populate({ path: "image", select: "_id name url alt" })
        .populate({ path: "brochureUrl", select: "_id name url alt" })
        .populate(populateOfferings)
        .lean();

      for (const doc of allCourses) {
        let matched = false;
        if (doc.universityOfferings) {
          for (let oIdx = 0; oIdx < doc.universityOfferings.length; oIdx++) {
            const offering = doc.universityOfferings[oIdx];
            if (offering.subcourses) {
              for (const sub of offering.subcourses) {
                const mainTitle = (doc.title || doc.name || "").trim();
                const subTitle = (sub.title || sub.name || "").trim();
                let combinedTitle = subTitle;
                if (mainTitle && subTitle && !subTitle.toLowerCase().includes(mainTitle.toLowerCase())) {
                  combinedTitle = `${mainTitle} - ${subTitle}`;
                }

                // Match against subcourse title, subcourse ref slug/name, or category name
                const candidates = [
                  sub.title,
                  sub.name,
                  sub.subcourse?.title,
                  sub.subcourse?.name,
                  sub.subcourse?.slug,
                  sub.category?.name,
                  combinedTitle,
                ].filter(Boolean);

                if (candidates.some(c => slugify(c) === slug || c === slug)) {
                  matched = true;
                  matchedOfferingIdx = oIdx;
                  matchedSubcourseSlug = slugify(sub.title || sub.name || sub.subcourse?.title || slug);
                  break;
                }
              }
            }
            if (matched) break;
          }
        }
        if (matched) {
          courseDoc = doc;
          break;
        }
      }
    }

    if (!courseDoc) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    return reply.code(200).send({
      success: true,
      result: {
        ...courseDoc,
        activeOfferingIdx: matchedOfferingIdx,
        activeSubcourseSlug: matchedSubcourseSlug,
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
