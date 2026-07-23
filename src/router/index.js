"use strict";

const { basename, extname, join } = require("path");
const { globSync } = require("glob");
const mongoose = require("mongoose");

const CrudController = require("../controller/crud");
const AuthController = require("../controller/auth");
const HeaderController = require("../controller/header");
const CourseController = require("../controller/course/course.controller");
const UniversityController = require("../controller/university/university.controller");
const PageMetaController = require("../controller/pagemeta/pagemeta.controller");
const SiteSettingController = require("../controller/sitesetting/sitesetting.controller");
const FaqController = require("../controller/faq/faq.controller");
const MediaController = require("../controller/media/media.controller");
const HeroController = require("../controller/hero/hero.controller");
const CategoryController = require("../controller/category/category.controller");

const { authenticate } = require("../middleware/auth/authenticate");
const { checkPermission } = require("../middleware/auth/checkPermission");
const { report_system } = require("../middleware/auth/report_system");
const { accesspermission } = require("../middleware/auth/accesspermission");
const { useCache } = require("../middleware/cache.middleware");

const appModelsFiles = globSync("./src/model/**/*.js");

// ✅ एडवांस पॉपुलेट कॉन्फ़िगरेशन मैप
const populateMap = {
  user: [
    {
      path: "role",
      select: "name action des",
    },
    {
      path: "workspace",
      select: "name",
    },
    {
      path: "reportsTo",
      select: "fullname username email",
    },
  ],
  workspace: [
    {
      path: "tenantId",
      select: "name slug",
    },
  ],
  header: [
    {
      path: "parentId",
      select: "label href slug",
    },
  ],
  sidebar: [
    {
      path: "parentId",
      select: "title path section",
    },
    {
      path: "roles",
      select: "name",
    },
  ],
  course: [
    {
      path: "category",
      select: "name slug type",
    },
    {
      path: "duration",
      select: "title slug months",
    },
    {
      path: "eligibility",
      select: "title slug",
    },
    {
      path: "university",
      select: "name slug logoSrc imageSrc",
    },
    {
      path: "fee",
      select: "title amount currency slug",
    },
    {
      path: "image",
      select: "url alt name",
    },
    {
      path: "logo",
      select: "url alt name",
    },
  ],
  subcourse: [
    {
      path: "course",
      select: "title category university slug",
    },
    {
      path: "category",
      select: "name slug type",
    },
    {
      path: "duration",
      select: "title slug months",
    },
    {
      path: "eligibility",
      select: "title slug",
    },
    {
      path: "university",
      select: "name slug logoSrc imageSrc",
    },
    {
      path: "fee",
      select: "title amount currency slug",
    },
    {
      path: "image",
      select: "url alt name",
    },
  ],
  category: [
    {
      path: "parentId",
      select: "name slug type",
    },
  ],
  university: [
    {
      path: "logoSrc",
      select: "url alt name",
    },
    {
      path: "imageSrc",
      select: "url alt name",
    },
  ],
  partneruniversity: [
    {
      path: "university",
      select: "name slug logoSrc imageSrc",
    },
    {
      path: "courses",
      select: "_id title slug category image logo",
    },
  ],
  partnercourse: [
    {
      path: "course",
      select: "title slug category",
    },
    {
      path: "university",
      select: "name slug logoSrc imageSrc",
    },
    {
      path: "category",
      select: "name slug type",
    },
    {
      path: "duration",
      select: "title slug months",
    },
    {
      path: "eligibility",
      select: "title slug",
    },
    {
      path: "fee",
      select: "title amount currency slug",
    },
    {
      path: "image",
      select: "url alt name",
    },
    {
      path: "logo",
      select: "url alt name",
    },
  ],
  state: [
    {
      path: "country",
      select: "name slug enabled",
    },
  ],
  city: [
    {
      path: "state",
      select: "name slug country enabled",
      populate: {
        path: "country",
        select: "name slug enabled",
      },
    },
  ],
  pincode: [
    {
      path: "city",
      select: "name slug state enabled",
    },
  ],
  location: [
    {
      path: "pincode",
      select: "code city enabled",
    },
    {
      path: "city",
      select: "name slug state enabled",
      populate: {
        path: "state",
        select: "name slug country enabled",
      },
    },
  ],
  content: [
    {
      path: "author",
      select: "fullname username email",
    },
    {
      path: "category",
      select: "name slug type",
    },
    {
      path: "image",
      select: "url alt name",
    },
  ],
  rating: [
    {
      path: "createdBy",
      select: "fullname username email",
    },
  ],
  page: [
    {
      path: "associatedCourse",
      select: "title slug logo image",
    },
    {
      path: "associatedUniversity",
      select: "name slug logoSrc imageSrc",
    },
  ],
};

// ✅ ऑप्शंस सेलेक्ट फ़ील्ड्स कॉन्फ़िगरेशन मैप (Router Level Projections)
const optionsSelectMap = {
  user: "_id fullname username email enabled",
  role: "_id name des enabled",
  workspace: "_id name description tenantId enabled",
  tenant: "_id name slug enabled",
  header: "_id label href slug parentId enabled",
  sidebar: "_id title path section roles parentId enabled",
  category: "_id name slug type parentId enabled",
  duration: "_id title slug months enabled order",
  eligibility: "_id title slug enabled order",
  fee: "_id title amount currency slug enabled order",
  media: "_id name url alt fileName enabled",
  course: "_id title slug category logo image enabled",
  partnercourse: "_id title slug course university category logo enabled",
  subcourse: "_id title slug course fee duration enabled",
  university: "_id name slug logoSrc enabled",
  partneruniversity: "_id name slug logoSrc imageSrc brochureUrl courses paragraphs featured enabled order",
  pagemeta: "_id pageName pagePath title enabled",
  sitesetting: "_id siteName siteUrl gtmId enabled",
  country: "_id name slug enabled",
  state: "_id name slug country enabled",
  city: "_id name slug state enabled",
  pincode: "_id code city enabled",
  location: "_id name slug pincode city enabled",
  content: "_id title slug contentType summary enabled image category author createdAt",
  rating: "_id rating review title status isVerifiedPurchase createdBy enabled",
  theme: "_id themeName primaryColor secondaryColor themeMode isDefault enabled",
  page: "_id title slug pageType associatedCourse associatedUniversity enabled",
};

module.exports = async function (app, options) {
  for (const filePath of appModelsFiles) {
    const fileNameWithExtension = basename(filePath);
    const fileNameWithoutExtension = fileNameWithExtension.replace(
      extname(fileNameWithExtension),
      ""
    );
    const firstChar = fileNameWithoutExtension.charAt(0);
    const modelName = fileNameWithoutExtension.replace(
      firstChar,
      firstChar.toUpperCase()
    );
    const entity = fileNameWithoutExtension.toLowerCase();

    let Model;
    try {
      Model = mongoose.model(modelName);
    } catch (e) {
      const fullModelPath = join(process.cwd(), filePath);
      const loadedModule = require(fullModelPath);

      Model =
        loadedModule[modelName] ||
        loadedModule.Model ||
        loadedModule.default ||
        loadedModule;
    }

    if (!Model || !Model.modelName) {
      continue;
    }

    const populateFields = populateMap[entity] || [];
    const customOptionsSelect = optionsSelectMap[entity] || null;

    let createHandler = CrudController.create(Model);
    let updateHandler = CrudController.update(Model);
    let removeHandler = CrudController.remove(Model);

    if (entity === "user") {
      createHandler = AuthController.create;
      updateHandler = AuthController.update;
      removeHandler = AuthController.remove;
    }

    if (entity === "media") {
      removeHandler = MediaController.deleteMedia;
    }

    // 🔐 FULL UNIFIED MIDDLEWARE PIPELINE DEFINITIONS
    const listPipeline = [
      authenticate,
      checkPermission("read"),
      report_system,
      accesspermission,
    ];
    const optionsPipeline = [
      authenticate,
      checkPermission("read"),
      report_system,
      accesspermission,
    ];
    const readPipeline = [
      authenticate,
      checkPermission("read"),
      report_system,
      accesspermission,
    ];
    const createPipeline = [
      authenticate,
      checkPermission("create"),
      report_system,
      accesspermission,
    ];
    const updatePipeline = [
      authenticate,
      checkPermission("update"),
      report_system,
      accesspermission,
    ];
    const deletePipeline = [
      authenticate,
      checkPermission("delete"),
      report_system,
      accesspermission,
    ];

    const routes = [
      {
        method: "GET",
        url: `/${entity}/list`,
        handler: CrudController.pagination(Model, populateFields),
        preValidation: listPipeline,
      },
      {
        method: "GET",
        url: `/${entity}/options`,
        handler: CrudController.selectOptions(Model, customOptionsSelect),
        preValidation: optionsPipeline,
      },
      {
        method: "GET",
        url: `/${entity}/read/:id`,
        handler: CrudController.read(Model, populateFields),
        preValidation: readPipeline,
      },
      {
        method: "POST",
        url: `/${entity}/create`,
        handler: createHandler,
        preValidation: createPipeline,
      },
      {
        method: "PUT",
        url: `/${entity}/update/:id`,
        handler: updateHandler,
        preValidation: updatePipeline,
      },
      {
        method: "DELETE",
        url: `/${entity}/delete/:id`,
        handler: removeHandler,
        preValidation: deletePipeline,
      },
    ];

    // ✅ SPECIAL TREE ROUTE FOR HEADER (Public)
    if (entity === "header") {
      routes.push(
        {
          method: "GET",
          url: `/${entity}/tree`,
          handler: HeaderController.getWebsiteHeaders,
          preValidation: null,
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: HeaderController.getWebsiteHeaders,
          preValidation: null,
        }
      );
    }

    // ✅ SPECIAL TREE ROUTE FOR SIDEBAR (Protected by Full Security & RBAC Pipeline)
    if (entity === "sidebar") {
      routes.push({
        method: "GET",
        url: `/${entity}/tree`,
        handler: HeaderController.getSidebar,
        preValidation: readPipeline,
      });
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTES FOR COURSES
    if (entity === "course") {
      routes.push(
        {
          method: "GET",
          url: `/courses/website-list`,
          handler: CourseController.getWebsiteCourses,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: CourseController.getWebsiteCourses,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/courses/website-read`,
          handler: CourseController.getWebsiteCourseBySlug,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-read`,
          handler: CourseController.getWebsiteCourseBySlug,
          preValidation: null,
          ...useCache(300),
        }
      );
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTES FOR UNIVERSITIES & PARTNER UNIVERSITIES
    if (entity === "university") {
      routes.push(
        {
          method: "GET",
          url: `/university/compare`,
          handler: UniversityController.getWebsiteUniversitiesCompare,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: UniversityController.getWebsiteUniversities,
          preValidation: null,
          ...useCache(300),
        }
      );
    } else if (entity === "partneruniversity") {
      routes.push(
        {
          method: "GET",
          url: `/partneruniversities/website-list`,
          handler: UniversityController.getWebsiteUniversities,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/partneruniversities/compare`,
          handler: UniversityController.getWebsiteUniversitiesCompare,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: UniversityController.getWebsiteUniversities,
          preValidation: null,
          ...useCache(300),
        }
      );
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR PAGES BUILDER
    if (entity === "page") {
      routes.push({
        method: "GET",
        url: `/${entity}/website-read`,
        handler: require("../controller/page/page.controller").getWebsitePageBySlug,
        preValidation: null,
        ...useCache(300),
      });
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR PAGE META
    if (entity === "pagemeta") {
      routes.push({
        method: "GET",
        url: `/${entity}/website-read`,
        handler: PageMetaController.getWebsitePageMeta,
        preValidation: null,
        ...useCache(300),
      });
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR SITE SETTINGS
    if (entity === "sitesetting") {
      routes.push({
        method: "GET",
        url: `/${entity}/website-read`,
        handler: SiteSettingController.getWebsiteSiteSetting,
        preValidation: null,
        ...useCache(300),
      });
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR FAQS
    if (entity === "faq") {
      routes.push(
        {
          method: "GET",
          url: `/faqs/website-list`,
          handler: FaqController.getWebsiteFaqs,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: FaqController.getWebsiteFaqs,
          preValidation: null,
          ...useCache(300),
        }
      );
    }

    // ✅ SPECIAL WEBSITE READ ROUTE FOR HERO
    if (entity === "hero") {
      routes.push(
        {
          method: "GET",
          url: `/${entity}/website-read`,
          handler: HeroController.getWebsiteHero,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/heroes/website-read`,
          handler: HeroController.getWebsiteHero,
          preValidation: null,
          ...useCache(300),
        }
      );
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTES FOR CATEGORIES
    if (entity === "category") {
      routes.push(
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: CategoryController.getWebsiteCategories,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/categories/website-list`,
          handler: CategoryController.getWebsiteCategories,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-read`,
          handler: CategoryController.getWebsiteCategoryBySlug,
          preValidation: null,
          ...useCache(300),
        },
        {
          method: "GET",
          url: `/${entity}/website-tree`,
          handler: CategoryController.getWebsiteCategoryTree,
          preValidation: null,
          ...useCache(300),
        }
      );
    }

    // ✅ SPECIAL UPLOAD AND PRESIGNED ROUTES FOR MEDIA
    if (entity === "media") {
      routes.push(
        {
          method: "POST",
          url: `/${entity}/upload`,
          handler: MediaController.uploadMedia,
          preValidation: createPipeline,
        },
        {
          method: "GET",
          url: `/${entity}/presigned/:id`,
          handler: MediaController.getPresignedMediaUrl,
          preValidation: readPipeline,
        },
        // Bucket management
        {
          method: "GET",
          url: `/${entity}/buckets`,
          handler: MediaController.getBucketList,
          preValidation: readPipeline,
        },
        {
          method: "POST",
          url: `/${entity}/buckets/create`,
          handler: MediaController.createNewBucket,
          preValidation: createPipeline,
        }
      );
    }

    // ✅ USER SPECIFIC AUTH ROUTES
    if (entity === "user") {
      routes.push(
        {
          method: "POST",
          url: `/${entity}/login`,
          handler: AuthController.login,
          preValidation: null,
        },
        {
          method: "POST",
          url: `/${entity}/logout`,
          handler: AuthController.logout,
          preValidation: [authenticate],
        }
      );
    }

    // REGISTER ALL ROUTES WITH FASTIFY WITH GLOBAL AUTOMATIC REDIS CACHING
    for (const routeOpts of routes) {
      const routeConfig = {
        method: routeOpts.method,
        url: routeOpts.url,
        handler: async (request, reply) => {
          try {
            await routeOpts.handler(request, reply);
          } catch (err) {
            reply.code(err.statusCode || 500).send({
              success: false,
              message: err.message || "Internal Server Error",
            });
          }
        },
        preValidation: undefined,
        preHandler: undefined,
        onSend: undefined,
      };

      if (routeOpts.preValidation) {
        routeConfig.preValidation = routeOpts.preValidation;
      }

      // 1. Automatically attach Redis caching to ALL GET requests across the entire application
      const customPreHandler = routeOpts["preHandler"];
      const customOnSend = routeOpts["onSend"];

      if (routeOpts.method === "GET") {
        const cacheHooks = useCache(300);
        routeConfig.preHandler = customPreHandler
          ? Array.isArray(customPreHandler)
            ? [...customPreHandler, cacheHooks.preHandler]
            : [customPreHandler, cacheHooks.preHandler]
          : cacheHooks.preHandler;
        routeConfig.onSend = cacheHooks.onSend;
      } else {
        if (customPreHandler) {
          routeConfig.preHandler = customPreHandler;
        }
        if (customOnSend) {
          routeConfig.onSend = customOnSend;
        }
      }

      // 2. Automatically invalidate cache on successful write mutations (POST, PUT, PATCH, DELETE)
      if (["POST", "PUT", "PATCH", "DELETE"].includes(routeOpts.method)) {
        const originalOnSend = routeConfig.onSend;
        routeConfig.onSend = async (request, reply, payload) => {
          if (reply.statusCode >= 200 && reply.statusCode < 300) {
            const { clearAllCache } = require("../middleware/cache.middleware");
            clearAllCache();
          }
          if (originalOnSend) {
            return originalOnSend(request, reply, payload);
          }
          return payload;
        };
      }

      app.route(routeConfig);
    }
  }
};
