const mongoose = require("mongoose");
const { globSync } = require("glob");
globSync("./src/model/**/*.js").forEach((file) => require("../../" + file));

const { getWebsiteCourses } = require("../controller/course/course.controller");
require("dotenv").config();

async function testApi() {
  await mongoose.connect(process.env.MONGODB_URI);

  const reqIIT = { query: { category: "iit-delhi", limit: "6" } };
  let resDataIIT = null;
  const replyIIT = {
    send: (data) => { resDataIIT = data; return replyIIT; },
    code: () => replyIIT,
    status: () => replyIIT,
  };
  await getWebsiteCourses(reqIIT, replyIIT);
  console.log("IIT Delhi Courses Count:", resDataIIT?.result?.programs?.length);

  const reqIIM = { query: { category: "iim-ahmedabad", limit: "6" } };
  let resDataIIM = null;
  const replyIIM = {
    send: (data) => { resDataIIM = data; return replyIIM; },
    code: () => replyIIM,
    status: () => replyIIM,
  };
  await getWebsiteCourses(reqIIM, replyIIM);
  console.log("IIM Ahmedabad Courses Count:", resDataIIM?.result?.programs?.length);
  console.log("IIM Ahmedabad Courses Titles:", resDataIIM?.result?.programs?.map(p => p.title));

  await mongoose.disconnect();
}

testApi();
