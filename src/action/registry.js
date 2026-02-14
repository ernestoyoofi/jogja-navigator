import { RegistryBuilder } from "seishiro"

const registry = new RegistryBuilder()

// User
registry.set("user:getauth", null)         // Login
registry.set("user:profile", null, null)   // Get Profile
// Chat
registry.set("chat:history", null, null)   // History Chat
registry.set("chat:delete", null, null)    // Delete Chat
registry.set("chat:load", null, null)      // Load History Chat
registry.set("chat:submit", null, null)    // Submit Chat / New Conversation
// Location
registry.set("location:add-list", null, null)  // Add Location List
registry.set("location:rm-list", null, null)   // Remove Location List
registry.set("location:rating", null, null)    // Rating Location List (Checklist)

export default registry