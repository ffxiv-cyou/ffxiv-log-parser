<script lang="ts">
  import filterList from "@/assets/LogFilter.json";
  let dialog!: HTMLDialogElement;

  let {
    filter,
  }: {
    filter: Map<number, boolean>;
  } = $props();

  let groupName = ["聊天", "系统", "战斗"];
  function setFilter(id: number, val: boolean) {
    filter.set(id, val);
  }

  function getFilter(id: number): boolean {
    return filter.get(id) === true;
  }

  function onFilterInput(evt: Event, id: number) {
    setFilter(id, (evt.target as HTMLInputElement).checked);
  }

  let groupState = [false, false, false];
  function getGroupFilter(id: number) {
    return groupState[id];
  }

  function setGroupFilter(id: number, val: boolean) {
    groupState[id] = val;
    for (let i = 0; i < filterList[id].length; i++) {
      setFilter(filterList[id][i].ID, val);
    }
  }

  function onGroupInput(evt: Event, id: number) {
    setGroupFilter(id, (evt.target as HTMLInputElement).checked);
  }

  export function show() {
    dialog.showModal();
  }

  function hide() {
    dialog.close();
  }

  setGroupFilter(0, true);
  setGroupFilter(1, true);
</script>

<dialog bind:this={dialog}>
  <div class="filter-setting">
    {#each filterList as group, gid}
      <div class="pure-form pure-form-stacked filter-group">
        <legend>
          <label for={"group-" + gid}>
            <input
              id={"group-" + gid}
              type="checkbox"
              checked={getGroupFilter(gid)}
              oninput={(evt) => onGroupInput(evt, gid)}
            />
            {groupName[gid]}
          </label>
        </legend>
        <fieldset class="option-group">
          {#each group as item}
            <label class="option-item" for={"filter-" + item.ID}>
              <input
                id={"filter-" + item.ID}
                type="checkbox"
                checked={getFilter(item.ID)}
                oninput={(evt) => onFilterInput(evt, item.ID)}
              />
              {item.Name}
            </label>
          {/each}
        </fieldset>
      </div>
    {/each}
  </div>
  <button class="pure-button close-button" onclick={hide}>关闭</button>
</dialog>

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
