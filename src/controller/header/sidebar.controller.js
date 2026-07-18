"use strict";

const mongoose = require("mongoose");
const { Sidebar } = require("../../model/Sidebar");
const getSidebar = async (request, reply) => {
  try {
    // 🔥 1. FETCH FLAT DATA WITH REQUIRED FIELDS
    const flatSidebar = await Sidebar.find({
      removed: false,
      enabled: true,
    })
      .select(
        "title section sectionOrder itemOrder icon path parentId target newTab badge roles",
      )
      .sort({ sectionOrder: 1, itemOrder: 1 }) // पहले सेक्शन ऑर्डर फिर आइटम ऑर्डर से सॉर्ट करें
      .lean();

    // ==========================================
    // 🔥 2. BUILD NESTED TREE (ट्री स्ट्रक्चर बनाना)
    // ==========================================
    const itemMap = Object.create(null);
    const treeRoots = [];

    // स्टेप A: सभी आइटम्स का एक मैप तैयार करें और डिफ़ॉल्ट children ऐरे सेट करें
    flatSidebar.forEach((item) => {
      itemMap[item._id.toString()] = {
        ...item,
        children: [],
      };
    });

    // स्टेप B: पैरेंट-चाइल्ड रिलेशनशिप मैप करें
    flatSidebar.forEach((item) => {
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
        // अगर कोई parentId नहीं है, तो यह रूट (Main Sidebar Menu) है
        treeRoots.push(mappedItem);
      }
    });

    // स्टेप C: हर लेवल पर चिल्ड्रेन को 'itemOrder' के हिसाब से दोबारा री-सॉर्ट करना (सुरक्षा के लिए)
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.itemOrder || 0) - (b.itemOrder || 0));
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
      message: "Website sidebar tree retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error in getSidebar:", error);

    return reply.code(500).send({
      success: false,
      result: null,
      message: "An error occurred while retrieving website sidebar tree",
      error: error.message,
    });
  }
};

module.exports = { getSidebar };
