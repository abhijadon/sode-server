"use strict";

const mongoose = require("mongoose");
const getWebsiteHeaders = async (request, reply) => {
  try {
    const queryConditions = {
      removed: false,
      enabled: true,
    };

    if (request.queryConditions && typeof request.queryConditions === "object") {
      Object.assign(queryConditions, request.queryConditions);
    }

    const Header = mongoose.model("Header");
    const flatHeaders = await Header.find(queryConditions)
      .select(
        "label href slug icon order parentId showOnDesktop showOnMobile premium text color bgColor textColor openInNewTab",
      )
      .sort({ order: 1 })
      .lean();

    // ==========================================
    // 🔥 2. BUILD NESTED TREE (ट्री स्ट्रक्चर बनाना)
    // ==========================================
    const itemMap = Object.create(null);
    const treeRoots = [];

    // स्टेप A: सभी आइटम्स का एक मैप तैयार करें और डिफ़ॉल्ट children ऐरे सेट करें
    flatHeaders.forEach((item) => {
      itemMap[item._id.toString()] = {
        ...item,
        children: [],
      };
    });

    // स्टेप B: पैरेंट-चाइल्ड रिलेशनशिप मैप करें
    flatHeaders.forEach((item) => {
      const mappedItem = itemMap[item._id.toString()];

      // चेक करें कि क्या इस आइटम का कोई parentId है
      if (item.parentId) {
        const parentIdStr = item.parentId._id
          ? item.parentId._id.toString()
          : item.parentId.toString();

        // यदि पैरेंट मैप में मौजूद है, तो इसे उसके children ऐरे में पुश करें
        if (itemMap[parentIdStr]) {
          itemMap[parentIdStr].children.push(mappedItem);
        }
      } else {
        // अगर कोई parentId नहीं है, तो यह रूट (Main Menu) है, इसे सीधे मुख्य लिस्ट में डालें
        treeRoots.push(mappedItem);
      }
    });

    // स्टेप C: हर लेवल पर चिल्ड्रेन को 'order' के हिसाब से दोबारा री-सॉर्ट करना (सुरक्षा के लिए)
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortTree(node.children);
        }
      });
    };

    sortTree(treeRoots);

    // ==========================================
    // 🔥 3. RESPONSE DELIVERY (रिस्पॉन्स भेजना)
    // ==========================================
    return reply.code(200).send({
      success: true,
      result: treeRoots,
      message: "Website headers tree retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error in getWebsiteHeaders:", error);

    return reply.code(500).send({
      success: false,
      result: null,
      message: "An error occurred while retrieving website headers tree",
      error: error.message,
    });
  }
};

module.exports = { getWebsiteHeaders };
