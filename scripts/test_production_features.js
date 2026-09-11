// Automated validation script for production features
const http = require("http");

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=== HOSTELCONNECT 2.0 PRODUCTION VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. First-Time Registration
    console.log("\n--- TEST GROUP 1: User Registration & Login ---");
    const uniqueEmail = `test.resident.${Date.now()}@campus.edu`;
    const regRes = await makeRequest("/api/auth/register", "POST", {
      full_name: "Ananya Verma",
      room_number: "Block B-304",
      email: uniqueEmail,
      password: "securepassword123",
    });

    assert(regRes.status === 200, "Registration endpoint returns HTTP 200");
    assert(regRes.body.success === true, "Registration success flag is true");
    assert(regRes.body.data.full_name === "Ananya Verma", "Saved full_name matches input");
    assert(regRes.body.data.room_number === "Block B-304", "Saved room_number matches input");
    assert(regRes.body.data.role === "STUDENT", "Auto-determined role is STUDENT");

    // 2. Future Login with Registered User
    const loginRes = await makeRequest("/api/auth/login", "POST", {
      identifier: uniqueEmail,
      password: "securepassword123",
    });

    assert(loginRes.status === 200, "Login endpoint returns HTTP 200");
    assert(loginRes.body.success === true, "Login success flag is true");
    assert(loginRes.body.data.full_name === "Ananya Verma", "Loaded saved profile full_name");
    assert(loginRes.body.data.room_number === "Block B-304", "Loaded saved profile room_number");
    assert(loginRes.body.data.role === "STUDENT", "Loaded saved role STUDENT for auto-redirection");

    // 3. Warden Login
    const wardenLogin = await makeRequest("/api/auth/login", "POST", {
      identifier: "warden@campus.edu",
      password: "campuspass2025",
    });

    assert(wardenLogin.status === 200, "Warden login returns HTTP 200");
    assert(wardenLogin.body.data.role === "WARDEN", "Warden role detected for redirection");

    // 3b. New Warden Registration
    const newWardenEmail = `test.warden.${Date.now()}@campus.edu`;
    const regWardenRes = await makeRequest("/api/auth/register", "POST", {
      full_name: "Dr. A. K. Sundaram",
      room_number: "Warden Office Block B-G02",
      email: newWardenEmail,
      password: "wardenpass789",
      role: "WARDEN",
    });

    assert(regWardenRes.status === 200, "Warden registration returns HTTP 200");
    assert(regWardenRes.body.data.role === "WARDEN", "New warden account registered with WARDEN role");
    assert(regWardenRes.body.data.full_name === "Dr. A. K. Sundaram", "New warden full_name matches input");

    // 3c. Login with newly registered Warden
    const loginNewWarden = await makeRequest("/api/auth/login", "POST", {
      identifier: newWardenEmail,
      password: "wardenpass789",
    });
    assert(loginNewWarden.status === 200, "New warden login returns HTTP 200");
    assert(loginNewWarden.body.data.role === "WARDEN", "New warden login identifies role as WARDEN");

    // 4. Unregistered Email handling
    const unregLogin = await makeRequest("/api/auth/login", "POST", {
      identifier: "unregistered.resident@campus.edu",
      password: "somepassword",
    });

    assert(unregLogin.body.notRegistered === true, "Identifies unregistered resident for first-time onboarding prompt");

    // 5. AI Assistant Navigation Intents
    console.log("\n--- TEST GROUP 2: AI Assistant Navigation Intent & Action Buttons ---");

    const leaveAI = await makeRequest("/api/ai", "POST", { query: "I want to apply for leave" });
    assert(leaveAI.body.actionLink && leaveAI.body.actionLink.href === "/student/leave", "Leave query generates action button to /student/leave");

    const complaintAI = await makeRequest("/api/ai", "POST", { query: "Take me to complaints" });
    assert(complaintAI.body.actionLink && complaintAI.body.actionLink.href === "/student/complaints", "Complaint query generates action button to /student/complaints");

    const messAI = await makeRequest("/api/ai", "POST", { query: "What is on today's mess menu?" });
    assert(messAI.body.actionLink && messAI.body.actionLink.href === "/student/mess", "Mess query generates action button to /student/mess");

    const parcelAI = await makeRequest("/api/ai", "POST", { query: "Where can I collect my parcel?" });
    assert(parcelAI.body.actionLink && parcelAI.body.actionLink.href === "/student/parcels", "Parcel query generates action button to /student/parcels");

    const medicalAI = await makeRequest("/api/ai", "POST", { query: "Emergency doctor" });
    assert(medicalAI.body.actionLink && medicalAI.body.actionLink.href === "/student/medical", "Medical query generates action button to /student/medical");

    const lostAI = await makeRequest("/api/ai", "POST", { query: "Lost and found wallet" });
    assert(lostAI.body.actionLink && lostAI.body.actionLink.href === "/student/requests", "Lost & Found query generates action button to /student/requests");

    // 6. Mess Menu API
    console.log("\n--- TEST GROUP 3: Mess Menu API & Structure ---");
    const messRes = await makeRequest("/api/mess", "GET");
    assert(messRes.status === 200, "Mess API returns HTTP 200");
    assert(Array.isArray(messRes.body.data.days), "Mess API returns days array");
    assert(messRes.body.data.days.length === 7, "All 7 days of the week present in mess schedule");

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (e) {
    console.error("Test execution error:", e);
  }
}

runTests();
