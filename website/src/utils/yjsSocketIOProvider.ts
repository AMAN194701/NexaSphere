import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import * as awarenessProtocol from "y-protocols/awareness";

export class YjsSocketIOProvider {
  doc: Y.Doc;
  socket: any;
  roomId: string;
  awareness: Awareness;

  private _onDocUpdate: (update: Uint8Array, origin: any) => void;
  private _onAwarenessUpdate: (params: any) => void;
  private _onSocketYjsUpdate: (updateBuffer: ArrayBuffer | Uint8Array) => void;
  private _onSocketYjsAwareness: (update: ArrayBuffer | Uint8Array) => void;

  constructor(doc: Y.Doc, socket: any, roomId: string, user: any) {
    this.doc = doc;
    this.socket = socket;
    this.roomId = roomId;
    this.awareness = new Awareness(doc);

    // Set local presence state
    this.awareness.setLocalState({
      user: {
        name: user.name,
        color: user.color,
        initials: user.initials,
      },
      cursor: null,
      isTyping: false,
    });

    // Define listeners
    this._onDocUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        this.socket.emit("yjs_update", roomId, update);
      }
    };

    this._onSocketYjsUpdate = (updateBuffer: ArrayBuffer | Uint8Array) => {
      Y.applyUpdate(this.doc, new Uint8Array(updateBuffer), this);
    };

    this._onAwarenessUpdate = ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const update = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        changedClients
      );
      this.socket.emit("yjs_awareness", roomId, update);
    };

    this._onSocketYjsAwareness = (update: ArrayBuffer | Uint8Array) => {
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(update),
        this
      );
    };

    // 1. Listen to document updates and send to server
    this.doc.on("update", this._onDocUpdate);

    // 2. Listen to incoming document updates from server
    this.socket.on("yjs_update", this._onSocketYjsUpdate);

    // 3. Listen to local awareness updates and send to server
    this.awareness.on("update", this._onAwarenessUpdate);

    // 4. Listen to remote awareness updates from server
    this.socket.on("yjs_awareness", this._onSocketYjsAwareness);

    // Request initial document state from server
    this.socket.emit("yjs_sync_request", { roomId });
  }

  destroy() {
    this.doc.off("update", this._onDocUpdate);
    this.socket.off("yjs_update", this._onSocketYjsUpdate);
    this.socket.off("yjs_awareness", this._onSocketYjsAwareness);
    this.awareness.off("update", this._onAwarenessUpdate);
    this.awareness.destroy();
  }
}
