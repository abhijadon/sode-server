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

const { authenticate } = require("../middleware/auth/authenticate");
const { checkPermission } = require("../middleware/auth/checkPermission");
const { report_system } = require("../middleware/auth/report_system");
const { accesspermission } = require("../middleware/auth/accesspermission");

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
};

// ✅ ऑप्शंस सेलेक्ट फ़ील्ड्स कॉन्फ़िगरेशन मैप (Router Level Projections)
const optionsSelectMap = {
  user: "_id fullname username email enabled",
  role: "_id name des enabled",
  workspace: "_id name description tenantId enabled",
  tenant: "_id name slug enabled",
  header: "_id label href slug parentId enabled",
  sidebar: "_id title path section roles parentId enabled",
  course: "_id title slug category university logo enabled",
  university: "_id name slug logoSrc enabled",
  pagemeta: "_id pageName pagePath title enabled",
  sitesetting: "_id siteName siteUrl gtmId enabled",
  media: "_id name alt url mimeType bucket key enabled",
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
      routes.push({
        method: "GET",
        url: `/${entity}/tree`,
        handler: HeaderController.getWebsiteHeaders,
        preValidation: null,
      });
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
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: CourseController.getWebsiteCourses,
          preValidation: null,
        }
      );
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTES FOR UNIVERSITIES
    if (entity === "university") {
      routes.push(
        {
          method: "GET",
          url: `/universities/website-list`,
          handler: UniversityController.getWebsiteUniversities,
          preValidation: null,
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: UniversityController.getWebsiteUniversities,
          preValidation: null,
        }
      );
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR PAGE META
    if (entity === "pagemeta") {
      routes.push({
        method: "GET",
        url: `/${entity}/website-read`,
        handler: PageMetaController.getWebsitePageMeta,
        preValidation: null,
      });
    }

    // ✅ SPECIAL PUBLIC WEBSITE ROUTE FOR SITE SETTINGS
    if (entity === "sitesetting") {
      routes.push({
        method: "GET",
        url: `/${entity}/website-read`,
        handler: SiteSettingController.getWebsiteSiteSetting,
        preValidation: null,
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
        },
        {
          method: "GET",
          url: `/${entity}/website-list`,
          handler: FaqController.getWebsiteFaqs,
          preValidation: null,
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

    // REGISTER ALL ROUTES WITH FASTIFY
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
      };

      if (routeOpts.preValidation) {
        routeConfig.preValidation = routeOpts.preValidation;
      }
      app.route(routeConfig);
    }
  }
};
