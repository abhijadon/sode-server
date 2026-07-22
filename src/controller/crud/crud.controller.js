"use strict";

const mongoose = require("mongoose");
const filterableFields = require("./filterable-fields");
const searchableFields = require("./searchable-fields");

// Helper function to build schema-safe queries dynamically based on Model schema paths
function buildSchemaPermissionQuery(Model, req) {
  const queryConditions = {};

  // 1. Auto-filter removed: false if schema contains 'removed' field
  if (Model.schema && Model.schema.path("removed")) {
    queryConditions.removed = false;
  }

  // 2. Filter enabled: true for selectOptions / dropdown queries if 'enabled' exists
  const rawUrl = String(req.raw?.url || req.url || "").toLowerCase();
  if (rawUrl.includes("/options") && Model.schema && Model.schema.path("enabled")) {
    queryConditions.enabled = true;
  }

  if (req.userPermissionContext) {
    const { visibleUserIds, tenantId, workspaceIds, isAdminOrOwner } =
      req.userPermissionContext;

    if (!isAdminOrOwner) {
      // 1. Tenant Isolation Check
      if (tenantId) {
        if (Model.modelName === "Tenant") {
          queryConditions._id = new mongoose.Types.ObjectId(tenantId);
        } else if (Model.schema && Model.schema.path("tenantId")) {
          queryConditions.tenantId = new mongoose.Types.ObjectId(tenantId);
        }
      }

      // 2. Workspace Isolation Check
      if (workspaceIds && workspaceIds.length > 0) {
        const validWsObjIds = workspaceIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));

        if (validWsObjIds.length > 0) {
          if (Model.modelName === "Workspace") {
            queryConditions._id = { $in: validWsObjIds };
          } else if (Model.schema && Model.schema.path("workspace")) {
            queryConditions.workspace = { $in: validWsObjIds };
          }
        }
      }

      // 3. User / Lead / Org Chart Hierarchy Check
      const isUserOrLeadEntity =
        Model.modelName === "User" ||
        Model.modelName === "Lead" ||
        Model.modelName === "Application" ||
        Model.modelName === "Student";

      if (isUserOrLeadEntity && visibleUserIds && visibleUserIds.length > 0) {
        const orConditions = [];
        if (Model.schema.path("userId")) {
          orConditions.push({ userId: { $in: visibleUserIds } });
        }
        if (Model.schema.path("counsellors")) {
          orConditions.push({ counsellors: { $in: visibleUserIds } });
        }
        if (Model.schema.path("reportsTo")) {
          orConditions.push({ reportsTo: { $in: visibleUserIds } });
        }
        if (Model.modelName === "User") {
          orConditions.push({ _id: { $in: visibleUserIds } });
        }

        if (orConditions.length > 0) {
          queryConditions.$and = queryConditions.$and || [];
          queryConditions.$and.push({ $or: orConditions });
        }
      }
    }
  }

  return queryConditions;
}

function create(Model) {
  return async (request, reply) => {
    try {
      if (request.user) {
        if (Model.schema && Model.schema.path("userId") && !request.body.userId) {
          request.body.userId = request.user._id;
        }
        if (
          Model.schema &&
          Model.schema.path("tenantId") &&
          !request.body.tenantId &&
          request.user.tenantId
        ) {
          request.body.tenantId = request.user.tenantId;
        }
        if (
          Model.schema &&
          Model.schema.path("workspace") &&
          !request.body.workspace &&
          request.user.workspace
        ) {
          request.body.workspace = request.user.workspace;
        }
      }

      const modelName = Model.modelName;
      const skipDuplicateCheckModels = ["Header", "Sidebar"];
      const shouldSkipNameCheck = skipDuplicateCheckModels.includes(modelName);

      /* =======================================
         ✅ NAME VALIDATION (नाम की जांच)
         ======================================= */
      if (!shouldSkipNameCheck && Model.schema && Model.schema.path("name")) {
        if (!request.body.name) {
          return reply.code(400).send({
            success: false,
            result: null,
            message: "Name field is required",
          });
        }

        const { name } = request.body;
        const existsQuery = { name };
        if (Model.schema.path("removed")) {
          existsQuery.removed = false;
        }

        const existingDocument = await Model.exists(existsQuery);
        if (existingDocument) {
          return reply.code(400).send({
            success: false,
            result: null,
            message: `${modelName} with this name already exists`,
          });
        }
      }

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
      const updateData = { ...request.body };

      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Sanitize nested populated objects (e.g. roles: [{_id}], parentId: {_id})
      Object.keys(updateData).forEach((key) => {
        const val = updateData[key];
        if (Array.isArray(val)) {
          updateData[key] = val.map((item) =>
            item && typeof item === "object" && item._id ? item._id : item
          );
        } else if (val && typeof val === "object" && val._id) {
          updateData[key] = val._id;
        }
      });

      const document = await Model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

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

function remove(Model, relatedModels = []) {
  return async (request, reply) => {
    try {
      const { id } = request.params;

      const document = await Model.findById(id);
      if (!document) {
        return reply.code(404).send({
          success: false,
          result: null,
          message: `${Model.modelName} not found`,
        });
      }

      const deletedLogs = [];

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

            await RelatedModel.deleteMany({ [foreignKey]: id });
          }
        }
      }

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

      const fieldsToPopulate = Array.isArray(populateFields)
        ? populateFields
        : [populateFields];

      let query = Model.findById(id);

      fieldsToPopulate.forEach((field) => {
        if (field) query = query.populate(field);
      });

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

      const sanitizedItems = Math.min(Math.max(parseInt(items, 10), 1), 500);
      const sanitizedPage = Math.max(parseInt(page, 10), 1);
      const skip = (sanitizedPage - 1) * sanitizedItems;

      const modelName = Model.modelName;
      const allowedFilterFields = filterableFields[modelName] || ["*"];
      const allowedSearchFields = searchableFields[modelName] || [];

      // ✅ Build schema-safe base query conditions
      const queryConditions = buildSchemaPermissionQuery(Model, request);

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
      const allowAllFilters = allowedFilterFields.includes("*");
      for (const key in filters) {
        if (
          (allowAllFilters || allowedFilterFields.includes(key)) &&
          Model.schema &&
          Model.schema.path(key)
        ) {
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

function selectOptions(
  Model,
  customSelect = null,
  parentField = null,
  parentFields = "",
  childField = null
) {
  return async (request, reply) => {
    try {
      // ✅ Build schema-safe base query conditions
      const query = buildSchemaPermissionQuery(Model, request);

      if (request.query?.entity) {
        query.entity = {
          $in: [request.query.entity],
        };
      }

      let fieldsToSelect = customSelect;
      if (!fieldsToSelect) {
        const potentialFields = [
          "name",
          "fullname",
          "title",
          "label",
          "username",
          "email",
          "slug",
          "enabled",
        ];
        const validFields = potentialFields.filter(
          (f) => Model.schema && Model.schema.path(f)
        );
        fieldsToSelect = ["_id", ...validFields].join(" ");
      } else {
        const requestedArray = fieldsToSelect.split(" ");
        const validArray = requestedArray.filter(
          (f) => f === "_id" || (Model.schema && Model.schema.path(f))
        );
        if (validArray.length > 0) {
          fieldsToSelect = validArray.join(" ");
        }
      }

      if (
        parentField &&
        !fieldsToSelect.includes(parentField) &&
        Model.schema &&
        Model.schema.path(parentField)
      ) {
        fieldsToSelect += ` ${parentField}`;
      }

      let itemsQuery = Model.find(query).select(fieldsToSelect);
      if (parentField) {
        itemsQuery = itemsQuery.populate({
          path: parentField,
          select: parentFields,
          strictPopulate: false,
        });
      }

      const items = await itemsQuery
        .sort({
          fullname: 1,
          name: 1,
          title: 1,
          createdAt: -1,
        })
        .lean();

      if (childField && parentField) {
        const parentIds = items.map((i) => i[parentField]?._id).filter(Boolean);

        const children = await Model.find({
          [childField]: {
            $in: parentIds,
          },
          ...(Model.schema?.path("removed") ? { removed: false } : {}),
        }).lean();

        items.forEach((item) => {
          item.children = children.filter(
            (child) => String(child[childField]) === String(item._id)
          );
        });
      }

      return reply.code(200).send({
        success: true,
        result: items,
        message: `${Model.modelName} items retrieved successfully`,
      });
    } catch (error) {
      console.error(`❌ Error in selectOptions(${Model.modelName}):`, error);
      return reply.code(500).send({
        success: false,
        result: null,
        message: `An error occurred while retrieving ${Model.modelName} items`,
        error: error.message,
      });
    }
  };
}

module.exports = { create, update, remove, read, pagination, selectOptions };
