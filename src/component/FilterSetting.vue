<template>
    <dialog ref="dialog">
        <div class="filter-setting">
            <div
                v-for="(group, gid) in filterList"
                class="pure-form pure-form-stacked filter-group"
            >
                <legend>
                    <label :for="'group-' + gid">
                        <input
                            type="checkbox"
                            :id="'group-' + gid"
                            :checked="getGroupFilter(gid)"
                            @input="onGroupInput($event, gid)"
                        />
                        {{ groupName[gid] }}
                    </label>
                </legend>
                <fieldset class="option-group">
                    <label
                        class="option-item"
                        v-for="(item, index) in group"
                        :for="'filter-' + item.ID"
                    >
                        <input
                            type="checkbox"
                            :id="'filter-' + item.ID"
                            :checked="getFilter(item.ID)"
                            @input="onFilterInput($event, item.ID)"
                        />
                        {{ item.Name }}
                    </label>
                </fieldset>
            </div>
        </div>
        <button @click="hide" class="pure-button close-button">关闭</button>
    </dialog>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-facing-decorator'
import FilterList from '@/assets/LogFilter.json'
import type { LogFilter } from '@/model/filter';

@Component
export default class FilterSettingComponent extends Vue {
    @Ref
    dialog!: HTMLDialogElement;

    @Prop
    filter: Map<number, boolean> = new Map<number, boolean>();

    groupName = ["聊天", "系统", "战斗"];
    get filterList(): LogFilter[][] {
        return FilterList;
    }

    setFilter(id: number, val: boolean) {
        this.filter.set(id, val);
    }

    getFilter(id: number): boolean {
        return this.filter.get(id) === true;
    }

    onFilterInput(evt: Event, id: number) {
        this.setFilter(id, (evt.target as HTMLInputElement).checked);
    }

    groupState = [false, false, false];
    getGroupFilter(id: number) {
        return this.groupState[id];
    }

    setGroupFilter(id: number, val: boolean) {
        this.groupState[id] = val;
        for (let i = 0; i < FilterList[id].length; i++) {
            this.setFilter(FilterList[id][i].ID, val);
        }
    }

    onGroupInput(evt: Event, id: number) {
        this.setGroupFilter(id, (evt.target as HTMLInputElement).checked);
    }

    mounted() {
        this.setGroupFilter(0, true);
        this.setGroupFilter(1, true);
    }

    public show() {
        this.dialog.showModal();
    }

    hide() {
        this.dialog.close();
    }
}

</script>

<style>
.option-group {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 13.2em;
}

.option-item {
    flex: 0;
}

.filter-setting {
    display: flex;
    flex-wrap: wrap;
    width: 1280px;
}

.filter-group {
    flex: auto;
}

.close-button {
    position: absolute;
    right: 10px;
    bottom: 10px;
}
</style>