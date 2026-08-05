async function testWebhook() {
  const url = "https://script.google.com/macros/s/AKfycbz3fT3GHQ97ZRo7bmOmujrFGOnZXj9NhMP82qSnPgc_gRDQu6eQXa6sEDhfhtMs_1Upzg/exec";
  try {
    console.log("Sending anonymous POST request...");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        emailTo: 'support@avesdo.com',
        subject: '[Test] Anonymous Webhook Call',
        projectName: 'Test Project',
        formName: 'Client QA',
        action: 'submitted',
        projectUrl: 'https://avesdo-cs-hub.web.app',
        body: 'This is an anonymous test from Node.js to verify if the webhook executes for unauthenticated users.'
      }),
      redirect: 'manual' // Just see the initial 302 response
    });
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testWebhook();
