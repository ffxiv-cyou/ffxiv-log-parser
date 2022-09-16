export class AutoTranslateItem {
    ID!: number
    Name!: string
}

export class AutoTranslateGroup {
    GroupID!: number
    Name!: string
    Items!: AutoTranslateItem[]
}

import translates from "@/assets/AutoComplete.json";

class AutoTranslate extends HTMLElement {
    constructor() {
        // 必须首先调用 super 方法
        super();

        // 元素的功能代码写在这里
        // ref: https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements
        var group = this.getAttribute('group');
        var id = this.getAttribute('cid');
        if (group && id) {
            var groupID = parseInt(group);
            var itemID = parseInt(id);
            this.innerText = (translates as any)[groupID][itemID];
        }
    }
}

customElements.define('auto-translate', AutoTranslate);