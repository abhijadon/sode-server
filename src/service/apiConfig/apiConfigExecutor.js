"use strict";

const { ApiConfig } = require("../../model/ApiConfig");
const { ApiLog } = require("../../model/ApiLog");

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
    const resolvedEndpoint = options.endpoint || apiConfigDoc.endpoint || apiConfigDoc.meta?.endpoint || "";

    if (resolvedEndpoint.startsWith("http://") || resolvedEndpoint.startsWith("https://")) {
      targetUrl = resolvedEndpoint;
    } else {
      const baseUrl = (apiConfigDoc.baseUrl || "").replace(/\/$/, "");
      const pathUrl = (resolvedEndpoint || "").replace(/^\//, "");
      targetUrl = pathUrl ? `${baseUrl}/${pathUrl}` : baseUrl;
    }

    method = (options.method || apiConfigDoc.method || apiConfigDoc.meta?.method || "POST").toUpperCase();

    // Build headers from ApiConfig schema headers array
    if (Array.isArray(apiConfigDoc.headers)) {
      apiConfigDoc.headers.forEach((h) => {
        if (h && h.key && h.value) {
          requestHeaders[h.key] = h.value;
        }
      });
    }

    // Add apiKey header if authType is apiKey or x-api-key missing
    if (apiConfigDoc.apiKey && !requestHeaders["x-api-key"] && !requestHeaders["X-API-KEY"]) {
      requestHeaders["x-api-key"] = apiConfigDoc.apiKey;
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
          schemaBodyParamsObj[param.key] = param.value || "";
        }
      });
    }

    const defaultBody = typeof apiConfigDoc.requestBody === "object" ? apiConfigDoc.requestBody : {};
    const defaultMetaPayload = apiConfigDoc.meta?.defaultPayload || {};
    const finalPayload = { ...schemaBodyParamsObj, ...defaultBody, ...defaultMetaPayload, ...payload };

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

module.exports = { executeApiConfigByKey };
