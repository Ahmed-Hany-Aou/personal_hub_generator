import fs from 'fs';

async function testLegacyConversion() {
    const legacyConfig = {
        fullName: "Legacy User",
        jobTitle: "Old Role",
        accentColor: "#ff0000",
        landingPage: {
            theme: "glass",
            components: [
                { type: "profile", data: { name: "Legacy User", jobTitle: "Old Role" } }
            ]
        }
    };

    console.log("🧪 Testing Legacy Conversion...");

    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(legacyConfig)
        });

        if (response.ok) {
            console.log("✅ Success: Server accepted legacy config and returned 200 OK.");
            const buffer = await response.arrayBuffer();
            fs.writeFileSync('legacy_test_result.zip', Buffer.from(buffer));
            console.log("📦 ZIP saved as legacy_test_result.zip for verification.");
        } else {
            const error = await response.json();
            console.error("❌ Failed: Server returned status", response.status, error);
        }
    } catch (err) {
        console.error("❌ Error during request:", err.message);
    }
}

testLegacyConversion();
