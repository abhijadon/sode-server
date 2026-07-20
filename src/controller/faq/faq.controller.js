"use strict";

const { Faq } = require("../../model/Faq");

const getWebsiteFaqs = async (request, reply) => {
  try {
    const faqs = await Faq.find({
      removed: false,
      enabled: true,
    })
      .select("question answer category order")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return reply.code(200).send({
      success: true,
      result: faqs,
      message: "Website FAQs retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching website FAQs:", error);

    return reply.code(500).send({
      success: false,
      result: [],
      message: "An error occurred while retrieving website FAQs",
      error: error.message,
    });
  }
};

module.exports = { getWebsiteFaqs };
