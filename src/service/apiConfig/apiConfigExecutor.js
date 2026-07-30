"use strict";

const { ApiConfig } = require("../../model/ApiConfig");
const { ApiLog } = require("../../model/ApiLog");

/**
 * Helper function to interpolate {{key}} with values from a data object
 */
function interpolate(str, data) {
  if (typeof str !== "string") return str;
  return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, key) => {
    const val = data[key.trim()];
    return val !== undefined && val !== null ? val : "";
  });
}

/**
 * Helper function for deep interpolation of objects/arrays
 */
function deepInterpolate(obj, data) {
  if (typeof obj === "string") {
    // preserve original type if it's a direct variable map (e.g. "{{phone}}" -> 919876543210)
    const pureVarMatch = obj.match(/^\{\{\s*([^}]+)\s*\}\}$/);
    if (pureVarMatch) {
      const key = pureVarMatch[1].trim();
      return data[key] !== undefined ? data[key] : "";
    }
    return interpolate(obj, data);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepInterpolate(item, data));
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const [k, v] of Object.entries(obj)) {
      newObj[k] = deepInterpolate(v, data);
    }
    return newObj;
  }
  return obj;
}

/**
 * Helper to set a value at a nested path using dot notation
 * e.g. setNestedValue({}, "attributes.FULLNAME", "John")
 */
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Dynamic API Executor with automatic Mongoose ApiLog recording
 * @param {string} configKey - Unique API key slug (e.g. "crm_lead_api")
 * @param {object} payload - Request payload data (e.g. lead data: name, email, phone, etc.)
 * @param {object} options - Optional overrides (endpoint, customHeaders, reqMeta: { ip, userAgent })
 */
async function executeApiConfigByKey(configKey, payload = {}, options = {}) {
  const startMs = Date.now();
  let apiConfigDoc = null;
  let targetUrl = "";
  let method = "POST";
  let requestHeaders = { "Content-Type": "application/json" };
  let reqMeta = options.reqMeta || {};

  try {
    // 1️⃣ Fetch active ApiConfig document from MongoDB
    apiConfigDoc = await ApiConfig.findOne({
      key: configKey,
      enabled: true,
      removed: false,
    });

    if (!apiConfigDoc) {
      throw new Error(`ApiConfig not found or disabled for key: '${configKey}'`);
    }

    // 2️⃣ Resolve Target URL, HTTP Method, and Headers
    let resolvedEndpoint = options.endpoint || apiConfigDoc.endpoint || apiConfigDoc.meta?.endpoint || "";
    resolvedEndpoint = interpolate(resolvedEndpoint, payload);

    if (resolvedEndpoint.startsWith("http://") || resolvedEndpoint.startsWith("https://")) {
      targetUrl = resolvedEndpoint;
    } else {
      let baseUrl = (apiConfigDoc.baseUrl || "").replace(/\/$/, "");
      baseUrl = interpolate(baseUrl, payload);
      const pathUrl = (resolvedEndpoint || "").replace(/^\//, "");
      targetUrl = pathUrl ? `${baseUrl}/${pathUrl}` : baseUrl;
    }

    method = (options.method || apiConfigDoc.method || apiConfigDoc.meta?.method || "POST").toUpperCase();

    // Build headers from ApiConfig schema headers array
    if (Array.isArray(apiConfigDoc.headers)) {
      apiConfigDoc.headers.forEach((h) => {
        if (h && h.key && h.value) {
          requestHeaders[h.key] = interpolate(h.value, payload);
        }
      });
    }

    // Add apiKey header if authType is apiKey or x-api-key missing
    if (apiConfigDoc.apiKey && !requestHeaders["x-api-key"] && !requestHeaders["X-API-KEY"]) {
      requestHeaders["x-api-key"] = interpolate(apiConfigDoc.apiKey, payload);
    }

    // Merge custom caller headers
    if (options.headers && typeof options.headers === "object") {
      requestHeaders = { ...requestHeaders, ...options.headers };
    }

    // Merge default payload from schema bodyParams array + requestBody + meta + caller payload
    const schemaBodyParamsObj = {};
    if (Array.isArray(apiConfigDoc.bodyParams)) {
      apiConfigDoc.bodyParams.forEach((param) => {
        if (param && param.key) {
          // If the value is a string, interpolate it
          if (typeof param.value === "string") {
            // Check if it's purely a single variable e.g. "{{name}}" to preserve type (optional, but good for numbers/booleans if needed)
            const pureVarMatch = param.value.match(/^\{\{\s*([^}]+)\s*\}\}$/);
            if (pureVarMatch) {
              const key = pureVarMatch[1].trim();
              setNestedValue(schemaBodyParamsObj, param.key, payload[key] !== undefined ? payload[key] : "");
            } else {
              let finalVal = interpolate(param.value, payload) || "";
              // Automatically parse JSON arrays, objects, booleans, and numbers
              if (
                finalVal === "true" ||
                finalVal === "false" ||
                finalVal === "null" ||
                (!isNaN(finalVal) && finalVal.trim() !== "") ||
                finalVal.startsWith("[") ||
                finalVal.startsWith("{")
              ) {
                try {
                  finalVal = JSON.parse(finalVal);
                } catch (e) {
                  // Keep as string if parsing fails
                }
              }
              setNestedValue(schemaBodyParamsObj, param.key, finalVal);
            }
          } else {
            setNestedValue(schemaBodyParamsObj, param.key, param.value || "");
          }
        }
      });
    }

    const rawRequestBody = typeof apiConfigDoc.requestBody === "object" ? apiConfigDoc.requestBody : {};
    const defaultBody = deepInterpolate(rawRequestBody, payload);
    const defaultMetaPayload = deepInterpolate(apiConfigDoc.meta?.defaultPayload || {}, payload);

    // Instead of completely merging payload at the end which overrides all keys,
    // we only merge payload keys that are NOT defined in the schema body parameters, 
    // OR we can just use schemaBodyParamsObj as the definitive payload if it has keys.
    // Let's merge them but prefer schemaBodyParamsObj if bodyParams are defined.
    // If bodyParams are empty, fallback to payload.
    const hasSchemaParams = Object.keys(schemaBodyParamsObj).length > 0;

    const finalPayload = hasSchemaParams
      ? { ...defaultBody, ...defaultMetaPayload, ...schemaBodyParamsObj }
      : { ...defaultBody, ...defaultMetaPayload, ...payload };

    // 3️⃣ Execute HTTP Request
    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(apiConfigDoc.timeout || 10000),
    };

    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = JSON.stringify(finalPayload);
    }

    console.log(`🌐 Executing ApiConfig '${configKey}' -> ${method} ${targetUrl}`);

    const res = await fetch(targetUrl, fetchOptions);
    const responseTimeMs = Date.now() - startMs;

    let responseData = null;
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      const textVal = await res.text();
      try {
        responseData = JSON.parse(textVal);
      } catch (e) {
        responseData = { text: textVal };
      }
    }

    const isSuccess = res.ok;
    const errorMessage = isSuccess
      ? null
      : responseData?.message || responseData?.error || `HTTP Error ${res.status}: ${res.statusText}`;

    // 4️⃣ Create ApiLog record in MongoDB
    const logDoc = await ApiLog.create({
      apiConfig: apiConfigDoc._id,
      configKey: apiConfigDoc.key,
      endpoint: targetUrl,
      method: method,
      status: isSuccess ? "success" : "failed",
      statusCode: res.status,
      responseTimeMs: responseTimeMs,
      requestHeaders: requestHeaders,
      requestBody: finalPayload,
      responseBody: responseData,
      errorMessage: errorMessage,
      ipAddress: reqMeta.ip || "",
      userAgent: reqMeta.userAgent || "",
    });

    console.log(`📝 Logged ApiExecution '${configKey}' -> Log ID: ${logDoc._id} | Status: ${logDoc.status} (${res.status}) in ${responseTimeMs}ms`);

    return {
      success: isSuccess,
      statusCode: res.status,
      data: responseData,
      log: logDoc,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startMs;
    console.error(`❌ ApiConfig Execution Failed for '${configKey}':`, error.message);

    // Record Failed ApiLog in MongoDB
    const logDoc = await ApiLog.create({
      apiConfig: apiConfigDoc ? apiConfigDoc._id : null,
      configKey: configKey,
      endpoint: targetUrl || configKey,
      method: method,
      status: "failed",
      statusCode: 500,
      responseTimeMs: responseTimeMs,
      requestHeaders: requestHeaders,
      requestBody: payload,
      responseBody: {},
      errorMessage: error.message,
      errorStack: error.stack,
      ipAddress: reqMeta.ip || "",
      userAgent: reqMeta.userAgent || "",
    });

    return {
      success: false,
      statusCode: 500,
      error: error.message,
      log: logDoc,
    };
  }
}

/**
 * Executes all active ApiConfigs matching a specific triggerEvent
 * @param {string} event - The event name (e.g. "lead_submission")
 * @param {object} payload - Request payload data
 * @param {object} options - Optional overrides
 */
async function executeApiEvent(event, payload = {}, options = {}) {
  try {
    const activeConfigs = await ApiConfig.find({
      triggerEvent: event,
      enabled: true,
      removed: false,
    });

    if (!activeConfigs || activeConfigs.length === 0) {
      console.log(`No active API Configs found for event: ${event}`);
      return { success: true, message: `No active configurations found for event ${event}`, results: [] };
    }

    const promises = activeConfigs.map((config) => executeApiConfigByKey(config.key, payload, options));
    const rawResults = await Promise.allSettled(promises);
    
    const results = rawResults.map((r, i) => ({
      key: activeConfigs[i].key,
      status: r.status,
      result: r.status === "fulfilled" ? r.value : r.reason,
    }));

    return { success: true, results };
  } catch (error) {
    console.error(`❌ Failed to execute API Event '${event}':`, error);
    throw error;
  }
}

module.exports = { executeApiConfigByKey, executeApiEvent };
