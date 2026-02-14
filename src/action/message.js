import { MessageBuilder } from "seishiro"

// Set Your Variable Message
const message = new MessageBuilder("en")
// Default Variable Message
message.set("no-response-sending", "Server not response!")
message.set("no-registry", "Registry not found!")
message.set("internal-server-error", "Internal server error!")
// Costum Variable Message

export default message