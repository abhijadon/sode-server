"use strict";

const { basename, extname, join } = require("path");
const { globSync } = require("glob");
const mongoose = require("mongoose");
const CrudController = require("../controller/crud");
const AuthController = require("../controller/auth");
const HeaderController = require("../controller/header");
const { authenticate } = require("../middleware/auth/authenticate");
const appModelsFiles = globSync("./src/model/**/*.js");

// ✅ एडवांस पॉपुलेट कॉन्फ़िगरेशन मैप
const populateMap = {
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

module.exports = async function (app, options) {
  for (const filePath of appModelsFiles) {
    const fileNameWithExtension = basename(filePath);
    const fileNameWithoutExtension = fileNameWithExtension.replace(
      extname(fileNameWithExtension),
      "",
    );
    const firstChar = fileNameWithoutExtension.charAt(0);
    const modelName = fileNameWithoutExtension.replace(
      firstChar,
      firstChar.toUpperCase(),
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

    let createHandler = CrudController.create(Model);
    let updateHandler = CrudController.update(Model);
    let removeHandler = CrudController.remove(Model);

    if (entity === "user") {
      createHandler = AuthController.create;
      updateHandler = AuthController.update;
      removeHandler = AuthController.remove;
    }

    const routes = [
      {
        method: "GET",
        url: `/${entity}/list`,
        handler: CrudController.pagination(Model, populateFields),
        preValidation: null,
      },
      {
        method: "GET",
        url: `/${entity}/read/:id`,
        handler: CrudController.read(Model, populateFields),
        preValidation: null,
      },
      {
        method: "POST",
        url: `/${entity}/create`,
        handler: createHandler,
        preValidation: null,
      },
      {
        method: "PUT",
        url: `/${entity}/update/:id`,
        handler: updateHandler,
        preValidation: null,
      },
      {
        method: "DELETE",
        url: `/${entity}/delete/:id`,
        handler: removeHandler,
        preValidation: null,
      },
    ];

    // ✅ FIXED: स्पेशल ट्री रूट फॉर हेडर (Header)
    if (entity === "header") {
      routes.push({
        method: "GET",
        url: `/${entity}/tree`,
        handler: HeaderController.getWebsiteHeaders,
        preValidation: null,
      });
    }

    // ✅ FIXED: स्पेशल ट्री रूट फॉर साइडबार (Sidebar)
    if (entity === "sidebar") {
      routes.push({
        method: "GET",
        url: `/${entity}/tree`,
        handler: HeaderController.getSidebar,
        preValidation: null,
      });
    }

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
        },
      );

      routes.forEach((route) => {
        if (
          route.url !== `/${entity}/login` &&
          route.url !== `/${entity}/create`
        ) {
          route.preValidation = [authenticate];
        }
      });
    }

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
