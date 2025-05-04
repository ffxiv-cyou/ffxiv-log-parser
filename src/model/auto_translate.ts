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

type groupType = keyof typeof translates;
type itemType = keyof typeof translates[groupType];

class AutoTranslate extends HTMLElement {
  constructor() {
    super();

    const group = this.getAttribute("group");
    const id = this.getAttribute("cid");
    if (group !== null && id !== null) {

      // I don't know why but offset is needed for some groups
      let groupID = parseInt(group);
      if (groupID > 48) groupID += 2;

      const g = translates[groupID.toString() as groupType];
      if (g) {
        const item = g[id as itemType];
        if (item) {
          this.innerText = item;
          return;
        }
      }

      const groups = Object.keys(translates);
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (parseInt(group) > 48)
          continue;

        const items = translates[group as groupType];
        const cids = Object.keys(items);
        for (let j = 0; j < cids.length; j++) {
          if (id === cids[j]) {
            this.innerText = items[cids[j] as itemType];
            return;
          }
        }
      }

      this.innerText = "Unk (" + group + ", " + id + ")";
    }
  }
}

customElements.define("auto-translate", AutoTranslate);
