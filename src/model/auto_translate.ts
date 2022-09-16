export class AutoTranslateItem {
  ID!: number;
  Name!: string;
}

export class AutoTranslateGroup {
  GroupID!: number;
  Name!: string;
  Items!: AutoTranslateItem[];
}

import translates from "@/assets/AutoComplete.json";

class AutoTranslate extends HTMLElement {
  constructor() {
    super();

    const group = this.getAttribute("group");
    const id = this.getAttribute("cid");
    if (group && id) {
      const groupID = parseInt(group);
      const itemID = parseInt(id);
      this.innerText = (translates as any)[groupID][itemID];
    }
  }
}

customElements.define("auto-translate", AutoTranslate);
