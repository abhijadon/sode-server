"use strict";

const filterableFields = require("./filterable-fields");
const searchableFields = require("./searchable-fields");

function create(Model) {
  return async (request, reply) => {
    try {
      if (request.user && request.user._id) {
        request.body.userId = request.user._id;
      }

      const modelName = Model.modelName;
      const skipDuplicateCheckModels = ["Header", "Sidebar"];
      const shouldSkipNameCheck = skipDuplicateCheckModels.includes(modelName);

      /* =======================================
         ✅ NAME VALIDATION (नाम की जांच)
         ======================================= */
      if (!shouldSkipNameCheck) {
        if (!request.body.name) {
          return reply.code(400).send({
            success: false,
            result: null,
            message: "Name field is required",
          });
        }

        const { name } = request.body;
        // Fastify/MongoDB Performance: .exists() केवल boolean चेक करता है जो कि सबसे तेज़ है
        const existingDocument = await Model.exists({ name });
        if (existingDocument) {
          return reply.code(400).send({
            success: false,
            result: null,
            message: `${modelName} with this name already exists`,
          });
        }
      }

      // डेटाबेस में नया डॉक्यूमेंट सेव करना
      const document = new Model(request.body);
      const savedDocument = await document.save();

      return reply.code(200).send({
        success: true,
        result: savedDocument,
        message: `${modelName} created successfully`,
      });
    } catch (err) {
      console.error("Error creating document:", err);
      return reply.code(500).send({
        success: false,
        result: null,
        message: "An error occurred while creating the document",
        error: err.message,
      });
    }
  };
}

function update(Model) {
  return async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // डेटाबेस में डॉक्यूमेंट को अपडेट करना
      const document = await Model.findByIdAndUpdate(id, updateData, {
        new: true, // अपडेट होने के बाद नया डेटा रिटर्न करेगा
        runValidators: true, // स्कीमा में लगे वैलिडेशन्स को रन करेगा
      });

      // यदि डॉक्यूमेंट नहीं मिलता है
      if (!document) {
        return reply.code(404).send({
          success: false,
          result: null,
          message: `${Model.modelName} not found`,
        });
      }

      return reply.code(200).send({
        success: true,
        result: document,
        message: `${Model.modelName} updated successfully`,
      });
    } catch (error) {
      console.error(`❌ Error updating ${Model.modelName}:`, error);

      return reply.code(500).send({
        success: false,
        result: null,
        message: "An error occurred while updating the document",
        error: error.message,
      });
    }
  };
}

/**
 * 3. जेनेरिक रिमूव/डिलीट कंट्रोलर
 */
function remove(Model, relatedModels = []) {
  return async (request, reply) => {
    try {
      const { id } = request.params;

      // ✅ चेक करें कि डॉक्यूमेंट मौजूद है या नहीं
      const document = await Model.findById(id);
      if (!document) {
        return reply.code(404).send({
          success: false,
          result: null,
          message: `${Model.modelName} not found`,
        });
      }

      const deletedLogs = [];

      // ✅ निर्भर (Related) मॉडल्स को पहले क्लीनअप करना (Cascading Delete)
      if (relatedModels.length > 0) {
        for (const { model: RelatedModel, foreignKey } of relatedModels) {
          const relatedDocs = await RelatedModel.find({ [foreignKey]: id })
            .select("_id")
            .lean();

          if (relatedDocs.length > 0) {
            deletedLogs.push({
              model: RelatedModel.modelName,
              count: relatedDocs.length,
            });

            // संबंधित सभी डाक्यूमेंट्स को एक साथ डिलीट करना
            await RelatedModel.deleteMany({ [foreignKey]: id });
          }
        }
      }

      // ✅ मुख्य डॉक्यूमेंट को डिलीट करना
      await Model.deleteOne({ _id: id });

      return reply.code(200).send({
        success: true,
        result: { name: document.name || null },
        message: `${Model.modelName} deleted successfully`,
        deletedLogs,
      });
    } catch (error) {
      console.error(`❌ Error during deletion of ${Model.modelName}:`, error);
      return reply.code(500).send({
        success: false,
        result: null,
        message:
          "An error occurred while deleting the document or related data",
        error: error.message,
      });
    }
  };
}

function read(Model, populateFields = []) {
  return async (request, reply) => {
    try {
      const { id } = request.params;

      // सुनिश्चित करें कि populateFields एक Array है
      const fieldsToPopulate = Array.isArray(populateFields)
        ? populateFields
        : [populateFields];

      let query = Model.findById(id);

      // यदि रिलेशंस पॉपुलेट करने हैं
      fieldsToPopulate.forEach((field) => {
        if (field) query = query.populate(field);
      });

      // .lean() मोंगूज़ को हल्का और सुपर फ़ास्ट बनाता है
      const document = await query.lean();

      if (!document) {
        return reply.code(404).send({
          success: false,
          result: null,
          message: `${Model.modelName} not found`,
        });
      }

      return reply.code(200).send({
        success: true,
        result: document,
        message: `${Model.modelName} retrieved successfully`,
      });
    } catch (error) {
      console.error(`❌ Error in read(${Model.modelName}):`, error.message);

      return reply.code(500).send({
        success: false,
        result: null,
        message: "An error occurred while retrieving the document",
        error: error.message,
      });
    }
  };
}

function pagination(Model, populateFields = []) {
  return async (request, reply) => {
    const apiStart = process.hrtime.bigint();

    try {
      const {
        page = 1,
        items = 500,
        sort = "-createdAt",
        q,
        fields,
        ...filters
      } = request.query;

      // इनपुट्स सैनिटाइजेशन
      const sanitizedItems = Math.min(Math.max(parseInt(items, 10), 1), 500);
      const sanitizedPage = Math.max(parseInt(page, 10), 1);
      const skip = (sanitizedPage - 1) * sanitizedItems;

      const modelName = Model.modelName;
      const allowedFilterFields = filterableFields[modelName] || [];
      const allowedSearchFields = searchableFields[modelName] || [];

      const queryConditions = {};

      /* =======================================
         🔍 TEXT SEARCH (टेक्स्ट सर्च)
         ======================================= */
      if (q && allowedSearchFields.length > 0) {
        let orConditions = [];

        const safeFields = fields
          ? fields.split(",").filter((f) => allowedSearchFields.includes(f))
          : allowedSearchFields;

        if (safeFields.length > 0) {
          orConditions = safeFields.map((field) => ({
            [field]: { $regex: q, $options: "i" },
          }));

          queryConditions.$or = orConditions;
        }
      }

      /* =======================================
         🎯 EXACT FILTERS (फ़िल्टर्स)
         ======================================= */
      for (const key in filters) {
        if (allowedFilterFields.includes(key)) {
          queryConditions[key] = filters[key];
        }
      }

      /* =======================================
         📦 DATABASE QUERY (डेटाबेस क्वेरी)
         ======================================= */
      let query = Model.find(queryConditions)
        .sort(sort)
        .skip(skip)
        .limit(sanitizedItems)
        .lean();

      if (Array.isArray(populateFields) && populateFields.length > 0) {
        populateFields.forEach((field) => {
          if (field) query = query.populate(field);
        });
      }

      // Parallel execution से टाइम बचता है
      const [documents, totalCount] = await Promise.all([
        query,
        Model.countDocuments(queryConditions),
      ]);

      const totalPages = Math.ceil(totalCount / sanitizedItems);
      const apiEnd = process.hrtime.bigint();

      console.log(
        `🚀 [CRUD PAGINATION] ${modelName} list fetched in ${(
          Number(apiEnd - apiStart) / 1e6
        ).toFixed(2)} ms`,
      );

      return reply.code(200).send({
        success: true,
        result: documents,
        pagination: {
          currentPage: sanitizedPage,
          items: sanitizedItems,
          totalPages,
          totalCount,
        },
        message: `${modelName} data retrieved successfully`,
      });
    } catch (error) {
      console.error(`❌ Error in pagination(${Model.modelName}):`, error);
      return reply.code(500).send({
        success: false,
        result: null,
        message: "Server error in pagination",
        error: error.message,
      });
    }
  };
}

// सभी मेथड्स को एक साथ एक्सपोर्ट करना
module.exports = { create, update, remove, read, pagination };
