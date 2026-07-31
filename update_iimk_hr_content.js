"use strict";

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { Course } = require("./src/model/Course");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm";

const EXACT_IIMK_CONTENT = {
  overviewTitle: "Course Overview",
  overviewDescription:
    "Transform your HR career with the IIM Kozhikode HR Analytics Course, designed to help professionals master people analytics, workforce planning, and strategic HR decision-making. Learn through live online sessions, industry case studies, and practical projects while earning a prestigious certificate from IIM Kozhikode.",

  overviewSnapshot: [
    { icon: "bank", label: "Institute", value: "IIM Kozhikode" },
    { icon: "apartment", label: "Programme", value: "Professional Certificate Programme" },
    { icon: "clock", label: "Duration", value: "6 Months" },
    { icon: "laptop", label: "Learning Mode", value: "Live Online" },
    { icon: "certificate", label: "Certificate from IIM Kozhikode", value: "" },
    { icon: "card", label: "EMI Options Available", value: "" },
    { icon: "user", label: "Expert Faculty", value: "" },
    { icon: "read", label: "Industry-Relevant Curriculum", value: "" },
  ],

  whyChooseTitle: "Why Choose the IIM Kozhikode HR Analytics Course?",
  whyChooseDescription:
    "The IIM Kozhikode HR Analytics Course is designed for professionals who want to combine HR expertise with data-driven decision-making. The programme equips learners with practical knowledge of HR analytics, workforce planning, talent management, and business strategy through live classes, real-world case studies, and hands-on learning. Whether you're looking to advance in HR or transition into analytics-focused roles, this programme helps you build industry-relevant skills that organizations value.",

  keyHighlights: [
    "Learn from IIM Kozhikode's industry-focused curriculum",
    "Live online sessions with experienced faculty",
    "Real-world HR case studies and practical assignments",
    "Hands-on capstone project",
    "Flexible learning for working professionals",
    "Prestigious IIM Kozhikode certificate",
    "Practical HR analytics and people analytics skills",
    "Career-focused learning approach",
  ],

  courseSnapshotBottom: [
    { label: "Duration", value: "6 Months" },
    { label: "Mode", value: "Live Online" },
    { label: "Learning Format", value: "Interactive Sessions" },
    { label: "Projects", value: "Capstone Project" },
    { label: "Certificate", value: "IIM Kozhikode" },
    { label: "EMI", value: "Available" },
  ],

  whoCanApply: [
    "Graduates from a recognized university",
    "HR Professionals",
    "Recruiters & Talent Acquisition Specialists",
    "Managers & Team Leaders",
    "Business Professionals",
    "Career Switchers",
    "Entrepreneurs interested in HR management",
  ],

  admissionProcess: [
    "Submit Your Application",
    "Connect with a Programme Advisor",
    "Eligibility Verification",
    "Complete Fee Payment",
    "Begin Your Learning Journey",
  ],

  skillsSection: {
    title: "Skills You'll Learn & Curriculum",
    description:
      "The curriculum is carefully designed to help learners understand modern HR practices while building analytical capabilities. Covering everything from HR fundamentals to workforce analytics and business insights, the programme combines theory with practical applications so learners can confidently solve real workplace challenges.",
    skillsGain: [
      "HR Analytics",
      "People Analytics",
      "Workforce Planning",
      "HR Metrics & KPIs",
      "Talent Acquisition Analytics",
      "Employee Performance Analytics",
      "Strategic HR Management",
      "HR Dashboards",
      "Business Decision-Making",
      "Leadership & Organizational Effectiveness",
    ],
    curriculumOverview: [
      "Module 1 – HR Management Fundamentals",
      "Module 2 – Introduction to HR Analytics",
      "Module 3 – Workforce Planning & Talent Analytics",
      "Module 4 – Performance & Compensation Analytics",
      "Module 5 – Employee Engagement & Retention",
      "Module 6 – HR Dashboards & Business Insights",
      "Module 7 – Capstone Project",
    ],
  },

  learningExperience: {
    title: "An Interactive & Flexible Learning Experience",
    description:
      "Learn from anywhere without interrupting your professional commitments. The programme combines live faculty sessions with recorded lectures, industry projects, and collaborative learning to provide a practical and engaging educational experience.",
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
    title: "Learn from One of India's Premier Management Institutes",
    description:
      "IIM Kozhikode is recognized for academic excellence, innovative management education, and industry-oriented programmes. This programme reflects the institute's commitment to preparing professionals with future-ready business and leadership skills.",
    certificateTitle: "Earn a Prestigious Certificate",
    certificateDescription:
      "Upon successful completion, participants receive a Professional Certificate in HR Management & Analytics from IIM Kozhikode, adding credibility to their professional profile and demonstrating expertise in modern HR practices.",
    whyItMatters: [
      "Certificate from IIM Kozhikode",
      "Strengthens Your Resume",
      "Showcase on LinkedIn",
      "Recognized by Employers",
      "Demonstrates Continuous Professional Development",
    ],
  },

  careerSection: {
    title: "Advance Your Career with In-Demand HR Analytics Skills",
    description:
      "Organizations are increasingly seeking HR professionals who can use data to improve workforce performance and business outcomes. This programme prepares learners with practical HR analytics knowledge that can support career growth across multiple industries and organizational functions.",
    careerOpportunities: [
      "HR Analyst",
      "People Analytics Specialist",
      "HR Business Partner",
      "Talent Acquisition Manager",
      "Workforce Planning Analyst",
      "Learning & Development Manager",
      "HR Operations Manager",
      "HR Manager",
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
    description:
      "Invest in your professional growth with flexible payment plans that make quality education more accessible. Learners can explore EMI options and available financial assistance while receiving guidance from programme advisors throughout the enrollment process.",
    financialSupport: [
      "Affordable EMI Options",
      "Flexible Payment Plans",
      "Scholarship Support (If Applicable)",
      "Corporate Sponsorship Assistance",
      "Dedicated Admission Guidance",
    ],
    footerNote:
      "Need help with fees? Speak with our admission counsellors for the latest fee structure, scholarships, and EMI options.",
  },

  faqSection: {
    title: "Frequently Asked Questions",
    faqs: [
      {
        question: "1. Who is eligible for this programme?",
        answer:
          "The programme is designed for working professionals who want to build expertise in HR Management and HR Analytics. Applicants should have a Bachelor's degree with at least 2 years of work experience, or a Master's degree. Admission is based on the application review and the programme's selection criteria.",
      },
      {
        question: "2. Is the course fully online?",
        answer:
          "Yes. The programme is delivered in a fully online learning format, making it convenient for working professionals. It includes self-paced learning, interactive live sessions, industry-led discussions, case studies, projects, and doubt-resolution sessions that can be accessed remotely.",
      },
      {
        question: "3. Will I receive a certificate from IIM Kozhikode?",
        answer:
          "Yes. Upon successfully completing the programme and meeting all academic requirements, learners receive a Professional Certificate Programme in HR Management and Analytics from IIM Kozhikode. The programme also includes additional industry-recognized certifications, where applicable.",
      },
      {
        question: "4. What is the duration of the programme?",
        answer:
          "The programme is 6 months long and is structured for working professionals. Learners are generally expected to dedicate 6–8 hours per week to lectures, assignments, projects, and live sessions.",
      },
      {
        question: "5. Are live classes recorded?",
        answer:
          "Yes. Live sessions are conducted by faculty and industry experts, and recordings are generally made available so learners can revisit the content or catch up on missed sessions at their convenience.",
      },
      {
        question: "6. Is EMI available?",
        answer:
          "Yes. The programme offers No Cost EMI and flexible financing options through leading banking partners, making it easier for learners to pay the programme fee in affordable monthly installments, subject to eligibility and bank terms.",
      },
      {
        question: "7. How do I apply?",
        answer:
          "You can apply online by submitting the application form. The admissions team reviews your educational background and work experience. If shortlisted, you will receive an offer letter, after which you can confirm your admission by paying the seat-blocking amount and completing the enrollment process.",
      },
      {
        question: "8. Will I receive career guidance?",
        answer:
          "Yes. The programme provides comprehensive career support, including 1:1 career coaching, AI-powered profile building, interview preparation, career readiness modules, networking opportunities, mock interviews, and post-programme career support to help learners advance their careers.",
      },
    ],
  },
};

async function updateIIMKCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const course = await Course.findOne({
      slug: "professional-certificate-programme-in-hr-management-analytics",
    });

    if (!course) {
      console.error("Course not found!");
      return;
    }

    console.log(`Found Course: "${course.title}" (${course._id})`);

    // Update root level description if needed
    course.description = EXACT_IIMK_CONTENT.overviewDescription;

    // Update offerings & subcourses
    if (course.universityOfferings && course.universityOfferings.length > 0) {
      for (const offering of course.universityOfferings) {
        if (offering.subcourses && offering.subcourses.length > 0) {
          for (const subcourse of offering.subcourses) {
            subcourse.overviewTitle = EXACT_IIMK_CONTENT.overviewTitle;
            subcourse.overviewDescription = EXACT_IIMK_CONTENT.overviewDescription;
            subcourse.overviewSnapshot = EXACT_IIMK_CONTENT.overviewSnapshot;
            subcourse.whyChooseTitle = EXACT_IIMK_CONTENT.whyChooseTitle;
            subcourse.whyChooseDescription = EXACT_IIMK_CONTENT.whyChooseDescription;
            subcourse.keyHighlights = EXACT_IIMK_CONTENT.keyHighlights;
            subcourse.courseSnapshotBottom = EXACT_IIMK_CONTENT.courseSnapshotBottom;
            subcourse.whoCanApply = EXACT_IIMK_CONTENT.whoCanApply;
            subcourse.admissionProcess = EXACT_IIMK_CONTENT.admissionProcess;
            subcourse.skillsSection = EXACT_IIMK_CONTENT.skillsSection;
            subcourse.learningExperience = EXACT_IIMK_CONTENT.learningExperience;
            subcourse.instituteSection = EXACT_IIMK_CONTENT.instituteSection;
            subcourse.careerSection = EXACT_IIMK_CONTENT.careerSection;
            subcourse.feeSection = EXACT_IIMK_CONTENT.feeSection;
            subcourse.faqSection = EXACT_IIMK_CONTENT.faqSection;
          }
        }
      }
    }

    await course.save();
    console.log("Successfully updated IIM Kozhikode HR Management & Analytics Course with exact user content.");
  } catch (err) {
    console.error("Error updating course:", err);
  } finally {
    await mongoose.disconnect();
  }
}

updateIIMKCourse();
