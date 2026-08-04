const mongoose = require("mongoose");
const { Course } = require("../model/Course");
require("dotenv").config();

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode";

const DUMMY_CONTENT = {
  overviewTitle: "Build Future-Ready Skills with our Premier Institute",
  overviewDescription: "Transform your career with our carefully curated courses, designed to help professionals master their respective fields. Learn through live online sessions, industry case studies, and practical projects while earning a prestigious certificate.",
  whyChooseTitle: "Why Choose This Programme?",
  whyChooseDescription: "This programme equips learners with practical knowledge, workforce planning, talent management, and business strategy through live classes, real-world case studies, and hands-on learning. Whether you're looking to advance or transition into a new role, this programme helps you build industry-relevant skills that organizations value.",
  keyHighlights: [
    "Learn from an industry-focused curriculum",
    "Live online sessions with experienced faculty",
    "Real-world case studies and practical assignments",
    "Hands-on capstone project",
    "Flexible learning for working professionals",
    "Prestigious certificate upon completion",
    "Practical and actionable skills",
    "Career-focused learning approach",
  ],
  whoCanApply: [
    "Working professionals seeking career advancement",
    "Graduates aspiring to enter the domain",
    "Business managers handling related functions",
    "Entrepreneurs managing business decisions",
  ],
  admissionProcess: [
    "Fill online application form",
    "Speak with academic counsellor",
    "Submit documents & pay fee",
    "Get admission confirmation",
  ],
  courseSnapshotBottom: [
    { label: "Duration", value: "Variable" },
    { label: "Mode", value: "Live Online" },
    { label: "Learning Format", value: "Interactive Sessions" },
    { label: "Projects", value: "Capstone Project" },
    { label: "Certificate", value: "Yes" },
    { label: "EMI", value: "Available" },
  ],
  skillsSection: {
    title: "Skills You'll Learn & Curriculum",
    description: "The curriculum is carefully designed to help learners understand modern practices while building analytical capabilities. Covering everything from fundamentals to advanced insights, the programme combines theory with practical applications.",
    skillsGain: [
      "Industry Essentials",
      "Advanced Methodologies",
      "Strategic Management",
      "Business Decision-Making",
      "Leadership & Organizational Effectiveness",
    ],
    curriculumOverview: [
      "Module 1 – Fundamentals",
      "Module 2 – Core Concepts",
      "Module 3 – Strategy & Planning",
      "Module 4 – Advanced Topics",
      "Module 5 – Capstone Project",
    ],
  },
  learningExperience: {
    title: "An Interactive & Flexible Learning Experience",
    description: "Learn from anywhere without interrupting your professional commitments. The programme combines live faculty sessions with recorded lectures, industry projects, and collaborative learning to provide a practical and engaging educational experience.",
    learningFeatures: [
      "Live Online Interactive Classes",
      "Recorded Sessions for Revision",
      "Industry Case Studies",
      "Practical Assignments",
      "Capstone Project",
      "Peer Learning Opportunities",
      "Faculty Guidance",
      "Dedicated Student Support",
      "Flexible Weekend Learning",
    ],
  },
  instituteSection: {
    title: "Learn from Premium Academic Institutes",
    description: "Our partner institutes are recognized for academic excellence, innovative education, and industry-oriented programmes. This programme reflects their commitment to preparing professionals with future-ready skills.",
    certificateTitle: "Earn a Prestigious Certificate",
    certificateDescription: "Upon successful completion, participants receive a Professional Certificate adding credibility to their professional profile and demonstrating expertise.",
    certificateImage: null,
  },
  careerSection: {
    title: "Advance Your Career with In-Demand Skills",
    description: "Organizations are increasingly seeking professionals who can improve performance and business outcomes. This programme prepares learners with practical knowledge that can support career growth across multiple industries.",
    careerOpportunities: [
      "Specialist",
      "Business Partner",
      "Manager",
      "Consultant",
      "Analyst",
    ],
    industriesHiring: [
      "Information Technology",
      "Consulting",
      "BFSI",
      "Healthcare",
      "Manufacturing",
      "Retail",
      "E-commerce",
      "Startups",
    ],
  },
  feeSection: {
    title: "Flexible Fee & Payment Options",
    description: "Invest in your professional growth with flexible payment plans that make quality education more accessible. Learners can explore EMI options and available financial assistance.",
    financialSupport: [
      "Affordable EMI Options",
      "Flexible Payment Plans",
      "Scholarship Support (If Applicable)",
      "Corporate Sponsorship Assistance",
      "Dedicated Admission Guidance",
    ],
    footerNote: "Need help with fees? Speak with our admission counsellors for the latest fee structure, scholarships, and EMI options.",
  },
  faqSection: {
    title: "Frequently Asked Questions (FAQs)",
    faqs: [
      { question: "1. Who is eligible for this programme?", answer: "The programme is designed for working professionals who want to build expertise. Applicants should generally have a Bachelor's degree. Admission is based on the application review and the programme's selection criteria." },
      { question: "2. Is the course fully online?", answer: "Yes. The programme is delivered in a fully online learning format, making it convenient for working professionals. It includes self-paced learning, interactive live sessions, industry-led discussions, and case studies." },
      { question: "3. Will I receive a certificate?", answer: "Yes. Upon successfully completing the programme and meeting all academic requirements, learners receive a Professional Certificate Programme from the respective institute." },
      { question: "4. What is the duration of the programme?", answer: "The programme duration varies by course. Learners are generally expected to dedicate 6–8 hours per week to lectures, assignments, projects, and live sessions." },
      { question: "5. Are live classes recorded?", answer: "Yes. Live sessions are conducted by faculty and industry experts, and recordings are generally made available so learners can revisit the content or catch up on missed sessions at their convenience." },
      { question: "6. Is EMI available?", answer: "Yes. The programme offers flexible financing options through leading banking partners, making it easier for learners to pay the programme fee in affordable monthly installments." },
      { question: "7. How do I apply?", answer: "You can apply online by submitting the application form. The admissions team reviews your background. If shortlisted, you will receive an offer letter, after which you can confirm your admission." },
      { question: "8. Will I receive career guidance?", answer: "Yes. The programme provides comprehensive career support, including career coaching, profile building, interview preparation, and networking opportunities to help learners advance their careers." }
    ],
  },
};

async function seedAllCourses() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    const courses = await Course.find();
    console.log(`Found ${courses.length} courses to update.`);
    let updateCount = 0;

    for (const course of courses) {
      let updated = false;

      if (course.universityOfferings && course.universityOfferings.length > 0) {
        for (const offering of course.universityOfferings) {
          if (offering.subcourses && offering.subcourses.length > 0) {
            for (const subcourse of offering.subcourses) {
              // We only want to set dummy content if the field is empty
              subcourse.overviewTitle = subcourse.overviewTitle || DUMMY_CONTENT.overviewTitle;
              subcourse.overviewDescription = subcourse.overviewDescription || DUMMY_CONTENT.overviewDescription;
              subcourse.whyChooseTitle = subcourse.whyChooseTitle || DUMMY_CONTENT.whyChooseTitle;
              subcourse.whyChooseDescription = subcourse.whyChooseDescription || DUMMY_CONTENT.whyChooseDescription;
              
              if (!subcourse.keyHighlights || subcourse.keyHighlights.length === 0) subcourse.keyHighlights = DUMMY_CONTENT.keyHighlights;
              if (!subcourse.whoCanApply || subcourse.whoCanApply.length === 0) subcourse.whoCanApply = DUMMY_CONTENT.whoCanApply;
              if (!subcourse.admissionProcess || subcourse.admissionProcess.length === 0) subcourse.admissionProcess = DUMMY_CONTENT.admissionProcess;
              if (!subcourse.courseSnapshotBottom || subcourse.courseSnapshotBottom.length === 0) subcourse.courseSnapshotBottom = DUMMY_CONTENT.courseSnapshotBottom;
              
              if (!subcourse.skillsSection || !subcourse.skillsSection.title) subcourse.skillsSection = DUMMY_CONTENT.skillsSection;
              if (!subcourse.learningExperience || !subcourse.learningExperience.title) subcourse.learningExperience = DUMMY_CONTENT.learningExperience;
              if (!subcourse.instituteSection || !subcourse.instituteSection.title) subcourse.instituteSection = DUMMY_CONTENT.instituteSection;
              if (!subcourse.careerSection || !subcourse.careerSection.title) subcourse.careerSection = DUMMY_CONTENT.careerSection;
              if (!subcourse.feeSection || !subcourse.feeSection.title) subcourse.feeSection = DUMMY_CONTENT.feeSection;
              if (!subcourse.faqSection || !subcourse.faqSection.title) subcourse.faqSection = DUMMY_CONTENT.faqSection;
              
              updated = true;
            }
          }
        }
      }

      if (updated) {
        await course.save();
        updateCount++;
      }
    }

    console.log(`Successfully updated ${updateCount} courses with dummy data.`);
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedAllCourses();
