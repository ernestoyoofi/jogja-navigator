
import Chat_Submit from "../src/controllers/chat-submit.js";

async function runTest() {
  console.log("Starting Chat_Submit Test (3 Iterations)...");

  const mockMiddleware = {
    profile: {
      id: "test-user-id-123",
      username: "TestUser"
    }
  };

  const mockData = {
    id: "6900808b73685a947974686b", // Valid ObjectId format
    message: "Cari tempat makan gudeg enak yang buka sekarang",
    latitude: -7.7956, // Malioboro area
    longitude: 110.3695
  };

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    try {
      const result = await Chat_Submit({
        system: {},
        middleware: mockMiddleware,
        data: mockData
      });

      console.log("Result:", JSON.stringify(result, null, 2));

      if (result.error) {
        console.error(`Iteration ${i} Failed with error:`, result.error);
      } else if (result.data?.summary || result.data?.buttons) {
        console.log(`Iteration ${i} Success!`);
      } else {
        console.warn(`Iteration ${i} returned unexpected format.`);
      }

    } catch (error) {
      console.error(`Iteration ${i} Error Exception:`, error);
    }

    // Optional delay to avoid rate limits if any
    if (i < 3) await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\nTest Completed.");
}

runTest();
