const http = require("http");
const req = http.get("http://127.0.0.1:5001/api/website/courses/website-list?category=certification&subcategory=ai-courses", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Response JSON length:", data.length, "Status:", res.statusCode));
});
req.on("error", err => console.error("Error:", err.message));
