import { RegistryBuilder } from "seishiro";

// 🪄 Controllers
// Chat
import Chat_Delete from "@/controllers/chat-delete";
import Chat_History from "@/controllers/chat-history";
import Chat_Load from "@/controllers/chat-load";
import Chat_Submit from "@/controllers/chat-submit";
// User
import User_GetAuth from "@/controllers/user-getauth";
import User_Profile from "@/controllers/user-profile";
// Location
import Location_AddList from "@/controllers/location-add-list";
import Location_List from "@/controllers/location-list";
import Location_RmList from "@/controllers/location-rm-list";
import Location_Rating from "@/controllers/location-rating";
// 🪄 Middlewares
import Middleware_Auth from "@/middlewares/auth";

const registry = new RegistryBuilder();

// User
registry.set("user:getauth", User_GetAuth); // Login
registry.set("user:profile", User_Profile, Middleware_Auth); // Get Profile
// Chat
registry.set("chat:history", Chat_History, Middleware_Auth); // History Chat
registry.set("chat:delete", Chat_Delete, Middleware_Auth); // Delete Chat
registry.set("chat:load", Chat_Load, Middleware_Auth); // Load History Chat
registry.set("chat:submit", Chat_Submit, Middleware_Auth); // Submit Chat / New Conversation
// Location
registry.set("location:list", Location_List, Middleware_Auth); // List Location
registry.set("location:add-list", Location_AddList, Middleware_Auth); // Add Location List
registry.set("location:rm-list", Location_RmList, Middleware_Auth); // Remove Location List
registry.set("location:rating", Location_Rating, Middleware_Auth); // Rating Location List (Checklist)

export default registry;
