import { ChatGPTUnofficialProxyAPI } from "chatgpt";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

const db = new LowSync(new JSONFileSync("db.json"), {});
db.read();

class ChatGPT {
  debug;
  db;
  api;
  parentMessageId;
  conversationId;
  timeoutMs;
  systemMessage;

  constructor(db, api, parentMessageId, conversationId, debug = false) {
    this.debug = debug;
    this.parentMessageId = parentMessageId;
    this.conversationId = conversationId;
    this.timeoutMs = 5 * 60 * 1000;
    this.systemMessage = "";
    this.api = api;
    this.db = db;
  }

  setParentMessageId(parentMessageId) {
    if (this.debug) {
      console.log("setParentMessageId", parentMessageId);
    }

    this.parentMessageId = parentMessageId;
    this.db.data.parentMessageId = parentMessageId;
    this.db.write();
  }

  setState(res) {
    this.setParentMessageId(res.id);
  }

  catchError(err) {
    if (this.debug) {
      console.log("catchError", err);
    }

    return {
      error: err.message,
      message: "",
    };
  }

  handleResponse(res) {
    if (this.debug) {
      console.log("handleResponse", res);
    }

    this.setState(res);
    return {
      error: "",
      message: res.text,
    };
  }

  async sendMessage(message) {
    try {
      const res = await api.sendMessage(message, {
        parentMessageId: this.parentMessageId,
        conversationId: this.conversationId,
        timeoutMs: this.timeoutMs,
      });

      return this.handleResponse(res);
    } catch (err) {
      return this.catchError(err);
    }
  }

  async sendNext() {
    try {
      const res = await api.sendMessage("", {
        parentMessageId: this.parentMessageId,
        conversationId: this.conversationId,
        timeoutMs: this.timeoutMs,
        action: "next",
      });

      return this.handleResponse(res);
    } catch (err) {
      return this.catchError(err);
    }
  }
}

const parentMessageId = db.data.parentMessageId;
const conversationId = db.data.conversationId;
const api = new ChatGPTUnofficialProxyAPI({
  accessToken: db.data.accessToken,
  apiReverseProxyUrl: db.data.apiReverseProxyUrl,
});

const chatGPT = new ChatGPT(
  db,
  api,
  parentMessageId,
  conversationId,
  db.data.debug
);
const sendMessage = async (message) => {
  const res = await chatGPT.sendMessage(message);
  return res;
};

const sendNext = async () => {
  const res = await chatGPT.sendNext();
  return res;
};

export { sendMessage, sendNext };
