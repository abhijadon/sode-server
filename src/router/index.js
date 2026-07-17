"use strict";

const { basename, extname, join } = require("path");
const { globSync } = require("glob");
const mongoose = require("mongoose");
const CrudController = require("../controller/crud");
const HeaderController = require("../controller/header");
const appModelsFiles = globSync("./src/model/**/*.js");

// ✅ एडवांस पॉपुलेट कॉन्फ़िगरेशन मैप
const populateMap = {
  header: [
    // ✅ 'headers' से बदलकर 'header' किया गया (चूंकि फाइल का नाम header.js है)
    {
      path: "parentId",
      select: "label href slug",
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

      // आपके मॉडल एक्सपोर्ट स्ट्रक्चर ({ Header }) को हैंडल करने के लिए सटीक मैपिंग
      Model =
        loadedModule[modelName] ||
        loadedModule.Model ||
        loadedModule.default ||
        loadedModule;
    }

    // अगर सही मोंगोडिबी मॉडल नहीं मिल पाता है तो रूट स्कीपिंग
    if (!Model || !Model.modelName) {
      continue;
    }

    const populateFields = populateMap[entity] || [];

    const routes = [
      {
        method: "GET",
        url: `/${entity}/list`,
        handler: CrudController.pagination(Model, populateFields),
      },
      {
        method: "GET",
        url: `/${entity}/read/:id`,
        handler: CrudController.read(Model, populateFields),
      },
      {
        method: "POST",
        url: `/${entity}/create`,
        handler: CrudController.create(Model),
      },
      {
        method: "PUT",
        url: `/${entity}/update/:id`,
        handler: CrudController.update(Model),
      },
      {
        method: "DELETE",
        url: `/${entity}/delete/:id`,
        handler: CrudController.remove(Model),
      },
    ];

    // ✅ स्पेशल ट्री रूट: 'headers' से बदलकर 'header' किया क्योंकि entity नाम सिंगल में आएगा
    if (entity === "header") {
      routes.push({
        method: "GET",
        url: `/${entity}/tree`,
        handler: HeaderController.getWebsiteHeaders,
      });
    }

    for (const routeOpts of routes) {
      app.route({
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
      });
    }
  }
};
